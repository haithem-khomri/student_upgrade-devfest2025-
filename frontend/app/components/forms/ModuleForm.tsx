'use client';

import { useState, useEffect } from 'react';

interface ModuleFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
}

export default function ModuleForm({ initialData, onSubmit }: ModuleFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    name_fr: '',
    code: '',
    speciality_id: '',
    year: 'L1',
    semester: 1,
    credits: 6,
    coefficient: 3,
    difficulty: 5,
    description: '',
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
      [name]: name === 'semester' || name === 'credits' || name === 'coefficient' || name === 'difficulty'
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
            اسم المادة (عربي) *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted focus:outline-none focus:border-[#4b58ff]"
            placeholder="مثال: الخوارزميات وهياكل البيانات"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            اسم المادة (فرنسي)
          </label>
          <input
            type="text"
            name="name_fr"
            value={formData.name_fr}
            onChange={handleChange}
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted focus:outline-none focus:border-[#4b58ff]"
            placeholder="Algorithmique et Structures de Données"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            رمز المادة *
          </label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            required
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted focus:outline-none focus:border-[#4b58ff] uppercase"
            placeholder="ALGO1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            التخصص *
          </label>
          <select
            name="speciality_id"
            value={formData.speciality_id}
            onChange={handleChange}
            required
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#4b58ff]"
          >
            <option value="">اختر التخصص</option>
            <option value="info-l">إعلام آلي - ليسانس</option>
            <option value="ia-m">الذكاء الاصطناعي - ماستر</option>
            <option value="rsd-m">شبكات وأنظمة موزعة - ماستر</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            المستوى *
          </label>
          <select
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#4b58ff]"
          >
            <option value="L1">L1</option>
            <option value="L2">L2</option>
            <option value="L3">L3</option>
            <option value="M1">M1</option>
            <option value="M2">M2</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            الفصل *
          </label>
          <select
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            required
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#4b58ff]"
          >
            <option value={1}>الفصل الأول</option>
            <option value={2}>الفصل الثاني</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            الرصيد (Credits) *
          </label>
          <input
            type="number"
            name="credits"
            value={formData.credits}
            onChange={handleChange}
            required
            min="1"
            max="10"
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted focus:outline-none focus:border-[#4b58ff]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            المعامل (Coefficient) *
          </label>
          <input
            type="number"
            name="coefficient"
            value={formData.coefficient}
            onChange={handleChange}
            required
            min="1"
            max="5"
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted focus:outline-none focus:border-[#4b58ff]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            الصعوبة (1-10) *
          </label>
          <input
            type="number"
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            required
            min="1"
            max="10"
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted focus:outline-none focus:border-[#4b58ff]"
          />
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#4b58ff] transition-all"
                  style={{ width: `${(formData.difficulty / 10) * 100}%` }}
                />
              </div>
              <span className="text-sm text-muted">{formData.difficulty}/10</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          الوصف
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted focus:outline-none focus:border-[#4b58ff] resize-none"
          placeholder="وصف مختصر للمادة..."
        />
      </div>
    </form>
  );
}

