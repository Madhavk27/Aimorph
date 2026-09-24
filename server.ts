import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Body parsers with large limit for image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy GoogleGenAI initialization
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set in environment.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// ----------------------------------------------------
// 1. Health Checks (for both /api/health and /api/gemini/health)
// ----------------------------------------------------
const handleHealthCheck = (req: express.Request, res: express.Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  res.setHeader('Content-Type', 'application/json');
  res.json({
    status: 'ok',
    hasKey,
    geminiConfigured: hasKey,
    timestamp: new Date().toISOString(),
  });
};

app.get('/api/health', handleHealthCheck);
app.get('/api/gemini/health', handleHealthCheck);

// ----------------------------------------------------
// 1.5. Vehicle Detection & Multimodal Vision Analysis (gemini-3.7-flash)
// ----------------------------------------------------
app.post('/api/gemini/analyze-vehicle', async (req, res) => {
  try {
    const { image, imageUrl } = req.body;
    if (!image && !imageUrl) {
      return res.status(400).json({
        error: 'Image data is required for vehicle analysis',
        vehicleDetected: false,
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Vision API not connected: GEMINI_API_KEY is not configured in server environment.',
        vehicleDetected: false,
        apiConnected: false,
      });
    }

    const ai = getAI();
    let imagePart: any = null;

    if (image && typeof image === 'string' && image.startsWith('data:image/')) {
      const mimeType = image.split(';')[0].replace('data:', '') || 'image/jpeg';
      const cleanBase64 = image.replace(/^data:image\/[a-z]+;base64,/, '');
      imagePart = {
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      };
    } else if (image && typeof image === 'string' && !image.startsWith('http')) {
      imagePart = {
        inlineData: {
          mimeType: 'image/jpeg',
          data: image,
        },
      };
    } else if (imageUrl || (image && typeof image === 'string' && image.startsWith('http'))) {
      const urlToFetch = imageUrl || image;
      try {
        const fetchRes = await fetch(urlToFetch);
        if (fetchRes.ok) {
          const arrayBuffer = await fetchRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const contentType = fetchRes.headers.get('content-type') || 'image/jpeg';
          imagePart = {
            inlineData: {
              mimeType: contentType,
              data: buffer.toString('base64'),
            },
          };
        } else {
          return res.status(400).json({
            error: `Failed to fetch vehicle image from URL (HTTP ${fetchRes.status})`,
            vehicleDetected: false,
          });
        }
      } catch (fetchErr: any) {
        return res.status(400).json({
          error: `Could not load image URL: ${fetchErr.message}`,
          vehicleDetected: false,
        });
      }
    }

    if (!imagePart) {
      return res.status(400).json({
        error: 'Invalid image format provided',
        vehicleDetected: false,
      });
    }

    const systemInstruction = `You are AutoMorph AI's Master Automotive Vision & Vehicle Identification System.
Analyze the provided image carefully and extract factual vehicle information.
CRITICAL RULES:
1. Detect if a real vehicle (car, SUV, truck, coupe, motorcycle, etc.) is present in the image. Set "vehicleDetected" to true or false.
2. Identify the Make and Model ONLY if clearly identifiable from the styling, badges, headlights, or body lines.
3. If the make/model is NOT clearly identifiable or you are uncertain, set "make" to "Unknown" and "model" to "Unknown". NEVER invent, hallucinate, or guess random car models.
4. Detect the vehicleType: "SUV" | "Coupe" | "Sedan" | "Off-Road 4x4" | "Hatchback" | "Truck" | "Supercar" | "Sports Car" | "Unknown".
5. Detect genuine confidence score between 0.00 and 1.00.
6. Detect visibleParts as an array of strings listing clearly visible exterior components, e.g. ["headlights", "grille", "wheels", "body", "hood", "spoiler", "mirrors"].
7. Respond ONLY in valid JSON matching this exact structure:
{
  "vehicleDetected": true,
  "make": "Toyota",
  "model": "Supra",
  "vehicleType": "Sports Car",
  "confidence": 0.96,
  "visibleParts": [
    "headlights",
    "grille",
    "wheels",
    "body"
  ]
}`;

    let parsedResult: any = null;
    let modelUsed = 'gemini-3.7-flash';

    // Candidate vision models in order of priority
    const visionCandidates = [
      'gemini-3.7-flash',
      'gemini-3.6-flash',
      'gemini-flash-latest',
      'gemini-3.1-flash-lite',
    ];

    let lastErrorMsg = '';

    for (const candidateModel of visionCandidates) {
      try {
        console.log(`[Vision API] Attempting vehicle analysis with model: ${candidateModel}`);
        const response = await ai.models.generateContent({
          model: candidateModel,
          contents: [
            {
              parts: [
                imagePart,
                {
                  text: 'Analyze this image. Detect if a vehicle is present, identify the genuine make and model if known, and extract visible automotive parts according to instructions.',
                },
              ],
            },
          ],
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });

        const text = response.text || '';
        if (text) {
          // Attempt JSON parse
          const cleanText = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
          parsedResult = JSON.parse(cleanText);
          modelUsed = candidateModel;
          console.log(`[Vision API] Successfully analyzed vehicle with ${candidateModel}`);
          break;
        }
      } catch (modelErr: any) {
        lastErrorMsg = modelErr.message || String(modelErr);
        console.warn(`[Vision API] Model ${candidateModel} failed:`, lastErrorMsg);
        // Small delay if 503 or 429
        if (lastErrorMsg.includes('503') || lastErrorMsg.includes('429') || lastErrorMsg.includes('demand')) {
          await new Promise((r) => setTimeout(r, 400));
        }
      }
    }

    if (!parsedResult) {
      console.error('[Vision API] All vision candidates failed:', lastErrorMsg);
      return res.status(500).json({
        error: `Vision API analysis failed: ${lastErrorMsg || 'All vision models unavailable'}`,
        vehicleDetected: false,
      });
    }

    // Ensure formatted output adheres strictly to requested contract
    const formattedResponse = {
      vehicleDetected: Boolean(parsedResult.vehicleDetected),
      make: parsedResult.make || (parsedResult.vehicleDetected ? 'Unknown' : 'Unknown'),
      model: parsedResult.model || (parsedResult.vehicleDetected ? 'Unknown' : 'Unknown'),
      vehicleType: parsedResult.vehicleType || 'Vehicle',
      confidence: typeof parsedResult.confidence === 'number'
        ? (parsedResult.confidence > 1 ? parsedResult.confidence / 100 : parsedResult.confidence)
        : 0.9,
      visibleParts: Array.isArray(parsedResult.visibleParts)
        ? parsedResult.visibleParts
        : ['headlights', 'grille', 'wheels', 'body'],
      modelUsed,
    };

    return res.json(formattedResponse);
  } catch (error: any) {
    console.error('Vehicle analysis server error:', error);
    res.status(500).json({
      error: error.message || 'Vehicle analysis encountered an unhandled error',
      vehicleDetected: false,
    });
  }
});

// ----------------------------------------------------
// ----------------------------------------------------
// Helper: Resolve image inputs (base64 data URL, raw base64, or remote URL)
// ----------------------------------------------------
async function resolveImageToInlineData(imageInput: string): Promise<{ mimeType: string; data: string } | null> {
  if (!imageInput || typeof imageInput !== 'string') return null;

  if (imageInput.startsWith('data:image/')) {
    const mimeType = imageInput.split(';')[0].replace('data:', '') || 'image/jpeg';
    const data = imageInput.replace(/^data:image\/[a-z0-9-+.]+;base64,/, '');
    return { mimeType, data };
  }

  if (imageInput.startsWith('http://') || imageInput.startsWith('https://')) {
    try {
      const fetchRes = await fetch(imageInput);
      if (fetchRes.ok) {
        const arrayBuffer = await fetchRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = fetchRes.headers.get('content-type') || 'image/jpeg';
        return { mimeType, data: buffer.toString('base64') };
      }
    } catch (err) {
      console.warn('Failed to fetch remote image URL for Gemini editing:', err);
    }
  }

  // Raw base64 string
  if (imageInput.length > 50) {
    return { mimeType: 'image/jpeg', data: imageInput };
  }

  return null;
}

// ----------------------------------------------------
// 2. AI Image Generation & Localized Vehicle Modification (gemini-3.1-flash-image)
// ----------------------------------------------------
app.post('/api/gemini/modify-vehicle', async (req, res) => {
  try {
    const {
      baseImage,
      modificationType,
      modificationValue,
      vehicle,
      buildDna,
      instructionOverride,
    } = req.body;

    if (!baseImage) {
      return res.status(400).json({ error: 'Base vehicle image is required for modification' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Gemini image editing is not available with the current API configuration. GEMINI_API_KEY is missing in server environment.',
        apiConnected: false,
      });
    }

    const ai = getAI();
    const make = vehicle?.make && vehicle.make !== 'Unknown' ? vehicle.make : 'vehicle';
    const model = vehicle?.model && vehicle.model !== 'Unknown' ? vehicle.model : '';
    const carName = `${make} ${model}`.trim();

    // Prepare Build DNA state description
    const dnaLines = [
      `Vehicle: ${carName}`,
      buildDna?.paint ? `Paint: ${buildDna.paint}` : '',
      buildDna?.wheels ? `Wheels: ${buildDna.wheels}` : '',
      buildDna?.grille ? `Grille: ${buildDna.grille}` : '',
      buildDna?.style ? `Style: ${buildDna.style}` : '',
      buildDna?.headlights ? `Headlights: ${buildDna.headlights}` : '',
      buildDna?.tint ? `Window Tint: ${buildDna.tint}` : '',
      buildDna?.rideHeight ? `Ride Height: ${buildDna.rideHeight}` : '',
      buildDna?.spoiler ? `Spoiler: ${buildDna.spoiler}` : '',
      buildDna?.bodyKit ? `Body Kit: ${buildDna.bodyKit}` : '',
      buildDna?.roof ? `Roof: ${buildDna.roof}` : '',
      buildDna?.mirrors ? `Mirrors: ${buildDna.mirrors}` : '',
      buildDna?.exhaust ? `Exhaust: ${buildDna.exhaust}` : '',
      buildDna?.offroad ? `Off-Road: ${buildDna.offroad}` : '',
    ].filter(Boolean).join('; ');

    // Craft targeted localized editing instruction targeting only the requested component
    let localizedInstruction = '';

    if (instructionOverride) {
      localizedInstruction = instructionOverride;
    } else {
      switch (modificationType) {
        case 'paint':
          localizedInstruction = `Edit the provided vehicle image. Change ONLY the vehicle body paint to glossy ${modificationValue}. Preserve the exact ${carName} make and model, body proportions, headlights, grille, windows, wheels, camera angle, environment and reflections. Do not replace the vehicle. Do not modify the background.`;
          break;
        case 'wheels':
          localizedInstruction = `Edit ONLY the wheels of the provided vehicle. Replace the existing wheels with ${modificationValue} while preserving the exact vehicle, body geometry, tires, lighting, camera angle and environment.`;
          break;
        case 'grille':
          localizedInstruction = `Edit ONLY the front grille. Apply ${modificationValue} treatment while preserving the exact vehicle and all other visual elements.`;
          break;
        case 'headlights':
          localizedInstruction = `Edit ONLY the headlights of the provided vehicle. Upgrade to ${modificationValue} while preserving the exact vehicle body, paint, and background.`;
          break;
        case 'tint':
          localizedInstruction = `Edit ONLY the window glass. Apply ${modificationValue} privacy window tint while preserving the vehicle paint, wheels, and background.`;
          break;
        case 'rideHeight':
          localizedInstruction = `Edit ONLY the suspension stance. Adjust the vehicle stance to ${modificationValue} while keeping the exact body and wheel geometry.`;
          break;
        case 'bodyKit':
          localizedInstruction = `Apply ${modificationValue} aerodynamic styling to this ${carName} while keeping original vehicle identity, chassis lines, and background.`;
          break;
        case 'spoiler':
          localizedInstruction = `Add a ${modificationValue} on the rear trunk while preserving the rest of the car, camera perspective, and background.`;
          break;
        case 'roof':
          localizedInstruction = `Change the roof finish to ${modificationValue} while preserving the rest of the car.`;
          break;
        case 'mirrors':
          localizedInstruction = `Modify the side mirror caps to ${modificationValue} while preserving the rest of the car.`;
          break;
        case 'exhaust':
          localizedInstruction = `Modify the rear exhaust tips to ${modificationValue}.`;
          break;
        case 'offroad':
          localizedInstruction = `Add ${modificationValue} rugged off-road enhancements to this ${carName} while preserving original identity.`;
          break;
        default:
          localizedInstruction = `Apply ${modificationValue} styling to this ${carName}. Preserve the exact chassis lines, camera angle, lighting, and background while rendering photorealistic modifications.`;
          break;
      }
    }

    const fullPrompt = `${localizedInstruction}

Current Build DNA:
${dnaLines}

Strict Rules:
1. Treat the uploaded image as the primary visual reference.
2. Preserve the exact vehicle geometry, perspective, reflections, and scene.
3. Modify only the requested component.
4. Output a pristine 8K photorealistic automotive studio image.`;

    const inlineImage = await resolveImageToInlineData(baseImage);
    if (!inlineImage) {
      return res.status(400).json({ error: 'Unable to parse vehicle image data for editing.' });
    }

    // Helper to attempt image generation with a specific Gemini model
    const tryGenerateWithModel = async (modelName: string) => {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: inlineImage.mimeType,
                  data: inlineImage.data,
                },
              },
              {
                text: fullPrompt,
              },
            ],
          },
        ],
      });

      for (const candidate of response.candidates || []) {
        for (const part of candidate.content?.parts || []) {
          if (part.inlineData && part.inlineData.data) {
            return {
              data: part.inlineData.data,
              mimeType: part.inlineData.mimeType || 'image/jpeg',
            };
          }
        }
      }
      return null;
    };

    // Try primary high-quality model (gemini-3.1-flash-image), fallback to gemini-3.1-flash-lite-image
    let resultImage: { data: string; mimeType: string } | null = null;
    let successfulModel = 'gemini-3.1-flash-image';
    let lastError: any = null;

    try {
      resultImage = await tryGenerateWithModel('gemini-3.1-flash-image');
    } catch (err: any) {
      lastError = err;
      console.warn('gemini-3.1-flash-image failed in modify-vehicle, attempting gemini-3.1-flash-lite-image:', err.message || err);
      try {
        resultImage = await tryGenerateWithModel('gemini-3.1-flash-lite-image');
        if (resultImage) {
          successfulModel = 'gemini-3.1-flash-lite-image';
        }
      } catch (fallbackErr: any) {
        console.error('gemini-3.1-flash-lite-image also failed in modify-vehicle:', fallbackErr.message || fallbackErr);
        lastError = fallbackErr;
      }
    }

    if (resultImage) {
      return res.json({
        imageUrl: `data:${resultImage.mimeType};base64,${resultImage.data}`,
        model: successfulModel,
        modificationType,
        modificationValue,
      });
    }

    const errMessage = lastError?.message || String(lastError || 'No image returned');
    let userFriendlyError = `Gemini visual modification error: ${errMessage}`;

    if (
      errMessage.includes('API key') ||
      errMessage.includes('PERMISSION_DENIED') ||
      errMessage.includes('403') ||
      errMessage.includes('unregistered')
    ) {
      userFriendlyError = 'Gemini image editing requires a configured project API key. Please check your key in the Settings menu.';
    } else if (errMessage.includes('RESOURCE_EXHAUSTED') || errMessage.includes('429')) {
      userFriendlyError = 'Gemini image editing quota temporarily reached on the free tier. Please attach a billing-enabled API key or wait a few seconds before retrying.';
    }

    return res.status(429).json({
      error: userFriendlyError,
      quotaExceeded: errMessage.includes('RESOURCE_EXHAUSTED') || errMessage.includes('429'),
      retryDelay: lastError?.details?.[0]?.retryDelay || '30s',
    });
  } catch (error: any) {
    console.error('modify-vehicle endpoint error:', error);
    res.status(500).json({
      error: `Server error during vehicle modification: ${error.message || 'Unknown error'}`,
    });
  }
});

app.post('/api/gemini/generate-image', async (req, res) => {
  try {
    const { prompt, baseImage, vehicleInfo, buildDna, style, aspectRatio = '16:9' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt or customization specifications are required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Gemini image editing is not available with the current API configuration. GEMINI_API_KEY is missing in server environment.',
        apiConnected: false,
      });
    }

    const ai = getAI();
    const carName =
      vehicleInfo?.make && vehicleInfo.make !== 'Unknown'
        ? `${vehicleInfo.make} ${vehicleInfo.model || ''}`.trim()
        : 'custom vehicle';

    const dnaLines = buildDna
      ? [
          `Vehicle: ${carName}`,
          buildDna.paint ? `Paint: ${buildDna.paint}` : '',
          buildDna.wheels ? `Wheels: ${buildDna.wheels}` : '',
          buildDna.grille ? `Grille: ${buildDna.grille}` : '',
          buildDna.style ? `Style: ${buildDna.style}` : '',
          buildDna.lights ? `Lights: ${buildDna.lights}` : '',
          buildDna.bodyKit ? `Body Kit: ${buildDna.bodyKit}` : '',
        ].filter(Boolean).join('; ')
      : '';

    const refinedPrompt = `Photorealistic 8K automotive visualization, cinematic automotive studio photography of ${carName}: ${prompt}.
Current Build DNA: ${dnaLines || 'Custom Spec'}.
Studio lighting, ultra-detailed reflections, sharp metallic highlights, pristine fitment.`;

    // Helper for generateContent
    const runGeneration = async (contents: any[]) => {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-image',
          contents,
        });
        for (const candidate of response.candidates || []) {
          for (const part of candidate.content?.parts || []) {
            if (part.inlineData && part.inlineData.data) {
              return {
                data: part.inlineData.data,
                mimeType: part.inlineData.mimeType || 'image/jpeg',
                model: 'gemini-3.1-flash-image',
              };
            }
          }
        }
      } catch (e: any) {
        console.warn('gemini-3.1-flash-image failed, trying gemini-3.1-flash-lite-image:', e.message || e);
        const liteResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents,
        });
        for (const candidate of liteResponse.candidates || []) {
          for (const part of candidate.content?.parts || []) {
            if (part.inlineData && part.inlineData.data) {
              return {
                data: part.inlineData.data,
                mimeType: part.inlineData.mimeType || 'image/jpeg',
                model: 'gemini-3.1-flash-lite-image',
              };
            }
          }
        }
      }
      return null;
    };

    // 1. If base image is provided, perform image-to-image editing
    if (baseImage) {
      const inlineImage = await resolveImageToInlineData(baseImage);
      if (inlineImage) {
        try {
          const result = await runGeneration([
            {
              parts: [
                {
                  inlineData: {
                    mimeType: inlineImage.mimeType,
                    data: inlineImage.data,
                  },
                },
                {
                  text: `Edit the provided vehicle image according to these custom tuning specifications: ${refinedPrompt}. Maintain the exact body structure, perspective, and reflections while applying the custom paint, wheels, grille, and styling.`,
                },
              ],
            },
          ]);

          if (result) {
            return res.json({
              imageUrl: `data:${result.mimeType};base64,${result.data}`,
              model: result.model,
            });
          }
        } catch (err: any) {
          console.error('Gemini image-to-image error in generate-image:', err);
          const errMsg = err.message || String(err);
          let userFriendlyError = `Gemini visual rendering error: ${errMsg}`;
          if (errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('429')) {
            userFriendlyError = 'Gemini image generation quota temporarily reached. Please retry in a few moments or attach a billing-enabled key.';
            return res.status(429).json({ error: userFriendlyError, quotaExceeded: true });
          }
          return res.status(500).json({ error: userFriendlyError });
        }
      }
    }

    // 2. Text-to-image
    try {
      const result = await runGeneration([
        {
          parts: [
            {
              text: refinedPrompt,
            },
          ],
        },
      ]);

      if (result) {
        return res.json({
          imageUrl: `data:${result.mimeType};base64,${result.data}`,
          model: result.model,
        });
      }

      return res.status(500).json({
        error: 'Gemini image generation model did not return image data.',
      });
    } catch (genErr: any) {
      console.error('Gemini text-to-image error in generate-image:', genErr);
      const errMsg = genErr.message || String(genErr);
      let userFriendlyError = `Gemini image generation error: ${errMsg}`;
      if (errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('429')) {
        userFriendlyError = 'Gemini image generation quota temporarily reached. Please retry in a few moments or attach a billing-enabled key.';
        return res.status(429).json({ error: userFriendlyError, quotaExceeded: true });
      }
      return res.status(500).json({ error: userFriendlyError });
    }
  } catch (error: any) {
    console.error('Image endpoint error:', error);
    res.status(500).json({
      error: `Server error generating image: ${error.message || 'Unknown error'}`,
    });
  }
});

// ----------------------------------------------------
// 3. AI Video Generation with Veo (veo-3.1-fast-generate-preview)
// ----------------------------------------------------
const pendingOperations: Record<string, any> = {};

app.post('/api/gemini/generate-video', async (req, res) => {
  try {
    const { prompt, baseImage, aspectRatio = '16:9' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getAI();
    let imageParam = undefined;

    if (baseImage) {
      const cleanBase64 = baseImage.replace(/^data:image\/[a-z]+;base64,/, '');
      imageParam = {
        imageBytes: cleanBase64,
        mimeType: 'image/jpeg',
      };
    }

    const videoPrompt = `Cinematic 4K rolling tracking shot of custom modified sports car: ${prompt}. Smooth camera orbit, sun glinting off metallic paint, spinning deep dish wheels, exhaust smoke heat distortion.`;

    const operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: videoPrompt,
      image: imageParam,
      config: {
        aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9',
        durationSeconds: 5,
      },
    });

    if (operation.name) {
      pendingOperations[operation.name] = {
        name: operation.name,
        startedAt: Date.now(),
        status: 'processing',
      };
    }

    res.json({
      operationName: operation.name,
      status: operation.done ? 'completed' : 'processing',
      videoUrl: operation.response?.generatedVideos?.[0]?.video?.uri || null,
    });
  } catch (error: any) {
    console.error('Video generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to start video generation' });
  }
});

app.get('/api/gemini/video-status', async (req, res) => {
  try {
    const { operationName } = req.query;
    if (!operationName || typeof operationName !== 'string') {
      return res.status(400).json({ error: 'operationName query parameter is required' });
    }

    const ai = getAI();
    let updatedOp: any;
    if ((ai as any).operations?.getVideosOperation) {
      updatedOp = await (ai as any).operations.getVideosOperation({
        operation: { name: operationName },
      });
    } else if ((ai as any).models?.getVideosOperation) {
      updatedOp = await (ai as any).models.getVideosOperation({
        operation: { name: operationName },
      });
    } else {
      updatedOp = await (ai as any).getVideosOperation?.({
        operation: { name: operationName },
      });
    }

    const isDone = updatedOp?.done;
    const videoUri = updatedOp?.response?.generatedVideos?.[0]?.video?.uri;

    let downloadUrl = null;
    if (isDone && videoUri) {
      downloadUrl = `/api/gemini/video-download?uri=${encodeURIComponent(videoUri)}`;
    }

    res.json({
      done: isDone,
      videoUri: videoUri || null,
      downloadUrl: downloadUrl,
      error: updatedOp?.error ? updatedOp.error.message : null,
    });
  } catch (error: any) {
    console.error('Video status check error:', error);
    res.status(500).json({ error: error.message || 'Failed to check video status' });
  }
});

app.get('/api/gemini/video-download', async (req, res) => {
  try {
    const { uri } = req.query;
    if (!uri || typeof uri !== 'string') {
      return res.status(400).send('URI required');
    }
    const apiKey = process.env.GEMINI_API_KEY || '';
    const fetchUrl = uri.includes('key=') ? uri : `${uri}${uri.includes('?') ? '&' : '?'}key=${apiKey}`;
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      return res.status(response.status).send('Failed to fetch video stream');
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    res.setHeader('Content-Type', 'video/mp4');
    res.send(buffer);
  } catch (err: any) {
    console.error('Video proxy error:', err);
    res.status(500).send('Error downloading video');
  }
});

// ----------------------------------------------------
// 4. Search Grounding with gemini-3.5-flash (Google Search Grounding)
// ----------------------------------------------------
app.post('/api/gemini/search', async (req, res) => {
  try {
    const { query: searchQuery, carModel, category } = req.body;
    if (!searchQuery) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const ai = getAI();
    const contextualPrompt = `You are AutoMorph AI's Master Automotive Intelligence System.
User query regarding vehicle parts, tuning specs, or market data:
"${searchQuery}"
${carModel ? `Target vehicle: ${carModel}` : ''}
${category ? `Category: ${category}` : ''}

Provide an accurate, highly structured automotive briefing with real-world part numbers, exact wheel fitment specs (bolt pattern, offset, widths), typical performance dyno gains (HP/torque), estimated parts & labor cost in USD, and top tier aftermarket brands.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contextualPrompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.3,
      },
    });

    const text = response.text || '';
    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSearchQueries =
      response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

    res.json({
      answer: text,
      groundingChunks,
      webSearchQueries,
      model: 'gemini-3.5-flash',
    });
  } catch (error: any) {
    console.error('Search grounding error:', error);
    res.status(500).json({ error: error.message || 'Search grounding failed' });
  }
});

// ----------------------------------------------------
// 5. MORPH - AI Automotive Design Assistant
// (gemini-3.5-flash with automotive styling structured extraction)
// ----------------------------------------------------
app.post('/api/morph/assistant', async (req, res) => {
  try {
    const { prompt, carName, currentConfig, conversationHistory = [] } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getAI();
    const systemInstruction = `You are MORPH, the AI Automotive Design Assistant in AutoMorph AI.
Tagline: "Imagine it. I’ll morph it."
Personality:
- Confident, Creative, Concise, Enthusiastic about good automotive builds.
- Friendly, modern, premium automotive tone.
- Speak in punchy, short sentences. Never give long robotic answers.
- Terminology: Saved cars = "Garage", Customization = "Studio", Saved config = "Blueprint", Complete setup = "Build DNA", AI generation = "Morphing", Concept = "Vision".
- Provide an energetic reaction (e.g., "That stance works. 🔥", "Let's build a proper track weapon.", "Going stealth. Let's black it out completely.")
- Provide concrete automotive recommendations for:
  * Paint Finish & Color (e.g. Obsidian Black, Satin Titanium Grey, Candy Metallic Red, Midnight Blue, Frozen Alpine White)
  * Wheel Spec (e.g. 19" Sport Alloy Wheels, 20" Turbine Monoblock, 17" Beadlock Rugged, 18" Stock Alloys)
  * Aero Package (e.g. Sport, Stealth, Off-Road, Luxury, Stock+)
  * Grille & Accents (e.g. Black Grille, Carbon Splitters, Smoked Optics)
  * Stance & Suspension (e.g. -30mm Lowered Track Stance, +50mm Lifted Trail Kit, Flush OEM+)
  * Build DNA string in format: "${carName || 'Vehicle'} • [Paint] • [Wheels] • [Package]"

Always respond in valid JSON with this exact schema:
{
  "reaction": "Short 1-2 sentence confident statement",
  "recommendation": {
    "paintName": "Exact paint name",
    "paintHex": "#0A0A0B or hex code",
    "paintId": "obsidian-black | metallic-grey | racing-red | midnight-blue | factory-white",
    "wheelsName": "Exact wheel name",
    "wheelsSize": "19 Inch / 20 Inch etc",
    "wheelsId": "sport-19 | luxury-20 | off-road-17 | oem-18",
    "aeroPackage": "Sport | Stealth | Luxury | Off-Road | Stock+",
    "aeroId": "sport | stealth | luxury | off-road | stock-plus",
    "grilleAero": "Description of grille & accents",
    "stance": "Suspension drop/lift description",
    "packageStyle": "Street Package / Track Spec / Stealth Ops etc",
    "buildDna": "${carName || 'Vehicle'} • [Paint] • [Wheels] • [Package]",
    "rationale": "1 sentence why this combo hits hard"
  },
  "voiceText": "Under 15 words spoken voice line for MORPH to say"
}`;

    let parsedResponse: any = null;

    try {
      const chatPrompt = `Target vehicle: ${carName || 'Sports Car'}\nCurrent configuration: ${JSON.stringify(currentConfig || {})}\nUser request to MORPH: "${prompt}"`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: chatPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const text = response.text || '';
      parsedResponse = JSON.parse(text);
    } catch (geminiError: any) {
      console.warn('Gemini MORPH processing fallback:', geminiError.message);
    }

    // Heuristic automotive fallback if Gemini call failed or didn't return valid JSON
    if (!parsedResponse || !parsedResponse.recommendation) {
      const lower = prompt.toLowerCase();
      let paintId = 'obsidian-black';
      let paintName = 'Obsidian Black';
      let paintHex = '#0A0A0B';
      let wheelsId = 'sport-19';
      let wheelsName = '19" Sport Alloy Wheels';
      let aeroId = 'sport';
      let aeroPackage = 'Sport';
      let stance = 'Subtle Lowered Stance (-25mm)';
      let grilleAero = 'Gloss Black Honeycomb Grille';
      let packageStyle = 'Premium Street Package';
      let reaction = 'That stance works. 🔥 Your vision is dialed in.';
      let voiceText = 'That stance works. Your preview is ready.';

      if (lower.includes('off-road') || lower.includes('rugged') || lower.includes('lift') || lower.includes('trail')) {
        paintId = 'metallic-grey';
        paintName = 'Satin Dark Titanium';
        paintHex = '#4B5563';
        wheelsId = 'off-road-17';
        wheelsName = '17" Beadlock Rugged';
        aeroId = 'off-road';
        aeroPackage = 'Off-Road';
        stance = '2" Suspension Trail Lift';
        grilleAero = 'Modular Steel Armor & Lightbar';
        packageStyle = 'Overland Conqueror Spec';
        reaction = 'Trail armor locked. 🏔️ Let’s get this rig ready for dirt.';
        voiceText = 'Rugged trail setup applied. Ready to morph.';
      } else if (lower.includes('blackout') || lower.includes('stealth') || lower.includes('dark') || lower.includes('batmobile')) {
        paintId = 'obsidian-black';
        paintName = 'Obsidian Black';
        paintHex = '#0A0A0B';
        wheelsId = 'sport-19';
        wheelsName = '19" Sport Alloy Wheels';
        aeroId = 'stealth';
        aeroPackage = 'Stealth';
        stance = 'Aggressive Track Drop (-35mm)';
        grilleAero = 'Full Chrome Delete & Smoked Optics';
        packageStyle = 'Shadowline Stealth Package';
        reaction = 'Full blackout executed. 🖤 Pure shadow on wheels.';
        voiceText = 'Obsidian blackout locked. Let’s morph it.';
      } else if (lower.includes('red') || lower.includes('race') || lower.includes('track') || lower.includes('gt3')) {
        paintId = 'racing-red';
        paintName = 'Candy Metallic Red';
        paintHex = '#DC2626';
        wheelsId = 'sport-19';
        wheelsName = '19" Sport Alloy Wheels';
        aeroId = 'sport';
        aeroPackage = 'Sport';
        stance = 'Coilover Track Stance (-30mm)';
        grilleAero = 'Carbon Fiber Splitter & Gloss Grille';
        packageStyle = 'Apex Track Spec';
        reaction = 'Candy Red with forged 19s. ⚡ High-velocity aesthetic ready.';
        voiceText = 'Track aero and racing red loaded.';
      } else if (lower.includes('blue') || lower.includes('electric') || lower.includes('indigo')) {
        paintId = 'midnight-blue';
        paintName = 'Midnight Blue';
        paintHex = '#1E3A8A';
        wheelsId = 'luxury-20';
        wheelsName = '20" Turbine Monoblock';
        aeroId = 'luxury';
        aeroPackage = 'Luxury';
        stance = 'Flush Dynamic Stance';
        grilleAero = 'Smoked Chrome Slats';
        packageStyle = 'Midnight Executive Spec';
        reaction = 'Midnight Indigo with 20" Turbines. 💎 Classy with real muscle.';
        voiceText = 'Midnight spec applied. Looking clean.';
      } else if (lower.includes('luxury') || lower.includes('vip') || lower.includes('classy') || lower.includes('executive')) {
        paintId = 'factory-white';
        paintName = 'Factory White Pearl';
        paintHex = '#F8F9FA';
        wheelsId = 'luxury-20';
        wheelsName = '20" Turbine Monoblock';
        aeroId = 'luxury';
        aeroPackage = 'Luxury';
        stance = 'Flush Executive Stance (-15mm)';
        grilleAero = 'Bespoke Smoked Optics & Mirror Caps';
        packageStyle = 'VIP Luxury Package';
        reaction = 'Refined and imposing. 💎 Clean lines with heavyweight presence.';
        voiceText = 'Executive VIP spec ready to visualize.';
      }

      parsedResponse = {
        reaction,
        recommendation: {
          paintName,
          paintHex,
          paintId,
          wheelsName,
          wheelsSize: wheelsName.includes('20') ? '20 Inch' : wheelsName.includes('17') ? '17 Inch' : '19 Inch',
          wheelsId,
          aeroPackage,
          aeroId,
          grilleAero,
          stance,
          packageStyle,
          buildDna: `${carName || 'Vehicle'} • ${paintName} • ${wheelsName.split(' ')[0]} • ${aeroPackage} Package`,
          rationale: 'Balanced stance with high-contrast accents designed for maximum curb appeal.',
        },
        voiceText,
      };
    }

    res.json(parsedResponse);
  } catch (error: any) {
    console.error('MORPH assistant endpoint error:', error);
    res.status(500).json({ error: error.message || 'MORPH assistant encounter error' });
  }
});

// ----------------------------------------------------
// 6. Multi-Turn Chatbot with Model Switching
// (gemini-3.1-pro-preview / gemini-3.5-flash / gemini-3.1-flash-lite)
// ----------------------------------------------------
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, model = 'gemini-3.5-flash', role = 'master-tuner' } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const ai = getAI();

    // Map allowed models securely
    const allowedModels = [
      'gemini-3.1-pro-preview',
      'gemini-3.5-flash',
      'gemini-3.1-flash-lite',
    ];
    const selectedModel = allowedModels.includes(model) ? model : 'gemini-3.5-flash';

    let systemInstruction = `You are AutoMorph AI's Chief Vehicle Architect & Master Tuner.
You specialize in automotive design, track aerodynamics, engine builds, suspension geometry, custom widebody styling, forged wheels, and performance telemetry.
Provide clear, enthusiastic, highly knowledgeable, and technically precise advice. Format your responses with clean Markdown bullet points, bold key components, and estimated cost or horsepower estimates where applicable.`;

    if (role === 'aero-engineer') {
      systemInstruction = `You are a Formula 1 / GT3 Aerodynamics Specialist. Focus deeply on downforce vs drag balance, CFD analysis, carbon fiber splitters, diffusers, active wings, ground effects, and high-speed stability calculations.`;
    } else if (role === 'ecu-specialist') {
      systemInstruction = `You are a Master ECU calibrator and Dyno tuning engineer. Focus on forced induction boost mapping, ignition timing, fuel trims (E85/FlexFuel), turbo upgrades, exhaust backpressure, and safe powertrain limits.`;
    } else if (role === 'concierge') {
      systemInstruction = `You are a Luxury Automotive Concierge & Custom Coachbuilder. You advise clients on bespoke paint finishes, PTS colors, carbon weave options, interior upholstery, and high-end automotive aesthetics.`;
    }

    // Format contents for @google/genai
    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content || m.text || '' }],
    }));

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      text: response.text || '',
      model: selectedModel,
      role: role,
    });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: error.message || 'Chat generation failed' });
  }
});

// ----------------------------------------------------
// 6. Voice Conversations / Speech Synthesis (Live Assistant Mode)
// ----------------------------------------------------
app.post('/api/gemini/voice-conversation', async (req, res) => {
  try {
    const { transcript, audioInputBase64, voice = 'Puck' } = req.body;
    const ai = getAI();

    const promptText = transcript || 'Provide a brief 2-sentence encouraging mechanic inspection verdict on this build.';
    
    // Generate text response and voice audio using Gemini
    let response: any = null;
    const voiceCandidates = ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-flash-latest'];
    let selectedVoiceModel = 'gemini-3.7-flash';

    for (const modelName of voiceCandidates) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              parts: [
                {
                  text: `You are AutoMorph AI's live voice co-pilot. Keep your spoken response natural, punchy, energetic, and under 30 words so it sounds like a real race engineer on the radio. User says: "${promptText}"`,
                },
              ],
            },
          ],
          config: {
            responseModalities: ['TEXT', 'AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voice === 'Charon' ? 'Charon' : voice === 'Aoede' ? 'Aoede' : 'Puck',
                },
              },
            },
          },
        });
        selectedVoiceModel = modelName;
        break;
      } catch (err: any) {
        console.warn(`Voice generation with ${modelName} failed:`, err.message);
      }
    }

    const candidate = response?.candidates?.[0];
    let spokenText = '';
    let audioData: string | null = null;
    let audioMime = 'audio/mp3';

    for (const part of candidate?.content?.parts || []) {
      if (part.text) spokenText += part.text;
      if (part.inlineData) {
        audioData = part.inlineData.data;
        audioMime = part.inlineData.mimeType || 'audio/mp3';
      }
    }

    res.json({
      spokenText: spokenText || response?.text || '',
      audioBase64: audioData,
      audioMime: audioMime,
      model: `${selectedVoiceModel} (Live Voice Mode)`,
    });
  } catch (error: any) {
    console.error('Voice conversation error:', error);
    // Graceful fallback to text if audio modality not supported
    try {
      const ai = getAI();
      const textRes = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `Spoken radio transmission (under 25 words) for race engineer: ${req.body.transcript || 'Ready for tuning!'}`,
      });
      return res.json({
        spokenText: textRes.text || 'Radio check: All systems green. Ready for custom modifications.',
        audioBase64: null,
      });
    } catch (e2) {
      res.status(500).json({ error: error.message || 'Voice generation failed' });
    }
  }
});

// ----------------------------------------------------
// 6.5. API Catch-All and Global JSON Error Handler
// ----------------------------------------------------
// Guarantee that all unhandled /api/* requests return JSON 404 (never HTML fallback)
app.all('/api/*', (req, res) => {
  res.status(404).json({
    error: `API endpoint not found: ${req.method} ${req.path}`,
    vehicleDetected: false,
    apiConnected: false,
  });
});

// Global express error handler for /api requests
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  if (req.path.startsWith('/api/')) {
    return res.status(err.status || 500).json({
      error: err.message || 'Internal server error',
      vehicleDetected: false,
    });
  }
  next(err);
});

// ----------------------------------------------------
// 7. Vite Integration
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AutoMorph AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
