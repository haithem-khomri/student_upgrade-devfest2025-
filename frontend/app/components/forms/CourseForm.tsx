'use client';

import { useState, useEffect } from 'react';

interface CourseFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
}

export default function CourseForm({ initialData, onSubmit }: CourseFormProps) {
  const [formData, setFormData] = useState({
    module_id: '',
    title: '',
    chapter: 1,
    content: '',
    duration_hours: 3,
    order: 1,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'chapter' || name === 'duration_hours' || name === 'order'
        ? parseInt(value) || 0
        : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            المادة *
          </label>
          <select
            name="module_id"
            value={formData.module_id}
            onChange={handleChange}
            required
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#4b58ff]"
          >
            <option value="">اختر المادة</option>
            <option value="algo1">ALGO1 - الخوارزميات</option>
            <option value="prog1">PROG1 - البرمجة C</option>
            <option value="bdd">BDD - قواعد البيانات</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            رقم الفصل *
          </label>
          <input
            type="number"
            name="chapter"
            value={formData.chapter}
            onChange={handleChange}
            required
            min="1"
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted focus:outline-none focus:border-[#4b58ff]"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-white mb-2">
            عنوان الدرس *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted focus:outline-none focus:border-[#4b58ff]"
            placeholder="مثال: الفصل 1: مقدمة في الخوارزميات"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            المدة (ساعات) *
          </label>
          <input
            type="number"
            name="duration_hours"
            value={formData.duration_hours}
            onChange={handleChange}
            required
            min="0.5"
            step="0.5"
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted focus:outline-none focus:border-[#4b58ff]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            الترتيب *
          </label>
          <input
            type="number"
            name="order"
            value={formData.order}
            onChange={handleChange}
            required
            min="1"
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted focus:outline-none focus:border-[#4b58ff]"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-white mb-2">
            محتوى الدرس *
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows={8}
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted focus:outline-none focus:border-[#4b58ff] resize-none font-mono text-sm"
            placeholder="اكتب محتوى الدرس هنا... يمكنك استخدام Markdown"
          />
          <p className="text-xs text-muted mt-2">
            يمكنك استخدام Markdown للتنسيق (العناوين، القوائم، الروابط، إلخ)
          </p>
        </div>
      </div>
    </form>
  );
}

