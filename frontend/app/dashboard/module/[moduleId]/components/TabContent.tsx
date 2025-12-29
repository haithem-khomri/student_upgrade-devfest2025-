"use client";

import { FileText, ClipboardList, GraduationCap } from "lucide-react";
import CourseCard from "./CourseCard";
import TDCard from "./TDCard";
import ExamCard from "./ExamCard";
import type { ModuleData } from "../utils/api";

type TabType = "courses" | "tds" | "exams";

interface TabContentProps {
  activeTab: TabType;
  moduleData: ModuleData;
}

export default function TabContent({ activeTab, moduleData }: TabContentProps) {
  if (activeTab === "courses") {
    return (
      <>
        {moduleData.courses.length === 0 ? (
          <div className="card-glass p-8 text-center">
            <FileText className="mx-auto mb-4 text-muted" size={48} />
            <p className="text-muted">لا توجد دروس متاحة حالياً</p>
          </div>
        ) : (
          moduleData.courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))
        )}
      </>
    );
  }

  if (activeTab === "tds") {
    return (
      <>
        {moduleData.tds.length === 0 ? (
          <div className="card-glass p-8 text-center">
            <ClipboardList className="mx-auto mb-4 text-muted" size={48} />
            <p className="text-muted">لا توجد أعمال موجهة متاحة حالياً</p>
          </div>
        ) : (
          moduleData.tds.map((td) => <TDCard key={td.id} td={td} />)
        )}
      </>
    );
  }

  return (
    <>
      {moduleData.exams.length === 0 ? (
        <div className="card-glass p-8 text-center">
          <GraduationCap className="mx-auto mb-4 text-muted" size={48} />
          <p className="text-muted">لا توجد امتحانات متاحة حالياً</p>
        </div>
      ) : (
        moduleData.exams.map((exam) => <ExamCard key={exam.id} exam={exam} />)
      )}
    </>
  );
}

