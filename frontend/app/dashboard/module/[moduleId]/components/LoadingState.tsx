"use client";

import { Loader2 } from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

export default function LoadingState() {
  return (
    <DashboardLayout title="جاري التحميل...">
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#4b58ff]" size={50} />
      </div>
    </DashboardLayout>
  );
}

