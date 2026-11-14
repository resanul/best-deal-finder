'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, Phone, Send, Mic, Sparkles } from 'lucide-react';
import { ChatMessage } from '@/types/ecom';

export default function CustomerServiceChat() {
  const { navigateBack } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'support',
      text: 'Hello, good morning. I am Halal Shop 24/7 Customer Care. How can I help you today?',
      time: '09:00 AM',
    },
    {
      id: 'm2',
      sender: 'user',
      text: 'Hi, I need assistance with my order and delivery address.',
      time: '09:01 AM',
    },
    {
      id: 'm3',
      sender: 'support',
      text: 'Sure! Please provide your order number or let me know which address you would like to update.',
      time: '09:01 AM',
    },
  ]);

  const [inputText, setInputText] = useState('');

  const quickQuestions = [
    'Where is my order?',
    'Payment issues with bKash',
    'How does product donation work?',
    'Apply 30% discount voucher',
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      time: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Automated smart agent response
    setTimeout(() => {
      let reply = 'Thank you for contacting us! An agent will inspect this shortly.';
      const lower = text.toLowerCase();
      if (lower.includes('where') || lower.includes('order')) {
        reply = 'Your active order #ECOM-20268801 is currently Out for Delivery with rider Rafiqul Islam. Estimated arrival is within 25 minutes!';
      } else if (lower.includes('bkash') || lower.includes('payment')) {
        reply = 'For bKash & Nagad payments, charges are 100% free with 0% gateway commission. If debited without order confirmation, funds automatically revert within 2 hours.';
      } else if (lower.includes('donation') || lower.includes('giving')) {
        reply = '100% of your sponsored product donations go directly to certified local charity food drives across Dhaka!';
      } else if (lower.includes('voucher') || lower.includes('discount')) {
        reply = 'You can use voucher code "SAVE30" at checkout for 30% discount on all snack & chip items!';
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'support',
        text: reply,
        time: 'Just now',
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 800);
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-[#F4FBF6] dark:bg-[#0B1410] text-neutral-900 dark:text-neutral-100">
      {/* Header */}
      <div className="bg-white dark:bg-[#121f18] p-4 flex items-center justify-between border-b border-[#d1ead8] dark:border-[#22382c] sticky top-0 z-20">
        <button
          onClick={navigateBack}
          className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 tap-bounce"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center justify-center gap-1.5">
            Customer Service
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </h2>
          <span className="text-[10px] text-neutral-400">Online 24/7 Support</span>
        </div>

        <a
          href="tel:+8801819284920"
          className="p-2 rounded-full bg-[#ECFDF5] dark:bg-[#1c3327] text-[#007A3D] tap-bounce"
          title="Direct Call"
        >
          <Phone className="w-4 h-4" />
        </a>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  isUser
                    ? 'bg-[#007A3D] text-white rounded-br-xs shadow-xs'
                    : 'bg-white dark:bg-[#14231b] text-neutral-800 dark:text-neutral-100 border border-[#d1ead8] dark:border-[#22382c] rounded-bl-xs shadow-xs'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9px] text-neutral-400 mt-1 px-1">
                {m.time}
              </span>
            </div>
          );
        })}
      </div>

      {/* Quick suggestions */}
      <div className="px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#14231b] border border-[#d1ead8] dark:border-[#22382c] text-[11px] font-medium text-neutral-700 dark:text-neutral-300 whitespace-nowrap hover:bg-[#F2FAF4] tap-bounce"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <div className="p-3 bg-white dark:bg-[#121f18] border-t border-[#d1ead8] dark:border-[#22382c] flex items-center gap-2">
        <button
          onClick={() => handleSend('Voice message transcribed')}
          className="p-2.5 rounded-2xl text-neutral-400 hover:text-[#007A3D] tap-bounce"
        >
          <Mic className="w-4 h-4" />
        </button>

        <input
          type="text"
          placeholder="Type message here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend(inputText);
          }}
          className="flex-1 px-4 py-2.5 rounded-2xl bg-[#F2FAF4] dark:bg-[#172920] border border-[#d1ead8] dark:border-[#22382c] text-xs text-neutral-900 dark:text-white focus:outline-none"
        />

        <button
          onClick={() => handleSend(inputText)}
          className="p-2.5 rounded-2xl bg-[#007A3D] text-white tap-bounce hover:bg-[#006230]"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
