'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  User,
  ShieldCheck,
  MapPin,
  ClipboardList,
  Settings as SettingsIcon,
  PhoneCall,
  LogOut,
  ChevronRight,
  ArrowLeft,
  Moon,
  Sun,
  Globe,
  Bell,
  Lock,
  Upload,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function ProfileScreen() {
  const {
    user,
    updateUser,
    screen,
    setScreen,
    darkMode,
    toggleDarkMode,
    language,
    setLanguage,
    setLogoutModalOpen,
    addresses,
    setAddressModalOpen,
  } = useApp();

  // Edit profile form state
  const [editName, setEditName] = useState(user.name);
  const [editRole, setEditRole] = useState(user.role);
  const [editPhone, setEditPhone] = useState(user.phone);

  // NID upload state
  const [nidUploadedFront, setNidUploadedFront] = useState(true);
  const [nidUploadedBack, setNidUploadedBack] = useState(true);
  const [nidSubmitting, setNidSubmitting] = useState(false);

  // Settings state
  const [notifPush, setNotifPush] = useState(true);
  const [notifSound, setNotifSound] = useState(true);

  // Sub-screen 1: Edit Profile
  if (screen === 'edit-profile') {
    return (
      <div className="min-h-full pb-8 bg-white dark:bg-[#101c15] text-neutral-900 dark:text-neutral-100">
        <div className="p-4 flex items-center justify-between border-b border-[#d1ead8] dark:border-[#22382c] sticky top-0 bg-white/90 dark:bg-[#101c15]/90 backdrop-blur-md z-20">
          <button
            onClick={() => setScreen('profile')}
            className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 tap-bounce"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-sm font-bold">Edit Profile</h2>
          <div className="w-8" />
        </div>

        <div className="p-6 space-y-4">
          <div className="text-center mb-6">
            <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-[#007A3D] shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <button className="text-xs font-bold text-[#007A3D] dark:text-emerald-400 mt-2 hover:underline">
              Change Photo
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              Full Name
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-2xl bg-[#F2FAF4] dark:bg-[#172920] border border-[#d1ead8] dark:border-[#22382c] text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              Profession / Bio
            </label>
            <input
              type="text"
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-2xl bg-[#F2FAF4] dark:bg-[#172920] border border-[#d1ead8] dark:border-[#22382c] text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              Phone Number
            </label>
            <input
              type="text"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-2xl bg-[#F2FAF4] dark:bg-[#172920] border border-[#d1ead8] dark:border-[#22382c] text-sm focus:outline-none"
            />
          </div>

          <button
            onClick={() => {
              updateUser({ name: editName, role: editRole, phone: editPhone });
              setScreen('profile');
            }}
            className="w-full mt-6 py-3.5 rounded-2xl bg-[#007A3D] text-white text-xs font-bold shadow-md tap-bounce"
          >
            Save Changes
          </button>
        </div>
      </div>
    );
  }

  // Sub-screen 2: Verify Profile by NID
  if (screen === 'nid-verify') {
    return (
      <div className="min-h-full pb-8 bg-white dark:bg-[#101c15] text-neutral-900 dark:text-neutral-100">
        <div className="p-4 flex items-center justify-between border-b border-[#d1ead8] dark:border-[#22382c] sticky top-0 bg-white/90 dark:bg-[#101c15]/90 backdrop-blur-md z-20">
          <button
            onClick={() => setScreen('profile')}
            className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 tap-bounce"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-sm font-bold">Verify Profile by NID</h2>
          <div className="w-8" />
        </div>

        <div className="p-6 space-y-5">
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#007A3D] shrink-0" />
            <p className="text-xs text-neutral-700 dark:text-neutral-300">
              National ID verification unlocks free doorstep returns and VIP member charity cashbacks.
            </p>
          </div>

          {/* Front page */}
          <div>
            <label className="text-xs font-bold text-neutral-800 dark:text-white block mb-2">
              Front Page
            </label>
            <div className="border-2 border-dashed border-[#007A3D]/40 bg-[#F2FAF4] dark:bg-[#172920] rounded-3xl p-6 text-center cursor-pointer hover:bg-emerald-100/50 transition-colors">
              <Upload className="w-8 h-8 mx-auto text-[#007A3D] mb-2" />
              <p className="text-xs font-bold text-neutral-800 dark:text-white">
                Upload NID Front Page
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                PNG, JPG up to 5MB
              </p>
            </div>
          </div>

          {/* Back page */}
          <div>
            <label className="text-xs font-bold text-neutral-800 dark:text-white block mb-2">
              Back Page
            </label>
            <div className="border-2 border-dashed border-[#007A3D]/40 bg-[#F2FAF4] dark:bg-[#172920] rounded-3xl p-6 text-center cursor-pointer hover:bg-emerald-100/50 transition-colors">
              <Upload className="w-8 h-8 mx-auto text-[#007A3D] mb-2" />
              <p className="text-xs font-bold text-neutral-800 dark:text-white">
                Upload NID Back Page
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                PNG, JPG up to 5MB
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setNidSubmitting(true);
              setTimeout(() => {
                setNidSubmitting(false);
                updateUser({ isNidVerified: true });
                setScreen('profile');
              }, 1000);
            }}
            className="w-full py-3.5 rounded-2xl bg-[#007A3D] text-white text-xs font-bold shadow-md tap-bounce"
          >
            {nidSubmitting ? 'Verifying...' : 'Submit Documents'}
          </button>
        </div>
      </div>
    );
  }

  // Sub-screen 3: Settings
  if (screen === 'settings') {
    return (
      <div className="min-h-full pb-8 bg-white dark:bg-[#101c15] text-neutral-900 dark:text-neutral-100">
        <div className="p-4 flex items-center justify-between border-b border-[#d1ead8] dark:border-[#22382c] sticky top-0 bg-white/90 dark:bg-[#101c15]/90 backdrop-blur-md z-20">
          <button
            onClick={() => setScreen('profile')}
            className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 tap-bounce"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-sm font-bold">Settings</h2>
          <div className="w-8" />
        </div>

        <div className="p-5 space-y-4">
          {/* Light / Dark Mode */}
          <div className="p-3.5 rounded-2xl bg-[#F2FAF4] dark:bg-[#172920] border border-[#d1ead8] dark:border-[#22382c] flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="w-5 h-5 text-emerald-400" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500" />
              )}
              <div>
                <h4 className="text-xs font-bold">Theme Mode</h4>
                <p className="text-[10px] text-neutral-500">
                  {darkMode ? 'Dark Theme' : 'Light Theme'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                darkMode ? 'bg-[#007A3D]' : 'bg-neutral-300'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  darkMode ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Language selection */}
          <div className="p-3.5 rounded-2xl bg-[#F2FAF4] dark:bg-[#172920] border border-[#d1ead8] dark:border-[#22382c]">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-[#007A3D]" />
              <h4 className="text-xs font-bold">Language</h4>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage('en')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  language === 'en'
                    ? 'bg-[#007A3D] text-white shadow-xs'
                    : 'bg-white dark:bg-[#101c15] text-neutral-600 dark:text-neutral-300 border border-[#d1ead8]'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('bn')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  language === 'bn'
                    ? 'bg-[#007A3D] text-white shadow-xs'
                    : 'bg-white dark:bg-[#101c15] text-neutral-600 dark:text-neutral-300 border border-[#d1ead8]'
                }`}
              >
                বাংলা (Bangla)
              </button>
            </div>
          </div>

          {/* Push Notifications */}
          <div className="p-3.5 rounded-2xl bg-[#F2FAF4] dark:bg-[#172920] border border-[#d1ead8] dark:border-[#22382c] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-[#007A3D]" />
              <div>
                <h4 className="text-xs font-bold">Push Notifications</h4>
                <p className="text-[10px] text-neutral-500">
                  Receive live order tracking &amp; offers
                </p>
              </div>
            </div>
            <button
              onClick={() => setNotifPush(!notifPush)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                notifPush ? 'bg-[#007A3D]' : 'bg-neutral-300'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  notifPush ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Security */}
          <div
            onClick={() => setScreen('auth-forgot')}
            className="p-3.5 rounded-2xl bg-[#F2FAF4] dark:bg-[#172920] border border-[#d1ead8] dark:border-[#22382c] flex items-center justify-between cursor-pointer tap-bounce"
          >
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-[#007A3D]" />
              <div>
                <h4 className="text-xs font-bold">Security</h4>
                <p className="text-[10px] text-neutral-500">
                  Change password &amp; PIN
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </div>
        </div>
      </div>
    );
  }

  // Main Profile View (Figma Row 06)
  const menuItems = [
    {
      id: 'edit-profile',
      label: 'Edit Profile',
      icon: User,
      action: () => setScreen('edit-profile'),
    },
    {
      id: 'nid-verify',
      label: 'Verify Profile by NID',
      icon: ShieldCheck,
      badge: user.isNidVerified ? 'Verified' : 'Pending',
      action: () => setScreen('nid-verify'),
    },
    {
      id: 'addresses',
      label: 'Saved Address',
      icon: MapPin,
      badge: `${addresses.length} saved`,
      action: () => setAddressModalOpen(true),
    },
    {
      id: 'orders',
      label: 'My Orders',
      icon: ClipboardList,
      action: () => setScreen('orders'),
    },
    {
      id: 'settings',
      label: 'Setting',
      icon: SettingsIcon,
      action: () => setScreen('settings'),
    },
    {
      id: 'support',
      label: 'Contact Us / Customer Service',
      icon: PhoneCall,
      action: () => setScreen('customer-service'),
    },
  ];

  return (
    <div className="min-h-full pb-10 bg-[#F4FBF6] dark:bg-[#0B1410] text-neutral-900 dark:text-neutral-100">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-b from-[#007A3D] to-[#046835] text-white p-6 pb-8 rounded-b-[36px] shadow-lg shadow-[#007A3D]/20 text-center">
        <div className="relative w-20 h-20 mx-auto rounded-full p-1 bg-white/20 backdrop-blur-xs mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.avatar}
            alt={user.name}
            className="w-full h-full rounded-full object-cover border-2 border-white"
          />
          {user.isNidVerified && (
            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-white text-[#007A3D] flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-4 h-4 fill-current" />
            </div>
          )}
        </div>

        <h3 className="text-base font-bold text-white">
          {user.name}
        </h3>
        <p className="text-xs text-white/80 mt-0.5">
          {user.role} • {user.phone}
        </p>

        {/* Wallet Pill */}
        <div className="inline-flex items-center gap-2 mt-3.5 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold text-white">
          <span>Wallet Balance:</span>
          <span className="text-amber-300">৳{user.walletBalance.toFixed(2)}</span>
        </div>
      </div>

      {/* Menu List (Figma Row 06) */}
      <div className="p-4 space-y-2.5 -mt-3">
        <div className="bg-white dark:bg-[#14231b] rounded-3xl p-2 border border-[#d1ead8] dark:border-[#22382c] shadow-xs divide-y divide-neutral-100 dark:divide-neutral-800">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={item.action}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-[#F2FAF4] dark:hover:bg-[#172920] cursor-pointer tap-bounce transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-[#ECFDF5] dark:bg-[#1c3327] text-[#007A3D] dark:text-emerald-400 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-800 dark:text-white">
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#007A3D] text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Log Out button */}
        <button
          onClick={() => setLogoutModalOpen(true)}
          className="w-full p-4 rounded-3xl bg-white dark:bg-[#14231b] border border-red-200 dark:border-red-950/40 text-red-600 text-xs font-bold flex items-center justify-center gap-2 shadow-xs hover:bg-red-50/50 tap-bounce transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </div>
  );
}
