'use client';

import { HelpCircle, MessageSquare, Book, Mail, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { useState } from 'react';

interface FAQ {
  question: string;
  answer: string;
}

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs: FAQ[] = [
    {
      question: 'كيف أبدأ استخدام المنصة؟',
      answer: 'بعد تسجيل الدخول، ستجد لوحة التحكم التي تعرض موادك المسجلة. يمكنك النقر على أي مادة لعرض الدروس والأعمال الموجهة والامتحانات.'
    },
    {
      question: 'كيف أستخدم المساعد الذكي؟',
      answer: 'يمكنك الوصول للمساعد الذكي من القائمة الجانبية أو من خلال الزر العائم في الصفحة الرئيسية. اكتب سؤالك وسيجيبك الذكاء الاصطناعي فوراً.'
    },
    {
      question: 'كيف أنشئ بطاقات تعليمية؟',
      answer: 'من صفحة المادة، انقر على "إنشاء بطاقات تعليمية" وسيقوم الذكاء الاصطناعي بإنشاء بطاقات من محتوى الدروس تلقائياً.'
    },
    {
      question: 'هل يمكنني تحميل ملفاتي الخاصة؟',
      answer: 'حالياً، المنصة تستخدم المحتوى المتوفر من الجامعة. نعمل على إضافة خاصية رفع الملفات قريباً.'
    },
    {
      question: 'كيف أتتبع تقدمي؟',
      answer: 'من القائمة الجانبية، اختر "تقدمي" لمشاهدة إحصائيات دراستك، ساعات المذاكرة، والإنجازات التي حققتها.'
    },
  ];

  return (
    <DashboardLayout 
      title="المساعدة"
      subtitle="احصل على المساعدة والدعم"
    >
      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <a 
          href="mailto:support@studentai.dz"
          className="card-glass p-5 flex items-center gap-4 group hover:border-[#4b58ff]/30 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-[#4b58ff]/20 flex items-center justify-center">
            <Mail className="text-[#4b58ff]" size={24} />
          </div>
          <div>
            <h4 className="text-white font-semibold group-hover:text-[#4b58ff] transition-colors">راسلنا</h4>
            <p className="text-sm text-muted">support@studentai.dz</p>
          </div>
        </a>
        
        <a 
          href="#"
          className="card-glass p-5 flex items-center gap-4 group hover:border-[#4b58ff]/30 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
            <MessageSquare className="text-green-400" size={24} />
          </div>
          <div>
            <h4 className="text-white font-semibold group-hover:text-[#4b58ff] transition-colors">الدردشة المباشرة</h4>
            <p className="text-sm text-muted">متاح 24/7</p>
          </div>
        </a>
        
        <a 
          href="#"
          className="card-glass p-5 flex items-center gap-4 group hover:border-[#4b58ff]/30 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <Book className="text-orange-400" size={24} />
          </div>
          <div>
            <h4 className="text-white font-semibold group-hover:text-[#4b58ff] transition-colors">دليل المستخدم</h4>
            <p className="text-sm text-muted">تعلم كيفية الاستخدام</p>
          </div>
        </a>
      </div>

      {/* FAQs */}
      <div className="card-glass p-6">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <HelpCircle className="text-[#4b58ff]" size={20} />
          الأسئلة الشائعة
        </h3>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white/5 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full p-4 flex items-center justify-between text-right"
              >
                <span className="text-white font-medium">{faq.question}</span>
                {openFaq === index ? (
                  <ChevronUp className="text-muted shrink-0" size={20} />
                ) : (
                  <ChevronDown className="text-muted shrink-0" size={20} />
                )}
              </button>
              {openFaq === index && (
                <div className="px-4 pb-4 text-muted">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className="card-glass p-6 mt-6">
        <h3 className="text-lg font-bold text-white mb-6">لم تجد إجابة؟ راسلنا</h3>
        <form className="space-y-4">
          <div>
            <label className="text-sm text-muted mb-1 block">الموضوع</label>
            <input 
              type="text"
              placeholder="عنوان الرسالة"
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted focus:outline-none focus:border-[#4b58ff]"
            />
          </div>
          <div>
            <label className="text-sm text-muted mb-1 block">الرسالة</label>
            <textarea 
              rows={4}
              placeholder="اكتب رسالتك هنا..."
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted focus:outline-none focus:border-[#4b58ff] resize-none"
            />
          </div>
          <button type="submit" className="btn btn-primary w-full">
            إرسال الرسالة
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

