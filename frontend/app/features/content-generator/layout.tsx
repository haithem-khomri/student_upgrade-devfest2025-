'use client';

import DashboardLayout from '@/app/components/DashboardLayout';

export default function ContentGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout
      title="مولد المحتوى"
      subtitle="أنشئ ملخصات، بطاقات تعليمية، واختبارات باستخدام الذكاء الاصطناعي"
    >
      {children}
    </DashboardLayout>
  );
}

