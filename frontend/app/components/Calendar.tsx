'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  type: 'lecture' | 'td' | 'tp' | 'exam' | 'deadline' | 'custom';
  color?: string;
}

interface CalendarProps {
  events?: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onAddEvent?: (date: Date) => void;
}

export default function Calendar({ 
  events = [], 
  onDateClick, 
  onEventClick,
  onAddEvent 
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const dayNames = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];
  const fullDayNames = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 1) % 7; // Adjust for RTL (Saturday = 0)

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date | null): CalendarEvent[] => {
    if (!date) return [];
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const isToday = (date: Date | null): boolean => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date: Date | null): boolean => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'lecture': return 'bg-[#4b58ff]/20 border-[#4b58ff]/50 text-[#4b58ff]';
      case 'td': return 'bg-orange-500/20 border-orange-500/50 text-orange-400';
      case 'tp': return 'bg-green-500/20 border-green-500/50 text-green-400';
      case 'exam': return 'bg-red-500/20 border-red-500/50 text-red-400';
      case 'deadline': return 'bg-purple-500/20 border-purple-500/50 text-purple-400';
      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-400';
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="card-glass p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={previousMonth}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ChevronRight className="text-muted" size={20} />
          </button>
          <div className="text-center">
            <h3 className="text-xl font-bold text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
          </div>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="text-muted" size={20} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm transition-colors"
          >
            اليوم
          </button>
          {onAddEvent && (
            <button
              onClick={() => onAddEvent(new Date())}
              className="p-2 rounded-lg bg-[#4b58ff] hover:bg-[#4b58ff]/80 text-white transition-colors"
            >
              <Plus size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day, index) => (
          <div key={index} className="text-center text-sm font-semibold text-muted py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((date, index) => {
          const dayEvents = getEventsForDate(date);
          const isCurrentDay = isToday(date);
          const isPastDay = isPast(date);

          return (
            <div
              key={index}
              className={`min-h-[100px] p-2 rounded-lg border transition-all ${
                date
                  ? isCurrentDay
                    ? 'bg-[#4b58ff]/10 border-[#4b58ff] cursor-pointer hover:bg-[#4b58ff]/20'
                    : isPastDay
                    ? 'bg-white/2 border-white/5 opacity-50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer'
                  : 'border-transparent'
              }`}
              onClick={() => date && onDateClick && onDateClick(date)}
            >
              {date && (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm font-semibold ${
                        isCurrentDay ? 'text-[#4b58ff]' : isPastDay ? 'text-muted' : 'text-white'
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    {onAddEvent && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddEvent(date);
                        }}
                        className="opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                      >
                        <Plus size={12} className="text-muted hover:text-[#4b58ff]" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick && onEventClick(event);
                        }}
                        className={`text-xs px-1.5 py-0.5 rounded border truncate ${getEventColor(event.type)} cursor-pointer hover:opacity-80`}
                        title={event.title}
                      >
                        {event.time && `${event.time} - `}
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-muted text-center">
                        +{dayEvents.length - 2} أكثر
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-white/5">
        <h4 className="text-sm font-semibold text-white mb-3">المفتاح</h4>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#4b58ff]"></div>
            <span className="text-xs text-muted">محاضرة</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500"></div>
            <span className="text-xs text-muted">TD</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span className="text-xs text-muted">TP</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span className="text-xs text-muted">امتحان</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-500"></div>
            <span className="text-xs text-muted">موعد نهائي</span>
          </div>
        </div>
      </div>
    </div>
  );
}

