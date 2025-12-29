'use client';

import type { Metadata } from 'next';
import DashboardLayout from '@/app/components/DashboardLayout';

export default function ChatbotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout
      title="المساعد الذكي"
      subtitle="احصل على إجابات فورية لأسئلتك الجامعية"
    >
      {children}
    </DashboardLayout>
  );
}

