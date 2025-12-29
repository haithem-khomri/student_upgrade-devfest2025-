'use client';

import DashboardLayout from '@/app/components/DashboardLayout';

export default function StudyDecisionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout
      title="قرارات الدراسة"
      subtitle="احصل على توصيات ذكية للدراسة بناءً على مزاجك وطاقتك"
    >
      {children}
    </DashboardLayout>
  );
}

