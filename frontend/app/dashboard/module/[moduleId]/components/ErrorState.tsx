"use client";

import Link from "next/link";
import DashboardLayout from "@/app/components/DashboardLayout";

interface ErrorStateProps {
  error: string | null;
}

export default function ErrorState({ error }: ErrorStateProps) {
  return (
    <DashboardLayout title="خطأ">
      <div className="text-center py-20">
        <p className="text-red-400 text-xl mb-4">
          {error || "المادة غير موجودة"}
        </p>
        <Link href="/dashboard" className="btn btn-primary">
          العودة للوحة التحكم
        </Link>
      </div>
    </DashboardLayout>
  );
}

