'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Lock,
  Phone,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Sparkles,
} from 'lucide-react';

export default function AuthScreens() {
  const { screen, setScreen, showToast, updateUser } = useApp();

  // Login form states
  const [loginPhone, setLoginPhone] = useState('+880 1819-284920');
  const [loginPass, setLoginPass] = useState('password123');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Signup form states
  const [signupName, setSignupName] = useState('Tamim Hossain');
  const [signupPhone, setSignupPhone] = useState('+880 1711-223344');
  const [signupNid, setSignupNid] = useState('8294 9201 4482');
  const [signupPass, setSignupPass] = useState('');
  const [signupConfirmPass, setSignupConfirmPass] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // OTP Verification states
  const [otp, setOtp] = useState(['4', '8', '3', '0', '2']);
  const [resendTimer, setResendTimer] = useState(55);

  // Forgot password
  const [forgotPhone, setForgotPhone] = useState('+880 1819-284920');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (screen === 'auth-otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [screen, resendTimer]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone || !loginPass) {
      showToast('Please enter phone and password');
      return;
    }
    showToast('Logged in successfully!');
    setScreen('home');
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      showToast('Please accept terms & conditions');
      return;
    }
    updateUser({
      name: signupName,
      phone: signupPhone,
      nidNumber: signupNid,
    });
    setScreen('auth-otp');
  };

  const handleVerifyOtp = () => {
    showToast('Phone verified successfully!');
    setScreen('home');
  };

  const handleResetPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass || newPass !== confirmNewPass) {
      showToast('Passwords do not match');
      return;
    }
    setResetSuccess(true);
  };

  // OTP Screen
  if (screen === 'auth-otp') {
    return (
      <div className="min-h-[640px] flex flex-col justify-between p-6 bg-white dark:bg-[#101c15]">
        <div>
          <button
            onClick={() => setScreen('auth-signup')}
            className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 tap-bounce"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="mt-4 text-center">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Phone number verify
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              Code has been sent to{' '}
              <span className="font-semibold text-neutral-700 dark:text-neutral-200">
                +8801819...20
              </span>
            </p>
          </div>

          <div className="flex justify-center gap-2.5 my-8">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => {
                  const val = e.target.value;
                  const newOtp = [...otp];
                  newOtp[idx] = val;
                  setOtp(newOtp);
                }}
                className="w-12 h-14 rounded-2xl text-center text-xl font-bold bg-[#F2FAF4] dark:bg-[#172920] border-2 border-[#007A3D]/40 text-[#007A3D] dark:text-emerald-400 focus:outline-none focus:border-[#007A3D]"
              />
            ))}
          </div>

          <div className="text-center">
            <p className="text-xs text-neutral-500">
              Resend Code in{' '}
              <span className="font-semibold text-[#007A3D]">
                {resendTimer} s
              </span>
            </p>
          </div>
        </div>

        <div className="pb-4">
          <button
            onClick={handleVerifyOtp}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#007A3D] hover:bg-[#006432] text-white font-semibold text-sm shadow-lg shadow-[#007A3D]/25 tap-bounce transition-all"
          >
            Verify
          </button>
        </div>
      </div>
    );
  }

  // Forgot / Reset Password Screen
  if (screen === 'auth-forgot') {
    return (
      <div className="min-h-[640px] flex flex-col justify-between p-6 bg-white dark:bg-[#101c15]">
        <div>
          <button
            onClick={() => setScreen('auth-login')}
            className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 tap-bounce"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {!resetSuccess ? (
            <div>
              <div className="mt-4 text-center">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  Reset Password
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Enter your phone number to receive recovery code
                </p>
              </div>

              <form onSubmit={handleResetPass} className="space-y-4 mt-6">
                <div>
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                    Phone Number
                  </label>
                  <div className="relative mt-1">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
                    <input
                      type="text"
                      value={forgotPhone}
                      onChange={(e) => setForgotPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F2FAF4] dark:bg-[#172920] border border-[#d1ead8] dark:border-[#22382c] text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-[#007A3D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                    New Password
                  </label>
                  <div className="relative mt-1">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F2FAF4] dark:bg-[#172920] border border-[#d1ead8] dark:border-[#22382c] text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-[#007A3D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                    Confirm Password
                  </label>
                  <div className="relative mt-1">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmNewPass}
                      onChange={(e) => setConfirmNewPass(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F2FAF4] dark:bg-[#172920] border border-[#d1ead8] dark:border-[#22382c] text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-[#007A3D]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 py-3.5 px-6 rounded-2xl bg-[#007A3D] hover:bg-[#006432] text-white font-semibold text-sm shadow-lg shadow-[#007A3D]/25 tap-bounce transition-all"
                >
                  Save New Password
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-[#007A3D] flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                Congratulations!
              </h3>
              <p className="text-xs text-neutral-500 mt-2 max-w-xs mx-auto">
                Your password has been reset successfully. You can now log in with your new credentials.
              </p>
              <button
                onClick={() => {
                  setResetSuccess(false);
                  setScreen('auth-login');
                }}
                className="w-full mt-8 py-3.5 px-6 rounded-2xl bg-[#007A3D] text-white font-semibold text-sm tap-bounce"
              >
                Back to Log In
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Sign In Screen
  if (screen === 'auth-login') {
    return (
      <div className="min-h-[640px] flex flex-col justify-between p-6 bg-white dark:bg-[#101c15]">
        <div>
          <button
            onClick={() => setScreen('onboarding')}
            className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 tap-bounce"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="mt-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#007A3D] text-white flex items-center justify-center mx-auto shadow-md shadow-[#007A3D]/25 mb-3">
              <Sparkles className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Welcome Back
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Sign in to your Halal Shop account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 mt-6">
            <div>
              <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                Phone No
              </label>
              <div className="relative mt-1">
                <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
                <input
                  type="text"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F2FAF4] dark:bg-[#172920] border border-[#d1ead8] dark:border-[#22382c] text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-[#007A3D]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                Password
              </label>
              <div className="relative mt-1">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#F2FAF4] dark:bg-[#172920] border border-[#d1ead8] dark:border-[#22382c] text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-[#007A3D]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-neutral-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-neutral-600 dark:text-neutral-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#007A3D] focus:ring-[#007A3D]"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => setScreen('auth-forgot')}
                className="text-[#007A3D] dark:text-emerald-400 font-semibold hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-[#007A3D] hover:bg-[#006432] text-white font-semibold text-sm shadow-lg shadow-[#007A3D]/25 tap-bounce transition-all"
            >
              Log In
            </button>
          </form>

          <div className="mt-4 flex items-center justify-center gap-1 text-xs text-neutral-500">
            <span>Don&apos;t have an account?</span>
            <button
              onClick={() => setScreen('auth-signup')}
              className="text-[#007A3D] dark:text-emerald-400 font-bold hover:underline"
            >
              Sign Up
            </button>
          </div>
        </div>

        <div className="pt-4 space-y-2.5">
          <button
            onClick={() => {
              showToast('Browsing as guest');
              setScreen('home');
            }}
            className="w-full py-3 px-4 rounded-2xl border border-[#d1ead8] dark:border-[#22382c] text-neutral-700 dark:text-neutral-300 font-medium text-xs hover:bg-[#F2FAF4] dark:hover:bg-[#172920] tap-bounce transition-colors"
          >
            Continue as Guest
          </button>

          <button
            onClick={() => {
              showToast('Google login simulated');
              setScreen('home');
            }}
            className="w-full py-3 px-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium text-xs flex items-center justify-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 tap-bounce transition-colors"
          >
            <span className="font-bold text-blue-600">G</span> Continue with Google
          </button>
        </div>
      </div>
    );
  }

  // Sign Up Screen (Create Account)
  return (
    <div className="min-h-[640px] flex flex-col justify-between p-6 bg-white dark:bg-[#101c15]">
      <div>
        <button
          onClick={() => setScreen('auth-login')}
          className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 tap-bounce"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="mt-2 text-center">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Create Account
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Join the community for exclusive discounts
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-3.5 mt-4">
          <div>
            <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              Full Name
            </label>
            <div className="relative mt-1">
              <UserIcon className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
              <input
                type="text"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F2FAF4] dark:bg-[#172920] border border-[#d1ead8] dark:border-[#22382c] text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-[#007A3D]"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              Phone Number
            </label>
            <div className="relative mt-1">
              <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
              <input
                type="text"
                value={signupPhone}
                onChange={(e) => setSignupPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F2FAF4] dark:bg-[#172920] border border-[#d1ead8] dark:border-[#22382c] text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-[#007A3D]"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              NID Card No (Optional for verification)
            </label>
            <div className="relative mt-1">
              <CreditCard className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="8294 9201 4482"
                value={signupNid}
                onChange={(e) => setSignupNid(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F2FAF4] dark:bg-[#172920] border border-[#d1ead8] dark:border-[#22382c] text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-[#007A3D]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              Password
            </label>
            <div className="relative mt-1">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={signupPass}
                onChange={(e) => setSignupPass(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F2FAF4] dark:bg-[#172920] border border-[#d1ead8] dark:border-[#22382c] text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-[#007A3D]"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              Confirm Password
            </label>
            <div className="relative mt-1">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={signupConfirmPass}
                onChange={(e) => setSignupConfirmPass(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F2FAF4] dark:bg-[#172920] border border-[#d1ead8] dark:border-[#22382c] text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-[#007A3D]"
                required
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-600 dark:text-neutral-400 pt-1">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="rounded text-[#007A3D] focus:ring-[#007A3D]"
            />
            I agree to the terms &amp; conditions
          </label>

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-2xl bg-[#007A3D] hover:bg-[#006432] text-white font-semibold text-sm shadow-lg shadow-[#007A3D]/25 tap-bounce transition-all mt-2"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-3 text-center text-xs text-neutral-500 pb-2">
          <span>Already have an account? </span>
          <button
            onClick={() => setScreen('auth-login')}
            className="text-[#007A3D] dark:text-emerald-400 font-bold hover:underline"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}
