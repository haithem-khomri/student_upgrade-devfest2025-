"use client";

import { useMemo } from "react";
import type { ModuleData } from "../utils/api";
import { getDifficultyLabel } from "../utils/constants";

interface ModuleHeaderProps {
  moduleData: ModuleData;
  userDifficulty: number | null;
  onDifficultyClick: () => void;
}

export default function ModuleHeader({
  moduleData,
  userDifficulty,
  onDifficultyClick,
}: ModuleHeaderProps) {
  const displayDifficulty = useMemo(
    () => userDifficulty ?? moduleData.module.difficulty ?? 5,
    [userDifficulty, moduleData.module.difficulty]
  );

  return (
    <div className="card-glass p-6 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-14 h-14 rounded-xl bg-[#4b58ff] flex items-center justify-center text-white font-bold text-xl">
              {moduleData.module.code.slice(0, 2)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {moduleData.module.name}
              </h2>
              <p className="text-muted">{moduleData.module.name_fr}</p>
            </div>
          </div>
          <p className="text-muted mt-3">{moduleData.module.description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="px-4 py-2 rounded-lg bg-white/5 text-center">
            <p className="text-2xl font-bold text-white">
              {moduleData.courses_total_hours}
            </p>
            <p className="text-xs text-muted">ساعات</p>
          </div>
          <div className="px-4 py-2 rounded-lg bg-white/5 text-center">
            <p className="text-2xl font-bold text-white">
              {moduleData.total_exercises}
            </p>
            <p className="text-xs text-muted">تمرين</p>
          </div>
          <div
            className="px-4 py-2 rounded-lg bg-white/5 text-center relative group cursor-pointer"
            onClick={onDifficultyClick}
          >
            <p className="text-2xl font-bold text-white">
              {displayDifficulty}/10
            </p>
            <p className="text-xs text-muted">
              صعوبة {userDifficulty ? "(تقييمك)" : ""}
            </p>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[#4b58ff]/10 rounded-lg flex items-center justify-center">
              <span className="text-[#4b58ff] text-xs font-semibold">
                تعديل
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

