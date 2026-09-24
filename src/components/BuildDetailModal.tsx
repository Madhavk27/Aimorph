import React, { useState, useEffect } from 'react';
import { BuildItem, BuildComment, UserProfile } from '../types';
import { subscribeComments, addComment, deleteBuild, toggleBuildVisibility } from '../lib/dbService';

interface BuildDetailModalProps {
  build: BuildItem | null;
  currentUser?: UserProfile | null;
  onClose: () => void;
  onTryInStudio: (build: BuildItem) => void;
  onToggleLike: (buildId: string) => void;
  onBuildDeleted?: (buildId: string) => void;
}

export const BuildDetailModal: React.FC<BuildDetailModalProps> = ({
  build,
  currentUser,
  onClose,
  onTryInStudio,
  onToggleLike,
  onBuildDeleted,
}) => {
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [comments, setComments] = useState<BuildComment[]>([]);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [isPostingComment, setIsPostingComment] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isPublic, setIsPublic] = useState<boolean>(build?.isPublic ?? true);

  useEffect(() => {
    if (!build?.id) return;
    setIsPublic(build.isPublic ?? true);
    const unsubscribe = subscribeComments(build.id, (loadedComments) => {
      setComments(loadedComments);
    });
    return () => unsubscribe();
  }, [build?.id, build?.isPublic]);

  if (!build) return null;

  const isOwner = currentUser?.uid && build.authorId === currentUser.uid;

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || isPostingComment) return;

    setIsPostingComment(true);
    try {
      await addComment({
        buildId: build.id,
        userId: currentUser?.uid || 'guest-tuner',
        authorName: currentUser?.name || 'Speed Enthusiast',
        authorAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        authorHandle: currentUser?.handle || '@speedtuner',
        text: newCommentText.trim(),
      });
      setNewCommentText('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this build from your garage?')) return;
    setIsDeleting(true);
    try {
      await deleteBuild(build.id, currentUser?.uid || '');
      onBuildDeleted?.(build.id);
      onClose();
    } catch (err) {
      alert('Failed to delete build. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleVisibility = async () => {
    const nextVal = !isPublic;
    setIsPublic(nextVal);
    await toggleBuildVisibility(build.id, nextVal);
  };

  return (
    <div
      id="build-detail-modal"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#131620] border border-white/10 rounded-[28px] overflow-hidden shadow-2xl my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white hover:text-[#38BDF8] flex items-center justify-center transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {/* Hero Image / Viewer */}
          <div className="relative h-[340px] sm:h-[420px] w-full bg-[#0B0D14]">
            <img
              src={showOriginal ? build.originalImage : build.modifiedImage}
              alt={build.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#131620] via-transparent to-black/30 pointer-events-none" />

            {/* Toggle Before/After */}
            <div className="absolute bottom-4 left-4 z-20 flex gap-2">
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className="px-4 py-2 rounded-full bg-[#131620]/90 backdrop-blur-md border border-white/15 text-white font-bold text-xs flex items-center gap-2 hover:bg-black transition-all cursor-pointer shadow-lg"
              >
                <span className="material-symbols-outlined text-sm text-[#38BDF8]">compare</span>
                <span>{showOriginal ? 'Showing Stock Vehicle' : 'Showing AutoMorph AI Spec'}</span>
              </button>
            </div>

            <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
              {build.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-black/70 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full text-[11px] font-bold font-mono text-[#C084FC]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white">
                    {build.title}
                  </h2>
                  {isOwner && (
                    <button
                      onClick={handleToggleVisibility}
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border cursor-pointer ${
                        isPublic
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      }`}
                    >
                      {isPublic ? '🌐 Public Feed' : '🔒 Private Garage'}
                    </button>
                  )}
                </div>
                <p className="text-sm text-[#94A3B8]">
                  Base: <span className="text-white font-medium">{build.baseModel}</span> • Built by{' '}
                  <span className="text-[#38BDF8] font-medium">
                    {build.authorHandle || build.author}
                  </span>
                  {build.date && ` • ${build.date}`}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => onToggleLike(build.id)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white hover:border-red-500 transition-colors cursor-pointer"
                >
                  <span
                    className="material-symbols-outlined text-[18px] text-red-500"
                    style={{ fontVariationSettings: build.isLiked ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    favorite
                  </span>
                  <span className="text-xs font-mono font-bold">
                    {(build.likes + (build.isLiked ? 1 : 0)).toLocaleString()}
                  </span>
                </button>

                <button
                  onClick={() => {
                    onTryInStudio(build);
                    onClose();
                  }}
                  className="bg-gradient-to-r from-[#8B5CF6] to-[#2563EB] hover:opacity-90 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.4)] flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  <span>Remix in Visualizer</span>
                </button>

                {isOwner && (
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                    title="Delete Build"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isDeleting ? 'hourglass_top' : 'delete'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Modifications Breakdown */}
            <div className="bg-[#181C2A] rounded-2xl p-5 border border-white/5 mb-8">
              <h4 className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">build</span>
                <span>Installed AI Modifications &amp; Hardware Specs</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {build.summaryItems && build.summaryItems.length > 0 ? (
                  build.summaryItems.map((item, i) => (
                    <div key={i} className="bg-[#131620] p-3.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-[#94A3B8] uppercase block mb-1">
                        Spec #{i + 1}
                      </span>
                      <span className="text-sm font-semibold text-white block mb-0.5">{item.title}</span>
                      <span className="text-xs text-[#94A3B8] block">{item.subtitle}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="bg-[#131620] p-3.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-[#94A3B8] uppercase block mb-1">Paint Finish</span>
                      <span className="text-sm font-semibold text-white block mb-0.5">
                        {build.config?.paint?.name || 'Custom Paint'}
                      </span>
                      <span className="text-xs text-[#94A3B8] block">
                        {build.config?.paint?.finish || 'Satin Protective Finish'}
                      </span>
                    </div>
                    <div className="bg-[#131620] p-3.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-[#94A3B8] uppercase block mb-1">Forged Wheels</span>
                      <span className="text-sm font-semibold text-white block mb-0.5">
                        {build.config?.wheels?.name || 'BBS Monoblock'}
                      </span>
                      <span className="text-xs text-[#94A3B8] block">
                        {build.config?.wheels?.size || '21"'} • {build.config?.wheels?.finish || 'Satin Black'}
                      </span>
                    </div>
                    <div className="bg-[#131620] p-3.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-[#94A3B8] uppercase block mb-1">Aero Styling</span>
                      <span className="text-sm font-semibold text-white block mb-0.5">
                        {build.config?.aesthetic?.name || 'Stealth Widebody'}
                      </span>
                      <span className="text-xs text-[#94A3B8] block">
                        {build.config?.aesthetic?.subtitle || 'Carbon Package'}
                      </span>
                    </div>
                    <div className="bg-[#131620] p-3.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-[#94A3B8] uppercase block mb-1">Chassis / Stance</span>
                      <span className="text-sm font-semibold text-white block mb-0.5">
                        Track Coilovers
                      </span>
                      <span className="text-xs text-[#94A3B8] block">-25mm Dynamic Drop</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Live Comments & Discussion Feed */}
            <div className="bg-[#181C2A] rounded-2xl p-5 border border-white/5">
              <h4 className="text-xs font-bold text-[#C084FC] uppercase tracking-wider mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">chat</span>
                  <span>Garage Discussion &amp; Feedback ({comments.length})</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </h4>

              {/* Add Comment Input */}
              <form onSubmit={handlePostComment} className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Share feedback, ask about tire fitment or parts..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#131620] border border-white/10 text-white placeholder-[#94A3B8] text-xs focus:outline-none focus:border-[#8B5CF6]"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim() || isPostingComment}
                  className="px-5 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>{isPostingComment ? 'Posting...' : 'Post'}</span>
                </button>
              </form>

              {/* Comments List */}
              <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1">
                {comments.map((comm) => (
                  <div
                    key={comm.id}
                    className="p-3.5 rounded-xl bg-[#131620] border border-white/5 flex gap-3 items-start"
                  >
                    <img
                      src={comm.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                      alt={comm.authorName}
                      className="w-8 h-8 rounded-full object-cover border border-white/10 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-white">
                          {comm.authorName}
                          <span className="text-[10px] font-mono text-[#94A3B8] ml-2 font-normal">
                            {comm.authorHandle}
                          </span>
                        </span>
                        <span className="text-[10px] text-[#64748B] font-mono">
                          {comm.createdAt}
                        </span>
                      </div>
                      <p className="text-xs text-[#CBD5E1] leading-relaxed">{comm.text}</p>
                    </div>
                  </div>
                ))}

                {comments.length === 0 && (
                  <div className="text-center py-6 text-[#94A3B8] text-xs">
                    No comments yet. Be the first to start the discussion!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

