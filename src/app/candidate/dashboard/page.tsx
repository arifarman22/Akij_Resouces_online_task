"use client";

import { useState, memo, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import { Clock, HelpCircle, AlertTriangle, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCandidateStore } from "@/store/useCandidateStore";
import { examsApi, resultsApi } from "@/lib/api/client";

const PER_PAGE_OPTIONS = [4, 8, 12, 20];

interface ExamData {
  id: string;
  title: string;
  duration: number;
  negativeMarking: boolean;
  questions: Array<{ id: string }>;
}

const ExamCard = memo(function ExamCard({ exam, isCompleted }: { exam: ExamData; isCompleted: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 transition-all duration-200 hover:shadow-lg hover:border-[#6633FF]/30 ${isCompleted ? "opacity-60" : ""}`}
      style={{ maxWidth: 632, minHeight: 181, padding: 24, gap: 24 }}
    >
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: "#6633FF" }} />

      <div className="flex flex-col justify-between h-full" style={{ gap: 20 }}>
        {/* Title */}
        <h3 className="text-lg text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
          {exam.title}
        </h3>

        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300">
            <Clock size={14} className="text-[#6633FF]" />
            <span style={{ fontWeight: 600 }}>{exam.duration} Min</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300">
            <HelpCircle size={14} className="text-[#6633FF]" />
            <span style={{ fontWeight: 600 }}>{exam.questions.length} Questions</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/20 text-sm text-red-600 dark:text-red-400">
            <AlertTriangle size={14} />
            <span style={{ fontWeight: 600 }}>-0.25/wrong</span>
          </span>
        </div>

        {/* Button row */}
        <div className="flex justify-end">
          {isCompleted ? (
            <Button
              variant="outline"
              disabled
              style={{ width: 140, height: 40, borderRadius: 12, fontWeight: 600, border: "1px solid #4A1FB8", color: "#4A1FB8", background: "transparent" }}
            >
              Submitted
            </Button>
          ) : (
            <Link href={`/candidate/exam/${exam.id}`}>
              <Button
                className="hover:bg-[#4A1FB8] hover:text-white transition-all duration-200"
                style={{
                  width: 140,
                  height: 40,
                  borderRadius: 12,
                  paddingTop: 10,
                  paddingRight: 24,
                  paddingBottom: 10,
                  paddingLeft: 24,
                  gap: 6,
                  background: "transparent",
                  border: "1px solid #4A1FB8",
                  color: "#4A1FB8",
                  fontWeight: 600,
                }}
              >
                Start
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
});

export default function CandidateDashboard() {
  const { currentUser, results, setResults } = useCandidateStore();
  const [exams, setExams] = useState<ExamData[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(4);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([examsApi.getAll(), resultsApi.getAll()])
      .then(([examsRes, resultsRes]) => {
        if (examsRes.success) setExams(examsRes.exams);
        if (resultsRes.success) setResults(resultsRes.results);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [setResults]);

  const isCompleted = useCallback((examId: string) => {
    return !!results.find((r) => r.examId === examId);
  }, [results]);

  const filteredExams = exams.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredExams.length / perPage));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedExams = useMemo(() => {
    const start = (safePage - 1) * perPage;
    return filteredExams.slice(start, start + perPage);
  }, [filteredExams, safePage, perPage]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handlePerPageChange = (val: string | null) => {
    if (!val) return;
    setPerPage(Number(val));
    setCurrentPage(1);
  };

  if (!currentUser) return (
    <div className="text-center py-20">Please log in. <Link href="/candidate/login" className="text-[#6633FF] underline" style={{ fontWeight: 600 }}>Login</Link></div>
  );

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
    </div>
  );

  return (
    <div className="w-full mx-auto" style={{ maxWidth: 1280, minHeight: 490 }}>
      {/* Header row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
          Online Test
        </h1>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search assessments..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 h-10 rounded-lg border bg-white dark:bg-slate-900 placeholder:text-slate-300 placeholder:font-normal"
            style={{ fontWeight: 600 }}
          />
        </div>
      </div>

      {/* Assessment grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {paginatedExams.map((exam) => (
          <ExamCard key={exam.id} exam={exam} isCompleted={isCompleted(exam.id)} />
        ))}
        {filteredExams.length === 0 && (
          <div className="col-span-full py-10 text-center text-slate-500" style={{ fontWeight: 600 }}>
            No assessments found.
          </div>
        )}
      </div>

      {/* Pagination & Per Page */}
      {filteredExams.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          {/* Per Page Selector */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span style={{ fontWeight: 600 }}>Show</span>
            <Select value={String(perPage)} onValueChange={handlePerPageChange}>
              <SelectTrigger className="h-8 w-[70px] text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PER_PAGE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span style={{ fontWeight: 600 }}>per page</span>
            <span className="ml-2 text-slate-400">•</span>
            <span className="ml-2" style={{ fontWeight: 600 }}>
              {(safePage - 1) * perPage + 1}–{Math.min(safePage * perPage, filteredExams.length)} of {filteredExams.length}
            </span>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage(safePage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === safePage ? "default" : "outline"}
                size="icon"
                className={`h-8 w-8 text-xs font-semibold ${
                  page === safePage
                    ? "bg-[#6633FF] text-white hover:bg-[#4A1FB8]"
                    : ""
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(safePage + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
