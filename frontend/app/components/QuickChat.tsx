'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Sparkles, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function QuickChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.',
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    'كيف أستعد للامتحانات؟',
    'نصائح للتركيز أثناء الدراسة',
    'كيف أنظم وقتي؟',
  ];

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-[#4b58ff] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
        style={{ boxShadow: '0 0 30px rgba(75, 88, 255, 0.5)' }}
      >
        <MessageSquare size={28} />
      </button>

      {/* Chat Panel */}
      <div
        className={`fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isOpen
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        }`}
        style={{ boxShadow: '0 0 60px rgba(75, 88, 255, 0.2)' }}
      >
        {/* Header */}
        <div className="bg-[#4b58ff] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-white font-bold">المساعد الذكي</h3>
              <p className="text-white/70 text-xs">اسأل أي سؤال سريع</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Messages */}
        <div className="h-[350px] overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#4b58ff]/10 flex items-center justify-center">
                <Bot className="text-[#4b58ff]" size={32} />
              </div>
              <p className="text-white font-semibold mb-2">مرحباً! 👋</p>
              <p className="text-muted text-sm mb-6">كيف يمكنني مساعدتك اليوم؟</p>
              
              {/* Quick Questions */}
              <div className="space-y-2">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="w-full text-right px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white hover:border-[#4b58ff]/50 hover:bg-[#4b58ff]/5 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user'
                    ? 'bg-[#4b58ff]'
                    : 'bg-white/[0.05] border border-white/10'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="text-white" size={16} />
                ) : (
                  <Bot className="text-[#4b58ff]" size={16} />
                )}
              </div>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-[#4b58ff] text-white'
                    : 'bg-white/[0.03] border border-white/10 text-white'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center">
                <Bot className="text-[#4b58ff]" size={16} />
              </div>
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3">
                <div className="flex gap-1.5">
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
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="اكتب سؤالك..."
              className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-muted focus:outline-none focus:border-[#4b58ff]"
              disabled={isLoading}
              dir="rtl"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="w-12 h-12 rounded-xl bg-[#4b58ff] text-white flex items-center justify-center disabled:opacity-50 hover:bg-[#5b68ff] transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

