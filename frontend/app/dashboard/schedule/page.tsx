'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar as CalendarIcon, Clock } from 'lucide-react';
import DashboardLayout from '@/app/components/DashboardLayout';
import Calendar from '@/app/components/Calendar';
import FormModal from '@/app/components/FormModal';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  type: 'lecture' | 'td' | 'tp' | 'exam' | 'deadline' | 'custom';
  color?: string;
  description?: string;
  duration?: number;
}

export default function SchedulePage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<{
    title: string;
    date: string;
    time: string;
    type: 'lecture' | 'td' | 'tp' | 'exam' | 'deadline' | 'custom';
    description: string;
    duration: number;
  }>({
    title: '',
    date: '',
    time: '',
    type: 'lecture',
    description: '',
    duration: 2,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await axios.get(`${API_BASE_URL}/api/schedule/events`);
      // setEvents(response.data);
      
      // Mock data for now
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'محاضرة الخوارزميات',
          date: new Date(2024, 0, 15, 8, 0),
          time: '08:00',
          type: 'lecture',
          duration: 2,
        },
        {
          id: '2',
          title: 'TD البرمجة',
          date: new Date(2024, 0, 15, 10, 0),
          time: '10:00',
          type: 'td',
          duration: 1.5,
        },
        {
          id: '3',
          title: 'امتحان قواعد البيانات',
          date: new Date(2024, 1, 20, 8, 0),
          time: '08:00',
          type: 'exam',
          duration: 2,
        },
      ];
      setEvents(mockEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setFormData({
      title: '',
      date: date.toISOString().slice(0, 10),
      time: '08:00',
      type: 'lecture',
      description: '',
      duration: 2,
    });
    setIsFormOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      date: new Date(event.date).toISOString().slice(0, 10),
      time: event.time || '08:00',
      type: event.type,
      description: event.description || '',
      duration: event.duration || 2,
    });
    setIsFormOpen(true);
  };

  const handleAddEvent = (date: Date) => {
    handleDateClick(date);
  };

  const handleSubmit = async () => {
    try {
      const eventData = {
        ...formData,
        date: new Date(`${formData.date}T${formData.time}`),
      };

      if (selectedEvent) {
        // Update existing event
        // await axios.put(`${API_BASE_URL}/api/schedule/events/${selectedEvent.id}`, eventData);
        setEvents(prev => prev.map(e => e.id === selectedEvent.id ? { ...selectedEvent, ...eventData } : e));
      } else {
        // Create new event
        // await axios.post(`${API_BASE_URL}/api/schedule/events`, eventData);
        const newEvent: CalendarEvent = {
          id: Date.now().toString(),
          ...eventData,
        };
        setEvents(prev => [...prev, newEvent]);
      }

      setIsFormOpen(false);
      setSelectedDate(null);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    
    if (confirm('هل أنت متأكد من حذف هذا الحدث؟')) {
      try {
        // await axios.delete(`${API_BASE_URL}/api/schedule/events/${selectedEvent.id}`);
        setEvents(prev => prev.filter(e => e.id !== selectedEvent.id));
        setIsFormOpen(false);
        setSelectedEvent(null);
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  return (
    <DashboardLayout 
      title="الجدول الزمني"
      subtitle="نظم وقتك الدراسي"
    >
      {/* Calendar */}
      <Calendar
        events={events}
        onDateClick={handleDateClick}
        onEventClick={handleEventClick}
        onAddEvent={handleAddEvent}
      />

      {/* Upcoming Events List */}
      <div className="mt-8 card-glass p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="text-[#4b58ff]" size={20} />
          الأحداث القادمة
        </h3>
        <div className="space-y-3">
          {events
            .filter(e => new Date(e.date) >= new Date())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5)
            .map(event => (
              <div
                key={event.id}
                onClick={() => handleEventClick(event)}
                className="p-4 bg-white/5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      event.type === 'lecture' ? 'bg-[#4b58ff]' :
                      event.type === 'td' ? 'bg-orange-500' :
                      event.type === 'tp' ? 'bg-green-500' :
                      event.type === 'exam' ? 'bg-red-500' :
                      'bg-purple-500'
                    }`} />
                    <div>
                      <h4 className="text-white font-medium">{event.title}</h4>
                      <p className="text-sm text-muted">
                        {new Date(event.date).toLocaleDateString('ar')} • {event.time}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted">
                    {event.duration}h
                  </span>
                </div>
              </div>
            ))}
          {events.filter(e => new Date(e.date) >= new Date()).length === 0 && (
            <div className="text-center py-8 text-muted">
              <CalendarIcon className="mx-auto mb-2" size={32} />
              <p>لا توجد أحداث قادمة</p>
            </div>
          )}
        </div>
      </div>

      {/* Event Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedDate(null);
          setSelectedEvent(null);
        }}
        title={selectedEvent ? 'تعديل الحدث' : 'إضافة حدث جديد'}
        onSubmit={handleSubmit}
        submitLabel={selectedEvent ? 'تحديث' : 'إضافة'}
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              العنوان *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted focus:outline-none focus:border-[#4b58ff]"
              placeholder="مثال: محاضرة الخوارزميات"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                التاريخ *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#4b58ff]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                الوقت *
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                required
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#4b58ff]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                النوع *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                required
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#4b58ff]"
              >
                <option value="lecture">محاضرة</option>
                <option value="td">TD</option>
                <option value="tp">TP</option>
                <option value="exam">امتحان</option>
                <option value="deadline">موعد نهائي</option>
                <option value="custom">مخصص</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                المدة (ساعات) *
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseFloat(e.target.value) || 0 }))}
                required
                min="0.5"
                step="0.5"
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#4b58ff]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              الوصف
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-muted focus:outline-none focus:border-[#4b58ff] resize-none"
              placeholder="وصف إضافي للحدث..."
            />
          </div>

          {selectedEvent && (
            <button
              type="button"
              onClick={handleDelete}
              className="w-full mt-4 px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
            >
              حذف الحدث
            </button>
          )}
        </form>
      </FormModal>
    </DashboardLayout>
  );
}
