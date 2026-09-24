import {
  PaintColorOption,
  WheelOption,
  GrilleOption,
  AestheticOption,
  CarPreset,
  BuildItem,
  UserProfile,
  CustomizationConfig,
  ModificationShop,
  PartProduct,
  BuildComment,
} from '../types';

export const PAINT_COLORS: PaintColorOption[] = [
  {
    id: 'factory-white',
    name: 'Factory White',
    hex: '#F8F9FA',
    finish: 'Pearl Metallic Gloss',
    ringClass: 'ring-white/40',
  },
  {
    id: 'obsidian-black',
    name: 'Obsidian Black',
    hex: '#0A0A0B',
    finish: 'Deep Matte Obsidian',
    ringClass: 'ring-[#4F46E5]',
  },
  {
    id: 'racing-red',
    name: 'Racing Red',
    hex: '#DC2626',
    finish: 'Candy Metallic Red',
    ringClass: 'ring-red-500',
  },
  {
    id: 'metallic-blue',
    name: 'Metallic Blue',
    hex: '#1E40AF',
    finish: 'Deep Electric Indigo',
    ringClass: 'ring-blue-500',
  },
  {
    id: 'metallic-grey',
    name: 'Metallic Grey',
    hex: '#4B5563',
    finish: 'Satin Dark Titanium',
    ringClass: 'ring-gray-400',
  },
];

export const WHEEL_OPTIONS: WheelOption[] = [
  {
    id: 'oem-18',
    name: 'OEM Factory Alloys',
    size: '18 Inch',
    description: 'Factory lightweight precision alloys',
    finish: 'Machined Silver Diamond Cut',
  },
  {
    id: 'sport-19',
    name: '19" Sport Alloy Wheels',
    size: '19 Inch',
    description: 'Forged lightweight multi-spoke track alloys',
    finish: 'Gloss Black Anodized',
  },
  {
    id: 'luxury-20',
    name: '20" Turbine Monoblock',
    size: '20 Inch',
    description: 'Bespoke aerodynamic forged turbine wheels',
    finish: 'Brushed Titanium Shadow',
  },
  {
    id: 'off-road-17',
    name: '17" Beadlock Rugged',
    size: '17 Inch',
    description: 'Heavy duty deflation ring wheels with A/T rubber',
    finish: 'Matte Bronze Stealth Ring',
  },
];

export const GRILLE_OPTIONS: GrilleOption[] = [
  {
    id: 'factory',
    name: 'Factory Grille',
    type: 'factory',
    description: 'OEM stock chrome & silver slat intake grille',
    finish: 'Factory Silver / Chrome',
  },
  {
    id: 'blacked-out',
    name: 'Blacked Out Grille',
    type: 'blacked-out',
    description: 'High-gloss shadowline de-chromed blackout grille',
    finish: 'Gloss Piano Black',
  },
  {
    id: 'sport',
    name: 'Sport Grille',
    type: 'sport',
    description: 'Track-spec high airflow honeycomb mesh with red accent badge',
    finish: 'Matte Carbon Weave',
  },
];

export const AESTHETIC_OPTIONS: AestheticOption[] = [
  {
    id: 'stock-plus',
    name: 'Stock+',
    subtitle: 'Subtle factory enhancements',
    icon: 'directions_car',
    description: 'OEM+ enhancements preserving original bodylines with fine accents.',
    features: ['Subtle front lip', 'OEM spoiler extension', 'Slight lowering springs'],
  },
  {
    id: 'sport',
    name: 'Sport',
    subtitle: 'Aggressive aero & lowered',
    icon: 'sports_motorsports',
    description: 'Track-ready aerodynamics with gloss black grille and functional aero splitters.',
    features: ['Black Front Grille', '19" Sport Alloy Wheels', 'Lowered Stance', 'Gloss Black Side Mirrors'],
  },
  {
    id: 'luxury',
    name: 'Luxury',
    subtitle: 'Chrome deletes & premium',
    icon: 'diamond',
    description: 'Ultra-refined executive stance with smoked optics and bespoke styling.',
    features: ['Full chrome delete', 'Smoked laser headlights', 'Soft ambient LED puddle lamps'],
  },
  {
    id: 'off-road',
    name: 'Off-Road',
    subtitle: 'Lifted, rugged tires',
    icon: 'landscape',
    description: 'Trail-conquering armor package with raised suspension and heavy duty roof rack.',
    features: ['2" suspension lift', 'Modular steel bumper', 'LED lightbar array', 'Rock sliders'],
  },
  {
    id: 'stealth',
    name: 'Stealth',
    subtitle: 'Matte finish, blacked out',
    icon: 'visibility_off',
    description: 'Shadowline blackout theme with satin dark wrap and dark tinted glass.',
    features: ['Obsidian satin wrap', 'Gloss black badging', '95% privacy tint', 'Dark graphite wheels'],
  },
];

export const HEADLIGHT_OPTIONS = [
  { id: 'factory', name: 'Factory Clear', type: 'OEM Clear Matrix Lens' },
  { id: 'smoked-matrix', name: 'Smoked LED Matrix', type: 'Dark Tinted Matrix Optics' },
  { id: 'amber-laser', name: 'Amber Laser DRL', type: 'GT3 Competition Amber Halo' },
  { id: 'cyber-halo', name: 'Cyber Blue Halo', type: 'Neon Blue LED Ring DRL' },
];

export const TINT_OPTIONS = [
  { id: 'clear', name: 'Factory 70% Clear', percent: '70% VLT' },
  { id: 'medium', name: '35% Medium Smoke', percent: '35% VLT' },
  { id: 'limo', name: '5% Limo Stealth Privacy', percent: '5% VLT' },
];

export const RIDE_HEIGHT_OPTIONS = [
  { id: 'stock', name: 'Factory Stock', desc: 'OEM standard ride height' },
  { id: 'sport', name: 'Sport Lowered -30mm', desc: 'Lowered performance progressive springs' },
  { id: 'slammed', name: 'Slammed Air Suspension', desc: 'Tucked stance on air ride management' },
  { id: 'lifted', name: '2" Off-Road Lift', desc: 'Heavy duty long-travel lifted struts' },
];

export const BODYKIT_OPTIONS = [
  { id: 'stock', name: 'OEM Clean', desc: 'Factory aerodynamic trim' },
  { id: 'track-aero', name: 'Track Aero Splitter & Diffuser', desc: 'Carbon front splitter and rear finned diffuser' },
  { id: 'widebody', name: 'Widebody Fender Flares', desc: 'Bolt-on aggressive widebody arches (+50mm)' },
];

export const SPOILER_OPTIONS = [
  { id: 'none', name: 'Clean (No Spoiler)', desc: 'Smooth sleek trunk lid' },
  { id: 'ducktail', name: 'Carbon Ducktail Lip', desc: 'Molded subtle upturned aero trunk lip' },
  { id: 'gt-wing', name: 'Carbon Fiber GT Wing', desc: 'Chassis mounted high-downforce rear wing' },
];

export const ROOF_OPTIONS = [
  { id: 'body', name: 'Body Color Match', desc: 'Matches primary car paint' },
  { id: 'black', name: 'Gloss Piano Black Two-Tone', desc: 'De-chromed black contrast floating roof' },
  { id: 'carbon', name: 'Forged Carbon Fiber Roof', desc: 'Exposed matte forged carbon panel' },
];

export const MIRROR_OPTIONS = [
  { id: 'body', name: 'Body Color Match', desc: 'OEM matching paint' },
  { id: 'carbon', name: 'Carbon Fiber Mirror Caps', desc: 'Lightweight gloss carbon aero caps' },
  { id: 'black', name: 'Gloss Black Shadowline', desc: 'De-chromed black mirror housings' },
];

export const EXHAUST_OPTIONS = [
  { id: 'factory', name: 'Factory Dual Tips', desc: 'Standard OEM chrome exhaust outlets' },
  { id: 'titanium-burnt', name: 'Quad Titanium Burnt Blue', desc: '90mm quad quad-exit burnt titanium pipes' },
  { id: 'side-exit', name: 'Side Exit Race Pipes', desc: 'Rocker panel side-exit boom tubes' },
];

export const OFFROAD_OPTIONS = [
  { id: 'none', name: 'None Standard', desc: 'Street spec clean setup' },
  { id: 'roof-rack', name: 'Roof Rack & 50" LED Lightbar', desc: 'Tubular overland platform with spot lamps' },
  { id: 'overland-bumper', name: 'Overland Snorkel & Steel Bumper', desc: 'Deep water intake snorkel and winch bumper' },
];

export const CAR_PRESETS: CarPreset[] = [
  {
    id: 'range-rover-sport',
    name: 'Range Rover Sport',
    year: '2024',
    category: 'LUXURY',
    stockImage:
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1600&q=85',
    studioImage:
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1600&q=85',
    analyzingImage:
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1600&q=85',
    customizedImages: {
      'factory-white':
        'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1600&q=85',
      'obsidian-black':
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1600&q=85',
      'metallic-grey':
        'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=1600&q=85',
      'racing-red':
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1600&q=85',
      'midnight-blue':
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=85',
      default:
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1600&q=85',
    },
    defaultConfig: {
      baseVehicleName: 'Range Rover Sport',
      baseVehicleYear: '2024',
      paint: PAINT_COLORS[1], // Obsidian Black
      wheels: WHEEL_OPTIONS[2], // 20" Turbine Monoblock
      grille: GRILLE_OPTIONS[1], // Blacked Out
      aesthetic: AESTHETIC_OPTIONS[2], // Luxury
      brakeCalipers: 'Gloss Black Brembo',
      windowTint: '90% Limo Privacy Tint',
      exhaust: 'Quad Black Ceramic Pipes',
      suspensionLowering: 'Dynamic Air Suspension Drop -20mm',
    },
    specs: {
      engine: '3.0L Twin-Turbo Inline-6 MHEV',
      drivetrain: 'All-Wheel Drive / 8-Speed Auto',
      power: '395 HP @ 6500 RPM',
      curbWeight: '2,310 kg',
    },
  },
  {
    id: 'defender-110',
    name: 'Land Rover Defender 110',
    year: '2024',
    category: 'OFF-ROAD',
    stockImage:
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1600&q=85',
    studioImage:
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1600&q=85',
    analyzingImage:
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1600&q=85',
    customizedImages: {
      default:
        'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1600&q=85',
    },
    defaultConfig: {
      baseVehicleName: 'Land Rover Defender 110',
      baseVehicleYear: '2024',
      paint: PAINT_COLORS[1],
      wheels: WHEEL_OPTIONS[3],
      grille: GRILLE_OPTIONS[1],
      aesthetic: AESTHETIC_OPTIONS[4],
    },
    specs: {
      engine: '5.0L Supercharged V8',
      drivetrain: 'Permanent 4WD with Twin-Speed Box',
      power: '518 HP @ 6000 RPM',
      curbWeight: '2,471 kg',
    },
  },
  {
    id: 'hyundai-creta',
    name: 'Hyundai Creta N-Line',
    year: '2024',
    category: 'SUV',
    stockImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCRWEC1Qs6WZEq9EqCXJl9NXqBychO3nQtB_2C19u9a6NDP_reElu8b_Kk5aKrDrBm56QvWTAV2ATUthaeyWtmh0GHToCWYCWHHDLzLfDRJ585Bg9k0emXJ9R36gV3D7oSgh04Hj1ANynyY9JF8_sok_f_7hS2IC7vjyvffnpBkSSRdldLvBEias8KxDUQ7_PDjNHR1dKV99bPmrNMoe_FSVNvCKAVtj5nrseqP71SuS9xUON8I9bttlA',
    studioImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCBCJkp8Sgcf_VRNXS0ejRskUYBX4PtzwoALfIvGmYkrPqxuXWIlGBBVkmZ5XDpZAAVwTZhMhJNxoasNFvCZlxWl5jJXFgH0OyDVSOub_A9bGzF5i2aTQwzAnXbkLeZZIdwLZ_0yLPI1_MYTkJWgu35023oQ_YZxn-STI2Iwuoj9oTC6imnZYJNwQ3lS4MgIAp2fK_rvKTo9tVKdJ5QAHQo73qjcInHy6BPehRioOxfGEV1HEueNOqtGw',
    analyzingImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCRWEC1Qs6WZEq9EqCXJl9NXqBychO3nQtB_2C19u9a6NDP_reElu8b_Kk5aKrDrBm56QvWTAV2ATUthaeyWtmh0GHToCWYCWHHDLzLfDRJ585Bg9k0emXJ9R36gV3D7oSgh04Hj1ANynyY9JF8_sok_f_7hS2IC7vjyvffnpBkSSRdldLvBEias8KxDUQ7_PDjNHR1dKV99bPmrNMoe_FSVNvCKAVtj5nrseqP71SuS9xUON8I9bttlA',
    customizedImages: {
      'factory-white':
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCRWEC1Qs6WZEq9EqCXJl9NXqBychO3nQtB_2C19u9a6NDP_reElu8b_Kk5aKrDrBm56QvWTAV2ATUthaeyWtmh0GHToCWYCWHHDLzLfDRJ585Bg9k0emXJ9R36gV3D7oSgh04Hj1ANynyY9JF8_sok_f_7hS2IC7vjyvffnpBkSSRdldLvBEias8KxDUQ7_PDjNHR1dKV99bPmrNMoe_FSVNvCKAVtj5nrseqP71SuS9xUON8I9bttlA',
      'obsidian-black':
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCBCJkp8Sgcf_VRNXS0ejRskUYBX4PtzwoALfIvGmYkrPqxuXWIlGBBVkmZ5XDpZAAVwTZhMhJNxoasNFvCZlxWl5jJXFgH0OyDVSOub_A9bGzF5i2aTQwzAnXbkLeZZIdwLZ_0yLPI1_MYTkJWgu35023oQ_YZxn-STI2Iwuoj9oTC6imnZYJNwQ3lS4MgIAp2fK_rvKTo9tVKdJ5QAHQo73qjcInHy6BPehRioOxfGEV1HEueNOqtGw',
      'metallic-grey':
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCAv0frIunVX5aUWcwh2Ap97mt32M9uBcUhY9ecsMWKxk-1NEK77eU0p-O-PxSK__HIBFpJhITdVgOrfBKyT2vg3oQLm_Xd3uHN3gTBZF2J9bPIZ7oVqBq_mFK6l-pOqDao5VAaYrZuAqEKotz9OIaW45o0xowgtEoussao8gmphgrkudEV4NOVZc3YB9g1fOi-jr4XQrUY0LW13HSpUNdlTxh3EY-ENpY121V-LLRAHSgiSVriKuQPww',
      'racing-red':
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBud71ysvob4Z5mRBqSZOz2xhLTRgTJSv8pT5zpCjVr1pCbVdEW0skIGqYsz80IyNCIeILZhsboZbxoG22QbPrF9GqPK6a104SZlLDqI6q_1UWPkIw_Ept-fZEiUH_iC2XRSjcax8H4R1OhPk8C2pKLOC2I9_lv_rMto0WS2ng5eFG4DZYE8bPWTgAuXwJU8udmnIldQaj4_sjZUvm6TkM0IxiAp8Cv019ySYfKGxRnSw4TvwrYGQvlTA',
      'midnight-blue':
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBaHj1akc_EKHpiNsemAlNX4K04irbeU-V6W-T8yGySuKIr98SUUEhRR6yDe4l2armf5YfBMZckPTxla_5wteHBhP6KhHUoJTZUbnJIqTR6zkL-Amb9_gHh6hD0ORxfPdqkAWNceLS4JlyhyDCpTDkn-vQMcgd2qg83cwXSfqeZi7NzN7T9dwO2ERswtpQoO9C3tpeOnBLkIV3Ncjk-esIzufq0Khkrq3zASdhTkgL_8K68OnKcnoADAg',
      default:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCBCJkp8Sgcf_VRNXS0ejRskUYBX4PtzwoALfIvGmYkrPqxuXWIlGBBVkmZ5XDpZAAVwTZhMhJNxoasNFvCZlxWl5jJXFgH0OyDVSOub_A9bGzF5i2aTQwzAnXbkLeZZIdwLZ_0yLPI1_MYTkJWgu35023oQ_YZxn-STI2Iwuoj9oTC6imnZYJNwQ3lS4MgIAp2fK_rvKTo9tVKdJ5QAHQo73qjcInHy6BPehRioOxfGEV1HEueNOqtGw',
    },
    defaultConfig: {
      baseVehicleName: 'Hyundai Creta N-Line',
      baseVehicleYear: '2024',
      paint: PAINT_COLORS[1], // Obsidian Black
      wheels: WHEEL_OPTIONS[1], // 19" Sport Alloy Wheels
      grille: GRILLE_OPTIONS[1], // Blacked Out Grille
      aesthetic: AESTHETIC_OPTIONS[1], // Sport
      brakeCalipers: 'N-Line Thunder Red',
      windowTint: '80% Smoke',
      exhaust: 'Twin N-Line Chrome Tips',
      suspensionLowering: 'Lowered Stance -1.5"',
    },
    specs: {
      engine: '1.5L Turbo GDi Petrol',
      drivetrain: '7-Speed DCT / FWD',
      power: '160 HP @ 5500 RPM',
      curbWeight: '1,350 kg',
    },
  },
  {
    id: 'thar-roxx',
    name: 'Mahindra Thar Roxx',
    year: '2024',
    category: 'OFF-ROAD',
    stockImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDcd4aMfMaMkboRp_1ClE_W_EuoWJDqjFqEYZUYBWxWPC6Sb6c-9cFnvBhDD9sMdfxqSuCTMI1cxgzGuvztZVbwoFCAWYCfK5TIk8G-y79nUkeW8EipgJT-5eJOgMKMCdIWaCDYi2VwAZXdGtbsj-lIlo62kTN0OLNFh5bjhY_V2ZC1uzCggLunWENo2kDdPE3RUM0fCr7ytAgVK5IyA1kX47v7IMZim3WyzUiwxFqgiGhxCKIHr7he1A',
    studioImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDcd4aMfMaMkboRp_1ClE_W_EuoWJDqjFqEYZUYBWxWPC6Sb6c-9cFnvBhDD9sMdfxqSuCTMI1cxgzGuvztZVbwoFCAWYCfK5TIk8G-y79nUkeW8EipgJT-5eJOgMKMCdIWaCDYi2VwAZXdGtbsj-lIlo62kTN0OLNFh5bjhY_V2ZC1uzCggLunWENo2kDdPE3RUM0fCr7ytAgVK5IyA1kX47v7IMZim3WyzUiwxFqgiGhxCKIHr7he1A',
    analyzingImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDcd4aMfMaMkboRp_1ClE_W_EuoWJDqjFqEYZUYBWxWPC6Sb6c-9cFnvBhDD9sMdfxqSuCTMI1cxgzGuvztZVbwoFCAWYCfK5TIk8G-y79nUkeW8EipgJT-5eJOgMKMCdIWaCDYi2VwAZXdGtbsj-lIlo62kTN0OLNFh5bjhY_V2ZC1uzCggLunWENo2kDdPE3RUM0fCr7ytAgVK5IyA1kX47v7IMZim3WyzUiwxFqgiGhxCKIHr7he1A',
    customizedImages: {
      default:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDcd4aMfMaMkboRp_1ClE_W_EuoWJDqjFqEYZUYBWxWPC6Sb6c-9cFnvBhDD9sMdfxqSuCTMI1cxgzGuvztZVbwoFCAWYCfK5TIk8G-y79nUkeW8EipgJT-5eJOgMKMCdIWaCDYi2VwAZXdGtbsj-lIlo62kTN0OLNFh5bjhY_V2ZC1uzCggLunWENo2kDdPE3RUM0fCr7ytAgVK5IyA1kX47v7IMZim3WyzUiwxFqgiGhxCKIHr7he1A',
    },
    defaultConfig: {
      baseVehicleName: 'Mahindra Thar Roxx',
      baseVehicleYear: '2024',
      paint: PAINT_COLORS[1],
      wheels: WHEEL_OPTIONS[3],
      grille: GRILLE_OPTIONS[1],
      aesthetic: AESTHETIC_OPTIONS[3],
    },
    specs: {
      engine: '2.2L mHawk Diesel',
      drivetrain: '4x4 Manual/Auto with Locking Differential',
      power: '175 HP @ 3750 RPM',
      curbWeight: '1,980 kg',
    },
  },
  {
    id: 'grand-vitara',
    name: 'Maruti Suzuki Grand Vitara',
    year: '2024',
    category: 'SUV',
    stockImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDKfxojcX_kGBLGapXvu23XPfi_9UPN7PoZkI1Hfh9RhUUN3HoDfIU_wBs6Dqdls-gClP-n-hJXh2z-TBpLiIQPnTa6cLHns_Ka8WhUDR3dTRSMQbAFjn_p_BYbYy-zQcZ80oat7bdWgfzn3SkwAuj75inf1xKGv8B4ZQ28eynL2pAqng4DX25ILatrM-0EZo_D2KImN-n-gnXCkEnZk4scWjpFeGxI5pFV4yvxQisnv9N3bu6Dnv2L2w',
    studioImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDKfxojcX_kGBLGapXvu23XPfi_9UPN7PoZkI1Hfh9RhUUN3HoDfIU_wBs6Dqdls-gClP-n-hJXh2z-TBpLiIQPnTa6cLHns_Ka8WhUDR3dTRSMQbAFjn_p_BYbYy-zQcZ80oat7bdWgfzn3SkwAuj75inf1xKGv8B4ZQ28eynL2pAqng4DX25ILatrM-0EZo_D2KImN-n-gnXCkEnZk4scWjpFeGxI5pFV4yvxQisnv9N3bu6Dnv2L2w',
    analyzingImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDKfxojcX_kGBLGapXvu23XPfi_9UPN7PoZkI1Hfh9RhUUN3HoDfIU_wBs6Dqdls-gClP-n-hJXh2z-TBpLiIQPnTa6cLHns_Ka8WhUDR3dTRSMQbAFjn_p_BYbYy-zQcZ80oat7bdWgfzn3SkwAuj75inf1xKGv8B4ZQ28eynL2pAqng4DX25ILatrM-0EZo_D2KImN-n-gnXCkEnZk4scWjpFeGxI5pFV4yvxQisnv9N3bu6Dnv2L2w',
    customizedImages: {
      default:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDKfxojcX_kGBLGapXvu23XPfi_9UPN7PoZkI1Hfh9RhUUN3HoDfIU_wBs6Dqdls-gClP-n-hJXh2z-TBpLiIQPnTa6cLHns_Ka8WhUDR3dTRSMQbAFjn_p_BYbYy-zQcZ80oat7bdWgfzn3SkwAuj75inf1xKGv8B4ZQ28eynL2pAqng4DX25ILatrM-0EZo_D2KImN-n-gnXCkEnZk4scWjpFeGxI5pFV4yvxQisnv9N3bu6Dnv2L2w',
    },
    defaultConfig: {
      baseVehicleName: 'Maruti Suzuki Grand Vitara',
      baseVehicleYear: '2024',
      paint: PAINT_COLORS[1],
      wheels: WHEEL_OPTIONS[1],
      grille: GRILLE_OPTIONS[1],
      aesthetic: AESTHETIC_OPTIONS[4],
    },
    specs: {
      engine: '1.5L Intelligent Electric Hybrid',
      drivetrain: 'ALLGRIP AWD / e-CVT',
      power: '114 HP @ 5500 RPM',
      curbWeight: '1,295 kg',
    },
  },
];

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Ayrton S.',
  handle: '@AyrtonSennaDrive',
  tier: 'Pro Member',
  since: '2024',
  avatar:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAiapiQ85OaTzfZl_OmPPZFgR2Ry5eybw672uvr0OeYrr8RbGMX-emG9UoJE9kqHaeXAH2_dsEfKMptdAd5ng6BAzLRrO3HXintGs3KLojJnW4pECEcEEnCBZgH5MRgxrJKlj7gebRiBdn32BXULk4Rj8WWzy0FuSJmLU6s1ewZGMoae0fvD4iedwUnJnZAFVt76CBEucIBMZKCMr5PuqMo11qmU2sEexldamYgVaXsug2VU_aMx98lbw',
  stats: {
    created: 12,
    saved: 8,
    shared: 4,
  },
};

export const INITIAL_COMMUNITY_BUILDS: BuildItem[] = [
  {
    id: 'build-stealth-g63',
    title: 'Stealth G63',
    baseModel: 'Mercedes-AMG G63',
    author: 'Karan Mehra',
    authorHandle: '@G63V8BiTurbo',
    date: 'May 22, 2024 • 11:15 AM',
    likes: 2300,
    isLiked: false,
    isSaved: true,
    isPublic: true,
    category: 'STEALTH',
    tags: ['STEALTH', 'MERCEDES', 'G-WAGON', 'V8'],
    originalImage:
      'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1600&q=85',
    modifiedImage:
      'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1600&q=85',
    config: {
      baseVehicleName: 'Mercedes-AMG G63',
      paint: PAINT_COLORS[1],
      wheels: WHEEL_OPTIONS[3],
      grille: GRILLE_OPTIONS[1],
      aesthetic: AESTHETIC_OPTIONS[4],
    },
    summaryItems: [
      { title: 'Satin Matte Black Wrap', subtitle: 'Full PPF armor protection' },
      { title: '22" Forged Monoblock Wheels', subtitle: 'Brabus spec gloss black' },
      { title: 'Side-Exit Titanium Exhaust', subtitle: 'Active valve acoustic system' },
    ],
  },
  {
    id: 'build-midnight-911',
    title: 'Midnight 911 Turbo S',
    baseModel: 'Porsche 911 Turbo S',
    author: 'Ayrton S.',
    authorHandle: '@TurboSDrive',
    authorAvatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAiapiQ85OaTzfZl_OmPPZFgR2Ry5eybw672uvr0OeYrr8RbGMX-emG9UoJE9kqHaeXAH2_dsEfKMptdAd5ng6BAzLRrO3HXintGs3KLojJnW4pECEcEEnCBZgH5MRgxrJKlj7gebRiBdn32BXULk4Rj8WWzy0FuSJmLU6s1ewZGMoae0fvD4iedwUnJnZAFVt76CBEucIBMZKCMr5PuqMo11qmU2sEexldamYgVaXsug2VU_aMx98lbw',
    date: 'May 20, 2024 • 2:30 PM',
    likes: 2100,
    isLiked: false,
    isSaved: true,
    isPublic: true,
    category: 'SPORT',
    tags: ['SPORT', 'PORSCHE', '911', 'TURBO S'],
    originalImage:
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1600&q=85',
    modifiedImage:
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1600&q=85',
    config: {
      baseVehicleName: 'Porsche 911 Turbo S',
      baseVehicleYear: '2024',
      paint: PAINT_COLORS[1],
      wheels: WHEEL_OPTIONS[1],
      grille: GRILLE_OPTIONS[2],
      aesthetic: AESTHETIC_OPTIONS[1],
    },
    summaryItems: [
      { title: 'Jet Black Metallic Paint', subtitle: 'Deep gloss ceramic finish' },
      { title: '21" Center-Lock Lightweight Wheels', subtitle: 'Acid yellow carbon ceramic brakes' },
      { title: 'Active Aero Carbon Wing', subtitle: 'Downforce package' },
    ],
  },
  {
    id: 'build-range-rover-urban',
    title: 'Urban Range Rover',
    baseModel: 'Range Rover Sport',
    author: 'Devansh K.',
    authorHandle: '@RangeEnthusiast',
    authorAvatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAiapiQ85OaTzfZl_OmPPZFgR2Ry5eybw672uvr0OeYrr8RbGMX-emG9UoJE9kqHaeXAH2_dsEfKMptdAd5ng6BAzLRrO3HXintGs3KLojJnW4pECEcEEnCBZgH5MRgxrJKlj7gebRiBdn32BXULk4Rj8WWzy0FuSJmLU6s1ewZGMoae0fvD4iedwUnJnZAFVt76CBEucIBMZKCMr5PuqMo11qmU2sEexldamYgVaXsug2VU_aMx98lbw',
    date: 'May 24, 2024 • 4:15 PM',
    likes: 1800,
    isLiked: false,
    isSaved: true,
    isPublic: true,
    category: 'URBAN',
    tags: ['URBAN', 'RANGE ROVER', 'LUXURY', 'SPORT'],
    originalImage:
      'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=1600&q=85',
    modifiedImage:
      'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=1600&q=85',
    config: {
      baseVehicleName: 'Range Rover Sport',
      baseVehicleYear: '2024',
      paint: PAINT_COLORS[0],
      wheels: WHEEL_OPTIONS[2],
      grille: GRILLE_OPTIONS[1],
      aesthetic: AESTHETIC_OPTIONS[2],
    },
    summaryItems: [
      { title: 'Fuji White & Gloss Black Two-Tone', subtitle: 'Ceramic coated exterior' },
      { title: '23" Style 5135 Gloss Black Wheels', subtitle: 'Red SV calipers' },
      { title: 'Black Design Exterior Pack', subtitle: 'Smoked matrix LED lamps' },
    ],
  },
  {
    id: 'build-overland-beast',
    title: 'Overland Beast',
    baseModel: 'Toyota Land Cruiser',
    author: 'Samarth K.',
    authorHandle: '@LandCruiser4x4',
    date: 'May 18, 2024 • 9:20 AM',
    likes: 2000,
    isLiked: false,
    isSaved: true,
    isPublic: true,
    category: 'OFF-ROAD',
    tags: ['OFF-ROAD', 'LAND CRUISER', '4X4', 'OVERLAND'],
    originalImage:
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=85',
    modifiedImage:
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=85',
    config: {
      baseVehicleName: 'Toyota Land Cruiser',
      paint: PAINT_COLORS[1],
      wheels: WHEEL_OPTIONS[3],
      grille: GRILLE_OPTIONS[0],
      aesthetic: AESTHETIC_OPTIONS[3],
    },
    summaryItems: [
      { title: '3" Heavy Duty Expedition Lift', subtitle: 'Old Man Emu BP-51 bypass dampers' },
      { title: '18" Method Race Wheels', subtitle: '35" BFGoodrich KO2 All-Terrain tires' },
      { title: 'Roof Rack with LED Spotlights', subtitle: 'Modular overland rack system' },
    ],
  },
  {
    id: 'build-shadow-mustang',
    title: 'Shadow Mustang GT',
    baseModel: 'Ford Mustang GT',
    author: 'Vikram Rao',
    authorHandle: '@MustangCoyote',
    date: 'May 15, 2024 • 6:45 PM',
    likes: 2700,
    isLiked: false,
    isSaved: true,
    isPublic: true,
    category: 'PERFORMANCE',
    tags: ['PERFORMANCE', 'MUSTANG', 'V8', 'FASTBACK'],
    originalImage:
      'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1600&q=85',
    modifiedImage:
      'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1600&q=85',
    config: {
      baseVehicleName: 'Ford Mustang GT',
      paint: PAINT_COLORS[1],
      wheels: WHEEL_OPTIONS[0],
      grille: GRILLE_OPTIONS[2],
      aesthetic: AESTHETIC_OPTIONS[0],
    },
    summaryItems: [
      { title: 'Shadow Black Matte Finish', subtitle: 'Track-spec aero front splitter' },
      { title: '20" Forged Staggered Wheels', subtitle: 'Michelin Pilot Sport 4S' },
      { title: 'Active Valve Performance Exhaust', subtitle: 'Roush cold air intake' },
    ],
  },
];

export const INITIAL_USER_BUILDS: BuildItem[] = [
  {
    id: 'user-build-creta-sport',
    title: 'Creta Sport Build',
    baseModel: 'Hyundai Creta',
    author: 'Ayrton S.',
    authorHandle: '@AyrtonSennaDrive',
    date: 'May 20, 2024 • 2:30 PM',
    likes: 412,
    isLiked: false,
    isSaved: true,
    isPublic: true,
    category: 'SUV',
    tags: ['SPORT', 'OBSIDIAN BLACK', 'PUBLIC'],
    originalImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCRWEC1Qs6WZEq9EqCXJl9NXqBychO3nQtB_2C19u9a6NDP_reElu8b_Kk5aKrDrBm56QvWTAV2ATUthaeyWtmh0GHToCWYCWHHDLzLfDRJ585Bg9k0emXJ9R36gV3D7oSgh04Hj1ANynyY9JF8_sok_f_7hS2IC7vjyvffnpBkSSRdldLvBEias8KxDUQ7_PDjNHR1dKV99bPmrNMoe_FSVNvCKAVtj5nrseqP71SuS9xUON8I9bttlA',
    modifiedImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCBCJkp8Sgcf_VRNXS0ejRskUYBX4PtzwoALfIvGmYkrPqxuXWIlGBBVkmZ5XDpZAAVwTZhMhJNxoasNFvCZlxWl5jJXFgH0OyDVSOub_A9bGzF5i2aTQwzAnXbkLeZZIdwLZ_0yLPI1_MYTkJWgu35023oQ_YZxn-STI2Iwuoj9oTC6imnZYJNwQ3lS4MgIAp2fK_rvKTo9tVKdJ5QAHQo73qjcInHy6BPehRioOxfGEV1HEueNOqtGw',
    config: {
      baseVehicleName: 'Hyundai Creta',
      paint: PAINT_COLORS[1],
      wheels: WHEEL_OPTIONS[1],
      grille: GRILLE_OPTIONS[1],
      aesthetic: AESTHETIC_OPTIONS[1],
    },
    summaryItems: [
      { title: 'Obsidian Black Paint', subtitle: 'Deep matte obsidian finish' },
      { title: '19" Sport Alloy Wheels', subtitle: 'Gloss black track spec' },
      { title: 'Black Front Grille', subtitle: 'De-chromed honey-comb insert' },
      { title: 'Lowered Stance', subtitle: '-1.5" sport performance kit' },
      { title: 'Gloss Black Side Mirrors', subtitle: 'Dual-tone aero caps' },
    ],
  },
  {
    id: 'user-build-fortuner-stealth',
    title: 'Fortuner Stealth',
    baseModel: 'Fortuner Legender',
    author: 'Ayrton S.',
    authorHandle: '@AyrtonSennaDrive',
    date: 'May 18, 2024 • 11:15 AM',
    likes: 184,
    isLiked: false,
    isSaved: true,
    isPublic: true,
    category: 'SUV',
    tags: ['SUV', 'STEALTH', '4X4'],
    originalImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCT41JlDhyqOcC2qSmSvQRcXAEfafqIJ8FCRx9mOn8kHLM1fY7XL4De8NGOeu10ZXI3cvTX7Pky1B4eIozZKoszvDcmlvnKt6puez-RARJ7pwSGGsic_3kWReK-M74wQaodyD_LuqIZUea-4f2Hl-uFLRhme0a89Nt-nGEF91BK-Vn1FQG26LR20JFM1seyxfHlSpdL44nJWHScVM4VT0hC7ALYZPpOIDwjp-zGUqchXBH72KaPBi25IA',
    modifiedImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCT41JlDhyqOcC2qSmSvQRcXAEfafqIJ8FCRx9mOn8kHLM1fY7XL4De8NGOeu10ZXI3cvTX7Pky1B4eIozZKoszvDcmlvnKt6puez-RARJ7pwSGGsic_3kWReK-M74wQaodyD_LuqIZUea-4f2Hl-uFLRhme0a89Nt-nGEF91BK-Vn1FQG26LR20JFM1seyxfHlSpdL44nJWHScVM4VT0hC7ALYZPpOIDwjp-zGUqchXBH72KaPBi25IA',
    config: {
      baseVehicleName: 'Fortuner Legender',
      paint: PAINT_COLORS[0],
      wheels: WHEEL_OPTIONS[2],
      grille: GRILLE_OPTIONS[1],
      aesthetic: AESTHETIC_OPTIONS[4],
    },
    summaryItems: [
      { title: 'Pearl White Body', subtitle: 'Dual-tone black roof' },
      { title: '20" Turbine Alloys', subtitle: 'Brushed titanium' },
      { title: 'Stealth Blackout Trim', subtitle: 'Full chrome delete' },
    ],
  },
  {
    id: 'user-build-vitara-urban',
    title: 'Grand Vitara Urban',
    baseModel: 'Grand Vitara',
    author: 'Ayrton S.',
    authorHandle: '@AyrtonSennaDrive',
    date: 'May 15, 2024 • 6:45 PM',
    likes: 96,
    isLiked: false,
    isSaved: true,
    isPublic: true,
    category: 'SUV',
    tags: ['SUV', 'HYBRID'],
    originalImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDKfxojcX_kGBLGapXvu23XPfi_9UPN7PoZkI1Hfh9RhUUN3HoDfIU_wBs6Dqdls-gClP-n-hJXh2z-TBpLiIQPnTa6cLHns_Ka8WhUDR3dTRSMQbAFjn_p_BYbYy-zQcZ80oat7bdWgfzn3SkwAuj75inf1xKGv8B4ZQ28eynL2pAqng4DX25ILatrM-0EZo_D2KImN-n-gnXCkEnZk4scWjpFeGxI5pFV4yvxQisnv9N3bu6Dnv2L2w',
    modifiedImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDKfxojcX_kGBLGapXvu23XPfi_9UPN7PoZkI1Hfh9RhUUN3HoDfIU_wBs6Dqdls-gClP-n-hJXh2z-TBpLiIQPnTa6cLHns_Ka8WhUDR3dTRSMQbAFjn_p_BYbYy-zQcZ80oat7bdWgfzn3SkwAuj75inf1xKGv8B4ZQ28eynL2pAqng4DX25ILatrM-0EZo_D2KImN-n-gnXCkEnZk4scWjpFeGxI5pFV4yvxQisnv9N3bu6Dnv2L2w',
    config: {
      baseVehicleName: 'Grand Vitara',
      paint: PAINT_COLORS[4],
      wheels: WHEEL_OPTIONS[0],
      grille: GRILLE_OPTIONS[0],
      aesthetic: AESTHETIC_OPTIONS[0],
    },
    summaryItems: [
      { title: 'Metallic Grey Satin', subtitle: 'Protective clear coat' },
      { title: '18" Stock Alloys', subtitle: 'Factory diamond cut' },
    ],
  },
  {
    id: 'user-build-thar-offroad',
    title: 'Thar Off-Road',
    baseModel: 'Thar Roxx',
    author: 'Ayrton S.',
    authorHandle: '@AyrtonSennaDrive',
    date: 'May 12, 2024 • 9:20 AM',
    likes: 310,
    isLiked: false,
    isSaved: true,
    isPublic: true,
    category: 'OFF-ROAD',
    tags: ['OFF-ROAD', 'OVERLAND', '4X4'],
    originalImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDcd4aMfMaMkboRp_1ClE_W_EuoWJDqjFqEYZUYBWxWPC6Sb6c-9cFnvBhDD9sMdfxqSuCTMI1cxgzGuvztZVbwoFCAWYCfK5TIk8G-y79nUkeW8EipgJT-5eJOgMKMCdIWaCDYi2VwAZXdGtbsj-lIlo62kTN0OLNFh5bjhY_V2ZC1uzCggLunWENo2kDdPE3RUM0fCr7ytAgVK5IyA1kX47v7IMZim3WyzUiwxFqgiGhxCKIHr7he1A',
    modifiedImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDcd4aMfMaMkboRp_1ClE_W_EuoWJDqjFqEYZUYBWxWPC6Sb6c-9cFnvBhDD9sMdfxqSuCTMI1cxgzGuvztZVbwoFCAWYCfK5TIk8G-y79nUkeW8EipgJT-5eJOgMKMCdIWaCDYi2VwAZXdGtbsj-lIlo62kTN0OLNFh5bjhY_V2ZC1uzCggLunWENo2kDdPE3RUM0fCr7ytAgVK5IyA1kX47v7IMZim3WyzUiwxFqgiGhxCKIHr7he1A',
    config: {
      baseVehicleName: 'Thar Roxx',
      paint: PAINT_COLORS[1],
      wheels: WHEEL_OPTIONS[3],
      grille: GRILLE_OPTIONS[1],
      aesthetic: AESTHETIC_OPTIONS[3],
    },
    summaryItems: [
      { title: 'Heavy Duty 2-Inch Lift', subtitle: 'Off-road terrain suspension' },
      { title: '17" Beadlock Bronze Alloys', subtitle: '33" all-terrain rubber' },
      { title: 'Steel Bumper & Lightbar', subtitle: 'Rugged expedition package' },
    ],
  },
];

export const MODIFICATION_SHOPS: ModificationShop[] = [
  {
    id: 'shop-gotham-tuning',
    name: 'Gotham Auto Dynamics',
    city: 'Mumbai',
    location: 'Worli Industrial Estate, Mumbai',
    rating: 4.9,
    reviewCount: 142,
    specialties: ['Custom ECU Remapping', 'Widebody Fabrication', 'Akrapovič Official Dealer'],
    verified: true,
    phone: '+91 98200 44891',
    website: 'https://gothamautodynamics.com',
    avatar: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=1200&q=80',
    badges: ['CERTIFIED MASTER TUNER', 'DYNO JET 4WD'],
  },
  {
    id: 'shop-apex-performance',
    name: 'Apex Performance Labs',
    city: 'Bengaluru',
    location: 'Indiranagar 100ft Road, Bengaluru',
    rating: 4.8,
    reviewCount: 98,
    specialties: ['Track Aero CFD', 'KW Coilover Fitment', 'Brembo Big Brake Kits'],
    verified: true,
    phone: '+91 98450 11234',
    website: 'https://apexperformancelabs.io',
    avatar: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
    badges: ['TRACK TECH VERIFIED', 'CARBON SPECIALIST'],
  },
  {
    id: 'shop-stealth-wraps',
    name: 'Stealth Works & Wrap Studio',
    city: 'Delhi NCR',
    location: 'Okhla Phase III, New Delhi',
    rating: 4.9,
    reviewCount: 215,
    specialties: ['Satin PPF Armor', 'Custom Livery Design', 'Full Chrome Deletes'],
    verified: true,
    phone: '+91 98110 99882',
    website: 'https://stealthworkswraps.in',
    avatar: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80',
    badges: ['XPEL CERTIFIED', 'SUNTEK PRO'],
  },
  {
    id: 'shop-overland-armor',
    name: 'Overland 4x4 Engineering',
    city: 'Gurugram',
    location: 'Golf Course Extension, Gurugram',
    rating: 4.7,
    reviewCount: 76,
    specialties: ['Thar & Defender 4x4 Lift Kits', 'Modular Steel Bumpers', 'Snorkels & Lightbars'],
    verified: true,
    phone: '+91 99100 33452',
    website: 'https://overland4x4eng.com',
    avatar: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
    badges: ['EXPEDITION READY', 'OLD MAN EMU PARTNER'],
  },
];

export const PARTS_PRODUCTS: PartProduct[] = [
  {
    id: 'part-brembo-gt6',
    name: 'Brembo GT6 Carbon-Ceramic Big Brake Kit',
    brand: 'Brembo',
    partNumber: 'BR-GT6-CCB-405',
    category: 'BRAKES',
    price: 4850,
    rating: 4.9,
    reviewsCount: 38,
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
    fitment: ['Range Rover Sport', 'Porsche 911 Turbo S', 'Mercedes-AMG G63'],
    inStock: true,
    specDetails: '6-Piston Monoblock Aluminum Caliper with 405x34mm 2-piece ventilated carbon-ceramic rotors. Reduces unsprung weight by 14kg.',
  },
  {
    id: 'part-akrapovic-exhaust',
    name: 'Akrapovič Evolution Line Titanium Exhaust',
    brand: 'Akrapovič',
    partNumber: 'AK-EVO-TIT-88',
    category: 'EXHAUST',
    price: 5200,
    rating: 5.0,
    reviewsCount: 64,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    fitment: ['Porsche 911 Turbo S', 'Ford Mustang GT', 'Mercedes-AMG G63'],
    inStock: true,
    specDetails: 'Ultralight aerospace-grade titanium with active acoustic valves and matte carbon fiber exhaust tips. +21.4 HP dyno gains.',
  },
  {
    id: 'part-bbs-fir',
    name: 'BBS FI-R Forged Monoblock 20" Staggered',
    brand: 'BBS Wheels',
    partNumber: 'BBS-FIR-2095',
    category: 'WHEELS',
    price: 3600,
    rating: 4.9,
    reviewsCount: 42,
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80',
    fitment: ['Porsche 911', 'Hyundai Creta N-Line', 'Maruti Suzuki Grand Vitara', 'Ford Mustang GT'],
    inStock: true,
    specDetails: 'Aircraft grade 6061-T6 forged aluminum with CNC pocket relief milling. Weighs only 7.9kg per corner in Satin Black.',
  },
  {
    id: 'part-kw-v4',
    name: 'KW Variant 4 3-Way Adjustable Coilovers',
    brand: 'KW Suspensions',
    partNumber: 'KW-V4-ADJ-3WAY',
    category: 'SUSPENSION',
    price: 3890,
    rating: 4.8,
    reviewsCount: 29,
    image: 'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=800&q=80',
    fitment: ['Range Rover Sport', 'Ford Mustang GT', 'Hyundai Creta N-Line'],
    inStock: true,
    specDetails: 'Stainless steel inox-line technology with independent high/low speed compression and rebound damping. -15mm to -55mm lowering range.',
  },
  {
    id: 'part-vorsteiner-aero',
    name: 'Vorsteiner Carbon Fiber Aerodynamic Front Splitter',
    brand: 'Vorsteiner',
    partNumber: 'VOR-CF-SP-99',
    category: 'AERO',
    price: 2450,
    rating: 4.9,
    reviewsCount: 19,
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
    fitment: ['Porsche 911 Turbo S', 'Ford Mustang GT'],
    inStock: true,
    specDetails: 'Autoclaved 2x2 pre-preg carbon fiber weave with UV-inhibiting high gloss lacquer. Generates 65kg downforce at 160 km/h.',
  },
  {
    id: 'part-eventuri-intake',
    name: 'Eventuri Carbon Fiber High-Flow Air Intake',
    brand: 'Eventuri',
    partNumber: 'EV-CF-INTAKE-V8',
    category: 'PERFORMANCE',
    price: 1850,
    rating: 4.9,
    reviewsCount: 51,
    image: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=800&q=80',
    fitment: ['Ford Mustang GT', 'Mercedes-AMG G63', 'Range Rover Sport'],
    inStock: true,
    specDetails: 'Patented reverse cone venturi carbon housing with bespoke filtration and sealed cold-air ducts. Adds +14 WHP with distinct induction roar.',
  },
];

export const INITIAL_COMMENTS: BuildComment[] = [
  {
    id: 'comment-1',
    buildId: 'build-stealth-g63',
    userId: 'user-tuner-1',
    authorName: 'Rohan Sharma',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    authorHandle: '@RohanTuning',
    text: 'That satin black PPF with 22" monoblocks is sinister! What suspension offset are you running?',
    createdAt: '2 hours ago',
  },
  {
    id: 'comment-2',
    buildId: 'build-stealth-g63',
    userId: 'user-tuner-2',
    authorName: 'Ayrton S.',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiapiQ85OaTzfZl_OmPPZFgR2Ry5eybw672uvr0OeYrr8RbGMX-emG9UoJE9kqHaeXAH2_dsEfKMptdAd5ng6BAzLRrO3HXintGs3KLojJnW4pECEcEEnCBZgH5MRgxrJKlj7gebRiBdn32BXULk4Rj8WWzy0FuSJmLU6s1ewZGMoae0fvD4iedwUnJnZAFVt76CBEucIBMZKCMr5PuqMo11qmU2sEexldamYgVaXsug2VU_aMx98lbw',
    authorHandle: '@AyrtonSennaDrive',
    text: 'Running Brabus spec ET25 with active valve side exhaust. Sounds unreal on cold starts!',
    createdAt: '1 hour ago',
  },
  {
    id: 'comment-3',
    buildId: 'build-midnight-911',
    userId: 'user-tuner-3',
    authorName: 'Vikram Mehta',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    authorHandle: '@VikramTrack',
    text: 'The stance on this 911 Turbo S is perfection. That center-lock wheel finish complements the jet black coat.',
    createdAt: '3 hours ago',
  },
];

export const DEFAULT_CUSTOMIZATION: CustomizationConfig = CAR_PRESETS[0].defaultConfig;
export const COMMUNITY_BUILDS: BuildItem[] = INITIAL_COMMUNITY_BUILDS;
export const USER_PROFILE: UserProfile = INITIAL_USER_PROFILE;
export const USER_BUILDS: BuildItem[] = INITIAL_USER_BUILDS;



