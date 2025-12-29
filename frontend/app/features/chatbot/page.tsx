'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, ArrowRight, MessageSquare, Bot, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { chatbotApi, ChatMessage } from '@/lib/api/chatbot';
import { useAuthStore } from '@/lib/store/auth';

export default function ChatbotPage() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async () => {
    try {
      const history = await chatbotApi.getHistory();
      setMessages(history);
    } catch (error) {
      console.error('فشل تحميل سجل المحادثات:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatbotApi.sendMessage({
        message: input,
        context: { level: user?.level, modules: user?.modules },
        language: 'ar',
        shortAnswer: isMobile,
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = ['كيف أستعد للامتحان؟', 'نصائح للدراسة', 'مساعدة في الرياضيات'];

  return (
    <div className="flex flex-col h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 grid-pattern opacity-20" />
      <div className="fixed top-20 right-20 w-80 h-80 bg-[#4b58ff]/8 rounded-full blur-[120px]" />

      {/* Header */}
      <header className="glass px-5 lg:px-8 flex items-center gap-4 h-16 relative z-10">
        <Link href="/dashboard" className="btn btn-ghost px-2 py-1.5">
          <ArrowRight size={20} className="text-white" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4b58ff] flex items-center justify-center">
            <MessageSquare className="text-white" size={20} />
          </div>
          <h1 className="text-lg font-bold text-white">المساعد الذكي</h1>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 lg:px-8 py-8 space-y-5 relative z-10">
        {messages.length === 0 && (
          <div className="text-center mt-16 lg:mt-24">
            <div className="mx-auto mb-8">
              <Image src="/icon.png" alt="AI" width={120} height={120} className="object-contain h-24 w-auto mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">ابدأ محادثة</h2>
            <p className="text-muted font-light mb-10">اسأل عن الجامعة، المواد، أو نصائح الدراسة</p>
            
            <div className="flex flex-wrap justify-center gap-3">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-5 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white font-medium hover:border-[#4b58ff]/50 hover:bg-[#4b58ff]/5 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''} animate-slideUp`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              message.role === 'user' 
                ? 'bg-[#4b58ff]' 
                : 'bg-white/[0.05] border border-white/10'
            }`}>
              {message.role === 'user' ? (
                <User className="text-white" size={18} />
              ) : (
                <Bot className="text-[#4b58ff]" size={18} />
              )}
            </div>
            <div
              className={`max-w-[75%] lg:max-w-[60%] rounded-2xl p-5 ${
                message.role === 'user'
                  ? 'bg-[#4b58ff] text-white'
                  : 'bg-white/[0.03] border border-white/10 text-white'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed font-light">{message.content}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4 animate-slideUp">
            <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
              <Bot className="text-[#4b58ff]" size={18} />
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-[#4b58ff] rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-[#4b58ff] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <div className="w-2 h-2 bg-[#4b58ff] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="glass border-t border-white/5 p-5 relative z-10">
        <div className="max-w-4xl mx-auto flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اكتب رسالتك..."
            className="input flex-1"
            disabled={isLoading}
            dir="rtl"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="btn btn-primary px-6 disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
