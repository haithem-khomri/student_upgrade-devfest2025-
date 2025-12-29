'use client';

import { useState, useRef } from 'react';
import { ArrowRight, FileText, Sparkles, Download, Copy, CheckCircle, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { contentGeneratorApi, ContentGenerationRequest } from '@/lib/api/content-generator';

export default function ContentGeneratorPage() {
  const [type, setType] = useState<'summary' | 'flashcards' | 'quiz' | 'exam-questions' | 'analysis'>('summary');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!content.trim()) {
      alert('الرجاء إدخال بعض المحتوى');
      return;
    }

    setIsLoading(true);
    try {
      const request: ContentGenerationRequest = {
        type,
        content,
        moduleId: selectedModule || undefined,
        options: { language: 'ar', difficulty: 'medium' },
      };

      const result = await contentGeneratorApi.generate(request);
      setGeneratedContent(result);
    } catch (error) {
      console.error('فشل توليد المحتوى:', error);
      alert('فشل توليد المحتوى. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    const text = typeof generatedContent?.content === 'string' 
      ? generatedContent.content 
      : JSON.stringify(generatedContent?.content, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const typeOptions = [
    { value: 'summary', label: 'ملخص', emoji: '📝' },
    { value: 'flashcards', label: 'بطاقات تعليمية', emoji: '🎴' },
    { value: 'quiz', label: 'اختبار', emoji: '❓' },
    { value: 'exam-questions', label: 'أسئلة امتحان', emoji: '📋' },
    { value: 'analysis', label: 'تحليل', emoji: '📊' },
  ];

  const renderGeneratedContent = () => {
    if (!generatedContent) return null;

    switch (generatedContent.type) {
      case 'summary':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>📝</span> الملخص
            </h3>
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10">
              {typeof generatedContent.content === 'string' ? (
                <p className="whitespace-pre-wrap text-muted font-light leading-relaxed">{generatedContent.content}</p>
              ) : (
                <pre className="whitespace-pre-wrap text-muted text-sm font-light">{JSON.stringify(generatedContent.content, null, 2)}</pre>
              )}
            </div>
          </div>
        );

      case 'flashcards':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🎴</span> البطاقات التعليمية
            </h3>
            <div className="grid gap-4">
              {Array.isArray(generatedContent.content) ? (
                generatedContent.content.map((card: any, idx: number) => (
                  <div key={idx} className="p-5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-[#4b58ff]/30 transition-colors">
                    <div className="font-semibold text-white mb-3">{card.question || card.front}</div>
                    <div className="text-muted font-light pt-3 border-t border-white/10">{card.answer || card.back}</div>
                  </div>
                ))
              ) : (
                <pre className="whitespace-pre-wrap text-muted text-sm font-light">{JSON.stringify(generatedContent.content, null, 2)}</pre>
              )}
            </div>
          </div>
        );

      case 'quiz':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>❓</span> أسئلة الاختبار
            </h3>
            <div className="space-y-5">
              {Array.isArray(generatedContent.content) ? (
                generatedContent.content.map((question: any, idx: number) => (
                  <div key={idx} className="p-5 rounded-xl bg-white/[0.02] border border-white/10">
                    <div className="font-semibold text-white mb-4">{idx + 1}. {question.question}</div>
                    <div className="space-y-2">
                      {question.options?.map((option: string, optIdx: number) => (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-lg text-sm ${
                            optIdx === question.correctAnswer
                              ? 'bg-[#00d26a]/10 border border-[#00d26a]/30 text-white'
                              : 'bg-white/[0.02] text-muted'
                          }`}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <pre className="whitespace-pre-wrap text-muted text-sm font-light">{JSON.stringify(generatedContent.content, null, 2)}</pre>
              )}
            </div>
          </div>
        );

      default:
        return (
          <pre className="whitespace-pre-wrap p-5 rounded-xl bg-white/[0.02] border border-white/10 text-muted text-sm font-light">
            {JSON.stringify(generatedContent.content, null, 2)}
          </pre>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 grid-pattern opacity-20" />
      <div className="fixed top-1/2 right-10 w-96 h-96 bg-[#4b58ff]/8 rounded-full blur-[150px]" />

      {/* Header */}
      <header className="glass px-5 lg:px-8 flex items-center gap-4 h-16 relative z-10">
        <Link href="/dashboard" className="btn btn-ghost px-2 py-1.5">
          <ArrowRight size={20} className="text-white" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4b58ff] flex items-center justify-center">
            <FileText className="text-white" size={20} />
          </div>
          <h1 className="text-lg font-bold text-white">مولد المحتوى</h1>
        </div>
      </header>

      <main className="container-desktop py-10 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Input Section */}
          <div className="card-glass space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="text-[#4b58ff]" size={22} />
              <h2 className="text-xl font-bold text-white">توليد محتوى دراسي</h2>
            </div>

            {/* Type Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-white">نوع المحتوى</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {typeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setType(option.value as any)}
                    className={`p-4 rounded-xl text-center transition-all ${
                      type === option.value
                        ? 'bg-[#4b58ff] text-white glow'
                        : 'bg-white/[0.03] border border-white/10 text-muted hover:border-[#4b58ff]/30'
                    }`}
                  >
                    <span className="text-xl mb-2 block">{option.emoji}</span>
                    <span className="text-xs font-semibold">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Module Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-white">المقرر (اختياري)</label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="input"
              >
                <option value="">بدون تحديد</option>
                <option value="1">الرياضيات</option>
                <option value="2">الفيزياء</option>
                <option value="3">علوم الحاسوب</option>
              </select>
            </div>

            {/* PDF Upload */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-white">رفع ملف PDF (اختياري)</label>
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadedFile(file);
                      setIsExtracting(true);
                      try {
                        const result = await contentGeneratorApi.extractPdf(file);
                        setContent(result.text);
                        alert(`تم استخراج النص من PDF بنجاح! (${result.length} حرف)`);
                      } catch (error: any) {
                        console.error('فشل استخراج النص:', error);
                        alert(`فشل استخراج النص: ${error.message || 'حدث خطأ غير متوقع'}`);
                        setUploadedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      } finally {
                        setIsExtracting(false);
                      }
                    }
                  }}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isExtracting}
                    className="btn btn-outline flex items-center gap-2 px-4 disabled:opacity-50"
                  >
                    {isExtracting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        جاري الاستخراج...
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        {uploadedFile ? 'تغيير الملف' : 'اختر ملف PDF'}
                      </>
                    )}
                  </button>
                  {uploadedFile && (
                    <div className="flex items-center gap-2 flex-1">
                      <FileText size={18} className="text-[#4b58ff]" />
                      <span className="text-sm text-muted truncate flex-1">{uploadedFile.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedFile(null);
                          setContent('');
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        <X size={16} className="text-muted" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content Input */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-white">
                المحتوى {uploadedFile && <span className="text-[#4b58ff]">(من PDF)</span>}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="الصق مادتك الدراسية هنا أو ارفع ملف PDF..."
                className="input min-h-[200px] resize-y"
                dir="rtl"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !content.trim() || isExtracting}
              className="btn btn-primary w-full py-4 text-lg disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري التوليد...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <Sparkles size={20} />
                  توليد المحتوى
                </span>
              )}
            </button>
          </div>

          {/* Generated Content */}
          {generatedContent && (
            <div className="card-glass animate-slideUp">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">المحتوى المولّد</h2>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleCopy}
                    className="btn btn-ghost text-sm flex items-center gap-2 px-4"
                  >
                    {copied ? (
                      <>
                        <CheckCircle size={16} className="text-[#00d26a]" />
                        تم النسخ
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        نسخ
                      </>
                    )}
                  </button>
                  <button className="btn btn-outline text-sm flex items-center gap-2 px-4">
                    <Download size={16} />
                    تنزيل
                  </button>
                </div>
              </div>
              {renderGeneratedContent()}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
