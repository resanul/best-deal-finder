'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  ArrowLeft,
  MapPin,
  ChevronRight,
  Wallet,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  Lock,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order } from '@/types/ecom';

export default function CheckoutScreen() {
  const {
    cart,
    cartTotal,
    selectedAddress,
    addresses,
    setSelectedAddress,
    setAddressModalOpen,
    isDonating,
    donationAmount,
    voucherDiscount,
    placeOrder,
    setScreen,
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('bKash');
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  // MFS (bKash / Nagad) interactive modal simulator
  const [mfsModalOpen, setMfsModalOpen] = useState(false);
  const [mfsStep, setMfsStep] = useState<1 | 2 | 3>(1); // 1: Phone, 2: OTP, 3: PIN
  const [mfsPhone, setMfsPhone] = useState('01819284920');
  const [mfsOtp, setMfsOtp] = useState(['4', '8', '3', '0', '2']);
  const [mfsPin, setMfsPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const deliveryFee = cartTotal > 500 ? 0 : 40;
  const donation = isDonating ? donationAmount : 0;
  const grandTotal = Math.max(0, cartTotal + deliveryFee + donation - voucherDiscount);

  const triggerOrderSuccess = (method: Order['paymentMethod']) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setMfsModalOpen(false);
      placeOrder(method);

      // Trigger festive confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.error(err);
      }

      setScreen('order-success');
    }, 1200);
  };

  const handleProceedPayment = () => {
    if (paymentMethod === 'bKash' || paymentMethod === 'Nagad') {
      setMfsStep(1);
      setMfsModalOpen(true);
    } else {
      triggerOrderSuccess(paymentMethod);
    }
  };

  return (
    <div className="min-h-full pb-10 bg-[#F4FBF6] dark:bg-[#0B1410] text-neutral-900 dark:text-neutral-100">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#121f18] p-4 flex items-center justify-between border-b border-[#d1ead8] dark:border-[#22382c] sticky top-0 z-20">
        <button
          onClick={() => setScreen('cart')}
          className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 tap-bounce"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-bold text-neutral-800 dark:text-white">
          Checkout
        </h2>
        <div className="w-8" />
      </div>

      <div className="p-4 space-y-4">
        {/* Shipping Address Section */}
        <div className="bg-white dark:bg-[#14231b] p-4 rounded-3xl border border-[#d1ead8] dark:border-[#22382c] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-800 dark:text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#007A3D]" />
              Shipping Address
            </span>
            <button
              onClick={() => setShowAddressPicker(!showAddressPicker)}
              className="text-xs font-semibold text-[#007A3D] dark:text-emerald-400 hover:underline"
            >
              {showAddressPicker ? 'Done' : 'Change'}
            </button>
          </div>

          {!showAddressPicker ? (
            <div className="p-3 rounded-2xl bg-[#F2FAF4] dark:bg-[#172920] border border-[#d1ead8] dark:border-[#22382c]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900 dark:text-white">
                  {selectedAddress.name} ({selectedAddress.type})
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#007A3D] text-[10px] font-bold">
                  Active
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">
                {selectedAddress.details}, {selectedAddress.area}, {selectedAddress.city}
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                Phone: {selectedAddress.phone}
              </p>
            </div>
          ) : (
            <div className="space-y-2 mt-2">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => {
                    setSelectedAddress(addr);
                    setShowAddressPicker(false);
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer tap-bounce transition-all ${
                    selectedAddress.id === addr.id
                      ? 'bg-[#F2FAF4] dark:bg-[#172920] border-[#007A3D]'
                      : 'bg-white dark:bg-[#101c15] border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">
                      {addr.name} ({addr.type})
                    </span>
                    {selectedAddress.id === addr.id && (
                      <CheckCircle2 className="w-4 h-4 text-[#007A3D]" />
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {addr.details}, {addr.area}
                  </p>
                </div>
              ))}

              <button
                onClick={() => setAddressModalOpen(true)}
                className="w-full py-2.5 rounded-2xl border-2 border-dashed border-[#d1ead8] dark:border-[#22382c] text-[#007A3D] dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 tap-bounce"
              >
                <Plus className="w-4 h-4" /> Add New Address
              </button>
            </div>
          )}
        </div>

        {/* Order Items Preview */}
        <div className="bg-white dark:bg-[#14231b] p-4 rounded-3xl border border-[#d1ead8] dark:border-[#22382c] shadow-xs">
          <h4 className="text-xs font-bold text-neutral-800 dark:text-white mb-2">
            Order Items ({cart.length})
          </h4>
          <div className="space-y-2">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center justify-between text-xs py-1 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#007A3D]">
                    {item.quantity}x
                  </span>
                  <span className="text-neutral-800 dark:text-neutral-200 truncate max-w-[170px]">
                    {item.product.name}
                  </span>
                </div>
                <span className="font-bold text-neutral-900 dark:text-white">
                  ৳{(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method Selector (Figma Payment Methods) */}
        <div className="bg-white dark:bg-[#14231b] p-4 rounded-3xl border border-[#d1ead8] dark:border-[#22382c] shadow-xs">
          <h4 className="text-xs font-bold text-neutral-800 dark:text-white mb-3">
            Select Payment Method
          </h4>

          <div className="space-y-2.5">
            {/* My Wallet */}
            <label
              className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer tap-bounce transition-all ${
                paymentMethod === 'My Wallet'
                  ? 'bg-[#F2FAF4] dark:bg-[#172920] border-[#007A3D]'
                  : 'border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-[#007A3D] flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                    My Wallet
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    Available balance: ৳1,450.00
                  </span>
                </div>
              </div>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'My Wallet'}
                onChange={() => setPaymentMethod('My Wallet')}
                className="text-[#007A3D] focus:ring-[#007A3D]"
              />
            </label>

            {/* bKash (Bangladesh MFS) */}
            <label
              className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer tap-bounce transition-all ${
                paymentMethod === 'bKash'
                  ? 'bg-[#F2FAF4] dark:bg-[#172920] border-[#007A3D]'
                  : 'border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-pink-950/50 text-pink-600 flex items-center justify-center font-black text-xs">
                  bK
                </div>
                <div>
                  <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                    bKash
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    Instant Mobile Banking
                  </span>
                </div>
              </div>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'bKash'}
                onChange={() => setPaymentMethod('bKash')}
                className="text-[#007A3D] focus:ring-[#007A3D]"
              />
            </label>

            {/* Nagad */}
            <label
              className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer tap-bounce transition-all ${
                paymentMethod === 'Nagad'
                  ? 'bg-[#F2FAF4] dark:bg-[#172920] border-[#007A3D]'
                  : 'border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/50 text-[#EA580C] flex items-center justify-center font-black text-xs">
                  না
                </div>
                <div>
                  <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                    Nagad
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    Post Office Digital Banking
                  </span>
                </div>
              </div>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'Nagad'}
                onChange={() => setPaymentMethod('Nagad')}
                className="text-[#007A3D] focus:ring-[#007A3D]"
              />
            </label>

            {/* Visa / Card */}
            <label
              className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer tap-bounce transition-all ${
                paymentMethod === 'Visa Card'
                  ? 'bg-[#F2FAF4] dark:bg-[#172920] border-[#007A3D]'
                  : 'border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                    Visa / Mastercard
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    Debit or Credit Card
                  </span>
                </div>
              </div>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'Visa Card'}
                onChange={() => setPaymentMethod('Visa Card')}
                className="text-[#007A3D] focus:ring-[#007A3D]"
              />
            </label>

            {/* Cash on Delivery */}
            <label
              className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer tap-bounce transition-all ${
                paymentMethod === 'Cash on Delivery'
                  ? 'bg-[#F2FAF4] dark:bg-[#172920] border-[#007A3D]'
                  : 'border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                    Cash on Delivery
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    Pay at your doorstep
                  </span>
                </div>
              </div>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'Cash on Delivery'}
                onChange={() => setPaymentMethod('Cash on Delivery')}
                className="text-[#007A3D] focus:ring-[#007A3D]"
              />
            </label>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="bg-white dark:bg-[#14231b] p-4 rounded-3xl border border-[#d1ead8] dark:border-[#22382c] shadow-xs space-y-2 text-xs">
          <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
            <span>Item Subtotal</span>
            <span>৳{cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
            <span>Delivery Fee</span>
            <span>{deliveryFee === 0 ? 'FREE' : `৳${deliveryFee.toFixed(2)}`}</span>
          </div>
          {isDonating && (
            <div className="flex justify-between text-emerald-600">
              <span>Charity Donation</span>
              <span>+৳{donation.toFixed(2)}</span>
            </div>
          )}
          {voucherDiscount > 0 && (
            <div className="flex justify-between text-[#EA580C]">
              <span>Discount</span>
              <span>-৳{voucherDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex justify-between font-bold text-sm">
            <span>Total Payable</span>
            <span className="text-[#007A3D] dark:text-emerald-400 text-base font-black">
              ৳{grandTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleProceedPayment}
          disabled={isProcessing}
          className="w-full py-4 px-6 rounded-2xl bg-[#007A3D] hover:bg-[#006230] text-white font-bold text-sm shadow-lg shadow-[#007A3D]/25 flex items-center justify-center gap-2 tap-bounce transition-all disabled:opacity-50"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing Payment...</span>
            </div>
          ) : (
            <span>Confirm &amp; Pay ৳{grandTotal.toFixed(2)}</span>
          )}
        </button>
      </div>

      {/* MFS (bKash / Nagad) Modal (Figma Row 04) */}
      {mfsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-xs bg-white dark:bg-[#121f18] rounded-3xl p-5 border border-[#d1ead8] dark:border-[#22382c] shadow-2xl text-center">
            {/* Logo */}
            <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 mx-auto flex items-center justify-center font-black text-sm mb-3">
              {paymentMethod === 'bKash' ? 'bKash' : 'Nagad'}
            </div>

            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {paymentMethod} Payment
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Amount to pay:{' '}
              <span className="font-bold text-[#007A3D]">
                ৳{grandTotal.toFixed(2)}
              </span>
            </p>

            {/* Step 1: Account Number */}
            {mfsStep === 1 && (
              <div className="space-y-3">
                <div className="text-left">
                  <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                    Enter your {paymentMethod} account number:
                  </label>
                  <input
                    type="text"
                    value={mfsPhone}
                    onChange={(e) => setMfsPhone(e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl bg-[#F2FAF4] dark:bg-[#172920] border border-[#d1ead8] dark:border-[#22382c] text-sm font-semibold text-center focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-neutral-400">
                  An OTP will be sent to your mobile number.
                </p>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setMfsModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-600 dark:text-neutral-300 tap-bounce"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setMfsStep(2)}
                    className="flex-1 py-2.5 rounded-xl bg-[#007A3D] text-white text-xs font-bold tap-bounce"
                  >
                    Send OTP
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Verify OTP */}
            {mfsStep === 2 && (
              <div className="space-y-3">
                <p className="text-[11px] text-neutral-600 dark:text-neutral-300">
                  Enter 5-digit verification code sent to {mfsPhone}:
                </p>
                <div className="flex justify-center gap-2">
                  {mfsOtp.map((val, idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength={1}
                      value={val}
                      onChange={(e) => {
                        const newOtp = [...mfsOtp];
                        newOtp[idx] = e.target.value;
                        setMfsOtp(newOtp);
                      }}
                      className="w-10 h-11 text-center font-bold text-base rounded-xl bg-[#F2FAF4] dark:bg-[#172920] border border-[#007A3D] text-[#007A3D]"
                    />
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setMfsStep(1)}
                    className="flex-1 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-600"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setMfsStep(3)}
                    className="flex-1 py-2.5 rounded-xl bg-[#007A3D] text-white text-xs font-bold tap-bounce"
                  >
                    Verify OTP
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Enter PIN */}
            {mfsStep === 3 && (
              <div className="space-y-3">
                <div className="text-left">
                  <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-[#007A3D]" />
                    Enter your secret PIN:
                  </label>
                  <input
                    type="password"
                    maxLength={5}
                    placeholder="•••••"
                    value={mfsPin}
                    onChange={(e) => setMfsPin(e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl bg-[#F2FAF4] dark:bg-[#172920] border border-[#d1ead8] dark:border-[#22382c] text-center text-lg tracking-widest font-bold focus:outline-none"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setMfsStep(2)}
                    className="flex-1 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-600"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => triggerOrderSuccess(paymentMethod)}
                    className="flex-1 py-2.5 rounded-xl bg-[#007A3D] text-white text-xs font-bold tap-bounce"
                  >
                    Confirm &amp; Pay
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
