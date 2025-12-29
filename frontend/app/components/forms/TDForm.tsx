'use client';

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface TDFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
}

export default function TDForm({ initialData, onSubmit }: TDFormProps) {
  const [formData, setFormData] = useState({
    module_id: '',
    title: '',
    number: 1,
    exercises: [] as Exercise[],
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
      [name]: name === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const addExercise = () => {
    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, {
        id: Date.now().toString(),
        title: '',
        description: '',
        difficulty: 'medium' as const
      }]
    }));
  };

  const removeExercise = (id: string) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter(ex => ex.id !== id)
    }));
  };

  const updateExercise = (id: string, field: keyof Exercise, value: string) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex =>
        ex.id === id ? { ...ex, [field]: value } : ex
      )
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
            رقم TD *
          </label>
          <input
            type="number"
            name="number"
            value={formData.number}
            onChange={handleChange}
            required
            min="1"
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted focus:outline-none focus:border-[#4b58ff]"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-white mb-2">
            عنوان TD *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted focus:outline-none focus:border-[#4b58ff]"
            placeholder="مثال: TD 1: خوارزميات أساسية"
          />
        </div>
      </div>

      {/* Exercises */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-white">
            التمارين
          </label>
          <button
            type="button"
            onClick={addExercise}
            className="btn btn-ghost text-sm flex items-center gap-2"
          >
            <Plus size={16} />
            إضافة تمرين
          </button>
        </div>

        <div className="space-y-4">
          {formData.exercises.map((exercise, index) => (
            <div key={exercise.id} className="card-glass p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-white">تمرين {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeExercise(exercise.id)}
                  className="p-1 rounded-lg hover:bg-red-500/20 text-muted hover:text-red-400 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-muted mb-1">عنوان التمرين</label>
                  <input
                    type="text"
                    value={exercise.title}
                    onChange={(e) => updateExercise(exercise.id, 'title', e.target.value)}
                    className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#4b58ff]"
                    placeholder="عنوان التمرين"
                  />
                </div>

                <div>
                  <label className="block text-xs text-muted mb-1">وصف التمرين</label>
                  <textarea
                    value={exercise.description}
                    onChange={(e) => updateExercise(exercise.id, 'description', e.target.value)}
                    rows={2}
                    className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#4b58ff] resize-none"
                    placeholder="وصف التمرين..."
                  />
                </div>

                <div>
                  <label className="block text-xs text-muted mb-1">الصعوبة</label>
                  <select
                    value={exercise.difficulty}
                    onChange={(e) => updateExercise(exercise.id, 'difficulty', e.target.value)}
                    className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#4b58ff]"
                  >
                    <option value="easy">سهل</option>
                    <option value="medium">متوسط</option>
                    <option value="hard">صعب</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          {formData.exercises.length === 0 && (
            <div className="text-center py-8 text-muted">
              <p>لا توجد تمارين. اضغط على "إضافة تمرين" لإضافة تمرين جديد.</p>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}

