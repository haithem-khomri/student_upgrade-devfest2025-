"use client";

import { FileText, ClipboardList, GraduationCap } from "lucide-react";
import type { ModuleData } from "../utils/api";

type TabType = "courses" | "tds" | "exams";

interface ModuleTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  moduleData: ModuleData;
}

export default function ModuleTabs({
  activeTab,
  onTabChange,
  moduleData,
}: ModuleTabsProps) {
  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      <button
        onClick={() => onTabChange("courses")}
        className={`px-5 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
          activeTab === "courses"
            ? "bg-[#4b58ff] text-white"
            : "bg-white/5 text-muted hover:bg-white/10"
        }`}
      >
        <FileText size={18} />
        الدروس ({moduleData.courses.length})
      </button>
      <button
        onClick={() => onTabChange("tds")}
        className={`px-5 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
          activeTab === "tds"
            ? "bg-[#4b58ff] text-white"
            : "bg-white/5 text-muted hover:bg-white/10"
        }`}
      >
        <ClipboardList size={18} />
        الأعمال الموجهة ({moduleData.tds.length})
      </button>
      <button
        onClick={() => onTabChange("exams")}
        className={`px-5 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
          activeTab === "exams"
            ? "bg-[#4b58ff] text-white"
            : "bg-white/5 text-muted hover:bg-white/10"
        }`}
      >
        <GraduationCap size={18} />
        الامتحانات ({moduleData.exams.length})
      </button>
    </div>
  );
}

