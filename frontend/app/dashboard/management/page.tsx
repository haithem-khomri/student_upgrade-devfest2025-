'use client';

import { useState, useEffect } from 'react';
import { Settings, BookOpen, FileText, ClipboardList, GraduationCap, Plus, Search, Edit, Trash2, Loader2 } from 'lucide-react';
import DashboardLayout from '@/app/components/DashboardLayout';
import FormModal from '@/app/components/FormModal';
import ModuleForm from '@/app/components/forms/ModuleForm';
import CourseForm from '@/app/components/forms/CourseForm';
import TDForm from '@/app/components/forms/TDForm';
import ExamForm from '@/app/components/forms/ExamForm';
import axios from 'axios';

type ManagementTab = 'modules' | 'courses' | 'tds' | 'exams';

export default function ManagementPage() {
  const [activeTab, setActiveTab] = useState<ManagementTab>('modules');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleAdd = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        await axios.delete(`${API_BASE_URL}/api/management/${activeTab}/${id}`);
        // Refresh data
        window.location.reload();
      } catch (error) {
        console.error('Error deleting:', error);
        alert('حدث خطأ في حذف العنصر');
      }
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const endpoint = `/api/management/${activeTab}`;
      
      if (editingItem) {
        // Update
        await axios.put(`${API_BASE_URL}${endpoint}/${editingItem.id}`, data);
      } else {
        // Create
        await axios.post(`${API_BASE_URL}${endpoint}`, data);
      }
      
      setIsFormOpen(false);
      setEditingItem(null);
      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error('Error saving:', error);
      alert('حدث خطأ في حفظ البيانات');
    }
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'modules':
        return <ModuleForm initialData={editingItem} onSubmit={handleSubmit} />;
      case 'courses':
        return <CourseForm initialData={editingItem} onSubmit={handleSubmit} />;
      case 'tds':
        return <TDForm initialData={editingItem} onSubmit={handleSubmit} />;
      case 'exams':
        return <ExamForm initialData={editingItem} onSubmit={handleSubmit} />;
      default:
        return null;
    }
  };

  const getFormTitle = () => {
    const titles = {
      modules: editingItem ? 'تعديل المادة' : 'إضافة مادة جديدة',
      courses: editingItem ? 'تعديل الدرس' : 'إضافة درس جديد',
      tds: editingItem ? 'تعديل TD' : 'إضافة TD جديد',
      exams: editingItem ? 'تعديل الامتحان' : 'إضافة امتحان جديد',
    };
    return titles[activeTab];
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const response = await axios.get(`${API_BASE_URL}/api/management/${activeTab}`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to mock data
      setData(mockData[activeTab]);
    } finally {
      setLoading(false);
    }
  };

  // Mock data - fallback
  const mockData = {
    modules: [
      { id: '1', name: 'الخوارزميات', code: 'ALGO1', credits: 6, semester: 1 },
      { id: '2', name: 'البرمجة C', code: 'PROG1', credits: 4, semester: 1 },
    ],
    courses: [
      { id: '1', title: 'مقدمة في الخوارزميات', chapter: 1, module: 'ALGO1', duration: 3 },
      { id: '2', title: 'تعقيد الخوارزميات', chapter: 2, module: 'ALGO1', duration: 4 },
    ],
    tds: [
      { id: '1', title: 'TD 1: خوارزميات أساسية', number: 1, module: 'ALGO1', exercises: 3 },
      { id: '2', title: 'TD 2: تعقيد الخوارزميات', number: 2, module: 'ALGO1', exercises: 2 },
    ],
    exams: [
      { id: '1', title: 'امتحان الخوارزميات', type: 'final', module: 'ALGO1', date: '2024-02-15', duration: 90 },
      { id: '2', title: 'امتحان البرمجة', type: 'midterm', module: 'PROG1', date: '2024-02-20', duration: 120 },
    ],
  };

  const currentData = data.length > 0 ? data : mockData[activeTab];
  
  const filteredData = currentData.filter((item: any) => {
    const searchLower = searchQuery.toLowerCase();
    if (activeTab === 'modules') {
      return item.name?.toLowerCase().includes(searchLower) || item.code?.toLowerCase().includes(searchLower);
    } else if (activeTab === 'courses') {
      return item.title?.toLowerCase().includes(searchLower);
    } else if (activeTab === 'tds') {
      return item.title?.toLowerCase().includes(searchLower);
    } else if (activeTab === 'exams') {
      return item.title?.toLowerCase().includes(searchLower);
    }
    return true;
  });

  return (
    <DashboardLayout 
      title="إدارة المحتوى"
      subtitle="إدارة المواد والدروس والامتحانات"
    >
      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('modules')}
          className={`px-5 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'modules' 
              ? 'bg-[#4b58ff] text-white' 
              : 'bg-white/5 text-muted hover:bg-white/10'
          }`}
        >
          <BookOpen size={18} />
          المواد
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-5 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'courses' 
              ? 'bg-[#4b58ff] text-white' 
              : 'bg-white/5 text-muted hover:bg-white/10'
          }`}
        >
          <FileText size={18} />
          الدروس
        </button>
        <button
          onClick={() => setActiveTab('tds')}
          className={`px-5 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'tds' 
              ? 'bg-[#4b58ff] text-white' 
              : 'bg-white/5 text-muted hover:bg-white/10'
          }`}
        >
          <ClipboardList size={18} />
          الأعمال الموجهة
        </button>
        <button
          onClick={() => setActiveTab('exams')}
          className={`px-5 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'exams' 
              ? 'bg-[#4b58ff] text-white' 
              : 'bg-white/5 text-muted hover:bg-white/10'
          }`}
        >
          <GraduationCap size={18} />
          الامتحانات
        </button>
      </div>

      {/* Search and Add */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="البحث..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-12 pl-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted focus:outline-none focus:border-[#4b58ff]"
          />
        </div>
        <button
          onClick={handleAdd}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          إضافة جديد
        </button>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="card-glass p-12 text-center">
          <Loader2 className="animate-spin text-[#4b58ff] mx-auto mb-4" size={40} />
          <p className="text-muted">جاري التحميل...</p>
        </div>
      ) : (
        <div className="card-glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  {activeTab === 'modules' && (
                    <>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-white">الكود</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-white">الاسم</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-white">الرصيد</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-white">الفصل</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-white">الإجراءات</th>
                    </>
                  )}
                  {activeTab === 'courses' && (
                    <>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-white">الفصل</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-white">العنوان</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-white">المادة</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-white">المدة</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-white">الإجراءات</th>
                    </>
                  )}
                  {activeTab === 'tds' && (
                    <>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-white">الرقم</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-white">العنوان</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-white">المادة</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-white">التمارين</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-white">الإجراءات</th>
                    </>
                  )}
                  {activeTab === 'exams' && (
                    <>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-white">العنوان</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-white">النوع</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-white">المادة</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-white">التاريخ</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-white">الإجراءات</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted">
                      لا توجد بيانات
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item: any) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  {activeTab === 'modules' && (
                    <>
                      <td className="px-6 py-4 text-white font-medium">{item.code}</td>
                      <td className="px-6 py-4 text-white">{item.name}</td>
                      <td className="px-6 py-4 text-muted">{item.credits}</td>
                      <td className="px-6 py-4 text-muted">S{item.semester}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-[#4b58ff] transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                  {activeTab === 'courses' && (
                    <>
                      <td className="px-6 py-4 text-white font-medium">{item.chapter}</td>
                      <td className="px-6 py-4 text-white">{item.title}</td>
                      <td className="px-6 py-4 text-muted">{item.module}</td>
                      <td className="px-6 py-4 text-muted">{item.duration}h</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-[#4b58ff] transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                  {activeTab === 'tds' && (
                    <>
                      <td className="px-6 py-4 text-white font-medium">{item.number}</td>
                      <td className="px-6 py-4 text-white">{item.title}</td>
                      <td className="px-6 py-4 text-muted">{item.module}</td>
                      <td className="px-6 py-4 text-muted">{item.exercises}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-[#4b58ff] transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                  {activeTab === 'exams' && (
                    <>
                      <td className="px-6 py-4 text-white">{item.title}</td>
                      <td className="px-6 py-4 text-muted">{item.type}</td>
                      <td className="px-6 py-4 text-muted">{item.module}</td>
                      <td className="px-6 py-4 text-muted">{item.date}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-[#4b58ff] transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
        }}
        title={getFormTitle()}
      >
        {renderForm()}
      </FormModal>
    </DashboardLayout>
  );
}

