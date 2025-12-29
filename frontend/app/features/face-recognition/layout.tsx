'use client';

import DashboardLayout from '@/app/components/DashboardLayout';

export default function FaceRecognitionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout
      title="التعرف على الوجه والتحقق"
      subtitle="كشف الوجه، التحقق، وتحليل المشاعر"
    >
      {children}
    </DashboardLayout>
  );
}

