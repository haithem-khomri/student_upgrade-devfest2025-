'use client';

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  points: number;
  type: 'theory' | 'algorithm' | 'programming' | 'comparison' | 'design' | 'sql';
}

interface ExamFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
}

export default function ExamForm({ initialData, onSubmit }: ExamFormProps) {
  const [formData, setFormData] = useState({
    module_id: '',
    title: '',
    type: 'final',
    exam_date: '',
    duration_minutes: 90,
    total_points: 20,
    questions: [] as Question[],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        exam_date: initialData.exam_date ? new Date(initialData.exam_date).toISOString().slice(0, 16) : ''
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration_minutes' || name === 'total_points'
        ? parseInt(value) || 0
        : value
    }));
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, {
        id: Date.now().toString(),
        text: '',
        points: 4,
        type: 'theory' as const
      }]
    }));
  };

  const removeQuestion = (id: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }));
  };

  const updateQuestion = (id: string, field: keyof Question, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === id ? { ...q, [field]: value } : q
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const totalPoints = formData.questions.reduce((sum, q) => sum + q.points, 0);

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
            نوع الامتحان *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#4b58ff]"
          >
            <option value="midterm">امتحان جزئي</option>
            <option value="final">امتحان نهائي</option>
            <option value="rattrapage">امتحان استدراك</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-white mb-2">
            عنوان الامتحان *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted focus:outline-none focus:border-[#4b58ff]"
            placeholder="مثال: امتحان الخوارزميات - دورة جانفي 2024"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            التاريخ والوقت *
          </label>
          <input
            type="datetime-local"
            name="exam_date"
            value={formData.exam_date}
            onChange={handleChange}
            required
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#4b58ff]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            المدة (دقائق) *
          </label>
          <input
            type="number"
            name="duration_minutes"
            value={formData.duration_minutes}
            onChange={handleChange}
            required
            min="30"
            step="15"
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted focus:outline-none focus:border-[#4b58ff]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            إجمالي النقاط *
          </label>
          <input
            type="number"
            name="total_points"
            value={formData.total_points}
            onChange={handleChange}
            required
            min="10"
            step="5"
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted focus:outline-none focus:border-[#4b58ff]"
          />
        </div>
      </div>

      {/* Questions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <label className="block text-sm font-medium text-white">
              الأسئلة
            </label>
            <p className="text-xs text-muted mt-1">
              إجمالي النقاط: {totalPoints} / {formData.total_points}
            </p>
          </div>
          <button
            type="button"
            onClick={addQuestion}
            className="btn btn-ghost text-sm flex items-center gap-2"
          >
            <Plus size={16} />
            إضافة سؤال
          </button>
        </div>

        <div className="space-y-4">
          {formData.questions.map((question, index) => (
            <div key={question.id} className="card-glass p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-white">سؤال {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeQuestion(question.id)}
                  className="p-1 rounded-lg hover:bg-red-500/20 text-muted hover:text-red-400 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-muted mb-1">نص السؤال *</label>
                  <textarea
                    value={question.text}
                    onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                    rows={2}
                    required
                    className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#4b58ff] resize-none"
                    placeholder="اكتب نص السؤال هنا..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted mb-1">النقاط</label>
                    <input
                      type="number"
                      value={question.points}
                      onChange={(e) => updateQuestion(question.id, 'points', parseInt(e.target.value) || 0)}
                      min="1"
                      className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#4b58ff]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-muted mb-1">النوع</label>
                    <select
                      value={question.type}
                      onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                      className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#4b58ff]"
                    >
                      <option value="theory">نظري</option>
                      <option value="algorithm">خوارزمية</option>
                      <option value="programming">برمجة</option>
                      <option value="comparison">مقارنة</option>
                      <option value="design">تصميم</option>
                      <option value="sql">SQL</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {formData.questions.length === 0 && (
            <div className="text-center py-8 text-muted">
              <p>لا توجد أسئلة. اضغط على "إضافة سؤال" لإضافة سؤال جديد.</p>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}

