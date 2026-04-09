"use client";

import { useState, useCallback, memo, useEffect } from "react";
import Link from "next/link";
import { PlusCircle, Users, LayoutList, Clock, Trash2, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEmployerStore } from "@/store/useEmployerStore";
import { examsApi, resultsApi } from "@/lib/api/client";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface ExamData {
  id: string;
  title: string;
  totalCandidates: number;
  totalSlots: number;
  questionSets: number;
  questionType: string;
  startTime: string;
  endTime: string;
  duration: number;
  negativeMarking: boolean;
  questions: Array<{ id: string; title: string; type: string; options: string[] }>;
}

const ExamCard = memo(function ExamCard({
  exam,
  onViewCandidates,
  onDelete,
}: {
  exam: ExamData;
  onViewCandidates: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const isUpcoming = new Date(exam.startTime) > new Date();

  return (
    <Card className="group hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 border-slate-200 dark:border-slate-800 flex flex-col">
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold leading-snug line-clamp-2">{exam.title}</CardTitle>
          <span
            className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              isUpcoming
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-800"
                : "bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700"
            }`}
          >
            {isUpcoming ? "Upcoming" : "Past"}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:ring-indigo-800">
            {exam.questionType}
          </span>
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800">
            {exam.questions.length} Questions
          </span>
          {exam.negativeMarking && (
            <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-800">
              Negative Marking
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Users, label: "Candidates", value: exam.totalCandidates },
            { icon: Clock, label: "Duration", value: `${exam.duration} min` },
            { icon: LayoutList, label: "Question Sets", value: exam.questionSets },
            { icon: LayoutList, label: "Slots", value: exam.totalSlots },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 px-3 py-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
                <Icon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-slate-500 leading-none">{label}</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 px-3 py-2.5 text-xs text-slate-500">
          <div className="flex items-center justify-between">
            <span>Start</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">{formatDateTime(exam.startTime)}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span>End</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">{formatDateTime(exam.endTime)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        <Button
          variant="outline"
          className="flex-1 font-medium gap-1.5 h-9 text-sm hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300"
          onClick={() => onViewCandidates(exam.id)}
        >
          <Eye className="h-3.5 w-3.5" /> View Candidates
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 text-red-500 hover:bg-red-50 hover:text-red-700 hover:border-red-200 dark:hover:bg-red-900/30 dark:hover:text-red-400"
          onClick={() => onDelete(exam.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
});

export default function EmployerDashboard() {
  const { exams, setExams, removeExam } = useEmployerStore();
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    examsApi.getAll()
      .then((res) => { if (res.success) setExams(res.exams); })
      .catch(console.error)
      .finally(() => setLoadingExams(false));
  }, [setExams]);

  const handleViewCandidates = useCallback(async (id: string) => {
    setSelectedExamId(id);
    setLoadingResults(true);
    try {
      const res = await resultsApi.getAll(id);
      if (res.success) setExamResults(res.results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingResults(false);
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;
    try {
      const res = await examsApi.delete(id);
      if (res.success) removeExam(id);
    } catch (err) {
      console.error(err);
    }
  }, [removeExam]);

  const selectedExam = exams.find((e) => e.id === selectedExamId);

  if (loadingExams) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Online Tests</h1>
          <p className="text-slate-500 mt-1">Manage and monitor all your created assessments.</p>
        </div>
        <Link href="/employer/dashboard/create-test">
          <Button className="gap-2 shadow-md"><PlusCircle className="h-4 w-4" /> Create New Test</Button>
        </Link>
      </div>

      {exams.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <LayoutList className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">No tests created yet</h3>
          <p className="text-slate-500 mt-2 mb-6">Start evaluating candidates by creating your first assessment.</p>
          <Link href="/employer/dashboard/create-test">
            <Button variant="outline" className="gap-2"><PlusCircle className="h-4 w-4" /> Create Test</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} onViewCandidates={handleViewCandidates} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Dialog open={!!selectedExamId} onOpenChange={(open) => { if (!open) setSelectedExamId(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Candidates — {selectedExam?.title}</DialogTitle>
          </DialogHeader>
          {loadingResults ? (
            <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
          ) : examResults.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">No candidates have submitted this exam yet.</div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tab Switches</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examResults.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.candidate?.name}</TableCell>
                      <TableCell>{r.candidate?.email}</TableCell>
                      <TableCell>{r.tabSwitches}</TableCell>
                      <TableCell className="text-xs">{new Date(r.submittedAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
