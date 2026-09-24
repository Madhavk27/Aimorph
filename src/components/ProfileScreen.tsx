import React, { useState } from 'react';
import { UserProfile, BuildItem } from '../types';

interface ProfileScreenProps {
  userProfile: UserProfile;
  userBuilds: BuildItem[];
  onSelectBuild: (build: BuildItem) => void;
  onOpenUpgradeModal: () => void;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onGoogleSignIn?: () => void;
  onSignOut?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userProfile,
  userBuilds,
  onSelectBuild,
  onOpenUpgradeModal,
  onUpdateProfile,
  onGoogleSignIn,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<'my-builds' | 'saved'>('my-builds');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedName, setEditedName] = useState<string>(userProfile.name);
  const [editedHandle, setEditedHandle] = useState<string>(userProfile.handle);

  const handleSaveProfile = () => {
    onUpdateProfile({
      ...userProfile,
      name: editedName,
      handle: editedHandle,
    });
    setIsEditing(false);
  };

  const displayedBuilds =
    activeTab === 'my-builds'
      ? userBuilds
      : userBuilds.filter((b) => b.isSaved || b.likes > 200);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-36 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Garage &amp; Cloud Profile
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Firebase Firestore synchronized builds, favorites, and studio renders
          </p>
        </div>

        <div className="flex items-center gap-2">
          {userProfile?.email && onSignOut && (
            <button
              onClick={onSignOut}
              className="px-3.5 py-2 rounded-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-full bg-[#1E2230] border border-white/10 hover:bg-[#282E42] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isEditing ? 'close' : 'edit'}
            </span>
            <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
          </button>
        </div>
      </div>

      {/* Cloud Auth Alert if not signed in with Google */}
      {!userProfile?.email && onGoogleSignIn && (
        <div className="w-full rounded-2xl bg-gradient-to-r from-[#2563EB]/20 via-[#1E2230] to-[#0F121C] border border-[#3B82F6]/30 p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2563EB]/20 border border-[#3B82F6]/40 flex items-center justify-center text-[#60A5FA] shrink-0">
              <span className="material-symbols-outlined text-[22px]">cloud_sync</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm">
                Sync Your Garage to Firebase Cloud
              </p>
              <p className="text-xs text-[#94A3B8]">
                Sign in with Google to save custom renders and access them across all devices.
              </p>
            </div>
          </div>

          <button
            onClick={onGoogleSignIn}
            className="px-4 py-2.5 rounded-full bg-white text-[#0F121C] font-bold text-xs hover:bg-gray-100 transition-all flex items-center gap-2 shadow-lg shrink-0 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.1-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.8.7 5.5 1.9 7.8l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.4 7.5 23.5 12 23.5z"
              />
            </svg>
            <span>Sign In with Google</span>
          </button>
        </div>
      )}

      {/* User Profile Card */}
      <div className="w-full rounded-3xl bg-[#131620] border border-white/10 p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#2563EB]/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-[#2563EB] shadow-[0_0_25px_rgba(37,99,235,0.4)]">
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#2563EB] border-2 border-[#131620] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-sm">verified</span>
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left">
            {isEditing ? (
              <div className="space-y-3 max-w-sm mx-auto sm:mx-0 mb-4">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0F121C] border border-white/20 text-white text-sm focus:outline-none focus:border-[#2563EB]"
                />
                <input
                  type="text"
                  value={editedHandle}
                  onChange={(e) => setEditedHandle(e.target.value)}
                  placeholder="@handle"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0F121C] border border-white/20 text-[#60A5FA] font-mono text-sm focus:outline-none focus:border-[#2563EB]"
                />
                <button
                  onClick={handleSaveProfile}
                  className="px-5 py-2 rounded-full bg-[#2563EB] text-white text-xs font-bold shadow-lg cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            ) : (
              <div className="mb-4">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1">
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                    {userProfile.name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#2563EB]/20 border border-[#3B82F6]/30 text-[#60A5FA] font-mono text-[10px] font-bold tracking-wider uppercase">
                    {userProfile.tier || 'PRO TIER'}
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8] font-mono">{userProfile.handle}</p>
                {userProfile.email && (
                  <p className="text-[11px] text-[#60A5FA] mt-0.5">{userProfile.email}</p>
                )}
              </div>
            )}

            {/* Stats Row */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
              <div className="px-4 py-2 rounded-2xl bg-[#0F121C] border border-white/5 min-w-[90px] text-center">
                <span className="block font-display text-lg sm:text-xl font-extrabold text-white">
                  {userBuilds.length}
                </span>
                <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-mono">
                  Created
                </span>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-[#0F121C] border border-white/5 min-w-[90px] text-center">
                <span className="block font-display text-lg sm:text-xl font-extrabold text-white">
                  {userBuilds.filter((b) => b.isSaved || b.likes > 200).length}
                </span>
                <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-mono">
                  Saved
                </span>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-[#0F121C] border border-white/5 min-w-[90px] text-center">
                <span className="block font-display text-lg sm:text-xl font-extrabold text-white">
                  {userProfile.stats?.shared || 4}
                </span>
                <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-mono">
                  Shared
                </span>
              </div>
            </div>
          </div>

          {/* Pro Upgrade CTA Banner inside card */}
          <div className="w-full sm:w-auto mt-2 sm:mt-0">
            <button
              onClick={onOpenUpgradeModal}
              className="w-full px-5 py-3 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white font-bold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.4)] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
              <span>Upgrade to Pro</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('my-builds')}
            className={`pb-2 px-1 text-sm font-bold transition-colors cursor-pointer relative ${
              activeTab === 'my-builds' ? 'text-white' : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            My Builds ({userBuilds.length})
            {activeTab === 'my-builds' && (
              <div className="absolute -bottom-3 left-0 right-0 h-0.5 bg-[#2563EB]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`pb-2 px-1 text-sm font-bold transition-colors cursor-pointer relative ${
              activeTab === 'saved' ? 'text-white' : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Saved ({userBuilds.filter((b) => b.isSaved || b.likes > 200).length})
            {activeTab === 'saved' && (
              <div className="absolute -bottom-3 left-0 right-0 h-0.5 bg-[#2563EB]" />
            )}
          </button>
        </div>
      </div>

      {/* Builds Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedBuilds.map((build) => (
          <div
            key={build.id}
            onClick={() => onSelectBuild(build)}
            className="group rounded-3xl bg-[#131620] border border-white/10 hover:border-[#2563EB]/50 overflow-hidden shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
          >
            {/* Image */}
            <div className="relative aspect-[16/10] overflow-hidden bg-[#0F121C]">
              <img
                src={build.modifiedImage}
                alt={build.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#131620] via-transparent to-transparent" />

              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-white border border-white/10">
                {build.isPublic ? '🌐 Public' : '🔒 Private'}
              </div>
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-display text-base font-bold text-white group-hover:text-[#60A5FA] transition-colors truncate mb-1">
                {build.title}
              </h3>
              <p className="text-xs text-[#94A3B8] mb-3">{build.baseModel}</p>

              <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#94A3B8]">
                <span>{build.date}</span>
                <span className="text-[#60A5FA] font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  Inspect Spec
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
