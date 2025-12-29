"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function FeaturesPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard which has links to all features
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="animate-spin text-[#4b58ff] mx-auto mb-4" size={48} />
        <p className="text-muted">جاري التوجيه...</p>
      </div>
    </div>
  );
}

