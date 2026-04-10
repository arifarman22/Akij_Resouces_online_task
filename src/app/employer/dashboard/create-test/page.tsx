"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEmployerStore } from "@/store/useEmployerStore";
import { examsApi } from "@/lib/api/client";
import { PlusCircle, Trash2, ArrowRight, ArrowLeft, Send, Pencil, FileText, Settings, CheckCircle2, GripVertical } from "lucide-react";
import { Label } from "@/components/ui/label";

interface Question {
  id: string;
  title: string;
  type: "checkbox" | "radio" | "text";
  options?: string[];
}

const step1Schema = z.object({
  title: z.string().min(3, "Title is required"),
  totalCandidates: z.string().min(1, "Must be at least 1"),
  totalSlots: z.string().min(1, "Must be at least 1"),
  questionSets: z.string().min(1, "Must be at least 1"),
  questionType: z.string().min(1, "Question Type is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  duration: z.string().min(1, "Duration is required"),
  negativeMarking: z.boolean(),
});

const STEPS = [
  { label: "Basic Info", icon: Settings },
  { label: "Questions", icon: FileText },
];

export default function CreateTestPage() {
  const router = useRouter();
  const { addExam } = useEmployerStore();
  const [step, setStep] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [qTitle, setQTitle] = useState("");
  const [qType, setQType] = useState<"checkbox" | "radio" | "text">("text");
  const [qOptions, setQOptions] = useState<string[]>(["", ""]);

  const [submitting, setSubmitting] = useState(false);

  const step1Form = useForm<z.infer<typeof step1Schema>>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      title: "", totalCandidates: "10", totalSlots: "1", questionSets: "1",
      questionType: "Multiple Choice", startTime: "", endTime: "", duration: "30", negativeMarking: false,
    },
  });

  const resetModal = useCallback(() => {
    setQTitle("");
    setQType("text");
    setQOptions(["", ""]);
    setEditingQuestion(null);
    setIsModalOpen(false);
  }, []);

  const openAddModal = useCallback(() => {
    resetModal();
    setIsModalOpen(true);
  }, [resetModal]);

  const openEditModal = useCallback((q: Question) => {
    setEditingQuestion(q);
    setQTitle(q.title);
    setQType(q.type);
    setQOptions(q.options?.length ? [...q.options] : ["", ""]);
    setIsModalOpen(true);
  }, []);

  const handleSaveQuestion = useCallback(() => {
    if (!qTitle.trim()) return alert("Question title is required");
    const opts = qType !== "text" ? qOptions.filter((o) => o.trim()) : undefined;

    if (editingQuestion) {
      setQuestions((prev) => prev.map((q) => q.id === editingQuestion.id ? { ...q, title: qTitle, type: qType, options: opts } : q));
    } else {
      setQuestions((prev) => [...prev, { id: "q" + Date.now(), title: qTitle, type: qType, options: opts }]);
    }
    resetModal();
  }, [qTitle, qType, qOptions, editingQuestion, resetModal]);

  const handleDeleteQuestion = useCallback((id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const onStep1Submit = () => setStep(2);

  const handleFinalSubmit = async () => {
    if (questions.length === 0) return alert("Please add at least 1 question.");
    setSubmitting(true);
    try {
      const d = step1Form.getValues();
      const res = await examsApi.create({
        ...d,
        totalCandidates: Number(d.totalCandidates),
        totalSlots: Number(d.totalSlots),
        questionSets: Number(d.questionSets),
        duration: Number(d.duration),
        startTime: new Date(d.startTime).toISOString(),
        endTime: new Date(d.endTime).toISOString(),
        questions: questions.map((q) => ({ title: q.title, type: q.type, options: q.options || [] })),
      });
      if (res.success) {
        addExam(res.exam);
        router.push("/employer/dashboard");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create assessment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create New Assessment</h1>
        <p className="text-slate-500 mt-1 text-sm">Set up your online test in two simple steps.</p>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => {
            const stepNum = i + 1;
            const isActive = step === stepNum;
            const isCompleted = step > stepNum;
            const Icon = isCompleted ? CheckCircle2 : s.icon;

            return (
              <div key={s.label} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${
                      isCompleted
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                        : isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/40"
                        : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="hidden sm:block">
                    <p className={`text-xs font-medium ${isActive ? "text-indigo-600 dark:text-indigo-400" : isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                      Step {stepNum}
                    </p>
                    <p className={`text-sm font-semibold ${isActive || isCompleted ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500"}`}>
                      {s.label}
                    </p>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 mx-4">
                    <div className="h-px w-full bg-slate-200 dark:bg-slate-700 relative">
                      <div
                        className={`absolute inset-y-0 left-0 bg-emerald-500 transition-all duration-500 ${isCompleted ? "w-full" : "w-0"}`}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-lg">Assessment Details</CardTitle>
            <CardDescription>Configure the basic settings for your test.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...step1Form}>
              <form id="step1form" onSubmit={step1Form.handleSubmit(onStep1Submit as any)} className="space-y-6">
                {/* Title - Full Width */}
                <FormField control={step1Form.control as any} name="title" render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Exam Title</FormLabel>
                    <FormControl><Input placeholder="e.g. Senior Frontend Developer Assessment" className="h-10" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Capacity Section */}
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Capacity & Structure</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField control={step1Form.control as any} name="totalCandidates" render={({ field }: any) => (
                      <FormItem>
                        <FormLabel className="text-xs text-slate-500">Total Candidates</FormLabel>
                        <FormControl><Input type="number" className="h-10" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={step1Form.control as any} name="totalSlots" render={({ field }: any) => (
                      <FormItem>
                        <FormLabel className="text-xs text-slate-500">Total Slots</FormLabel>
                        <FormControl><Input type="number" className="h-10" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={step1Form.control as any} name="questionSets" render={({ field }: any) => (
                      <FormItem>
                        <FormLabel className="text-xs text-slate-500">Question Sets</FormLabel>
                        <FormControl><Input type="number" className="h-10" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* Type & Duration */}
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Type & Duration</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={step1Form.control as any} name="questionType" render={({ field }: any) => (
                      <FormItem>
                        <FormLabel className="text-xs text-slate-500">Question Type</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                            <SelectItem value="Mixed">Mixed</SelectItem>
                            <SelectItem value="Text">Text Based</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={step1Form.control as any} name="duration" render={({ field }: any) => (
                      <FormItem>
                        <FormLabel className="text-xs text-slate-500">Duration (minutes)</FormLabel>
                        <FormControl><Input type="number" className="h-10" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Schedule</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={step1Form.control as any} name="startTime" render={({ field }: any) => (
                      <FormItem>
                        <FormLabel className="text-xs text-slate-500">Start Time</FormLabel>
                        <FormControl><Input type="datetime-local" className="h-10" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={step1Form.control as any} name="endTime" render={({ field }: any) => (
                      <FormItem>
                        <FormLabel className="text-xs text-slate-500">End Time</FormLabel>
                        <FormControl><Input type="datetime-local" className="h-10" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* Negative Marking */}
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-3">
                  <FormField control={step1Form.control as any} name="negativeMarking" render={({ field }: any) => (
                    <FormItem className="flex items-center gap-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div>
                        <FormLabel className="cursor-pointer text-sm font-medium">Enable Negative Marking</FormLabel>
                        <p className="text-xs text-slate-500 mt-0.5">Deduct marks for incorrect answers.</p>
                      </div>
                    </FormItem>
                  )} />
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-slate-100 dark:border-slate-800 px-6 py-4">
            <Button variant="ghost" onClick={() => router.push("/employer/dashboard")} className="text-slate-500">
              Cancel
            </Button>
            <Button form="step1form" type="submit" className="gap-2">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 2: Questions */}
      {step === 2 && (
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Question Bank</CardTitle>
                <CardDescription>
                  {questions.length === 0
                    ? "Add questions to your assessment."
                    : `${questions.length} question${questions.length > 1 ? "s" : ""} added`}
                </CardDescription>
              </div>
              <Button size="sm" onClick={openAddModal} className="gap-1.5 shadow-sm">
                <PlusCircle className="h-3.5 w-3.5" /> Add Question
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No questions yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-[240px]">Click &quot;Add Question&quot; to start building your assessment.</p>
                <Button variant="outline" size="sm" onClick={openAddModal} className="mt-4 gap-1.5">
                  <PlusCircle className="h-3.5 w-3.5" /> Add Your First Question
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {questions.map((q, i) => (
                  <div
                    key={q.id}
                    className="group flex items-start gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2 pt-0.5">
                      <GripVertical className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {i + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">{q.title}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          q.type === "radio"
                            ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-800"
                            : q.type === "checkbox"
                            ? "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:ring-purple-800"
                            : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-800"
                        }`}>
                          {q.type}
                        </span>
                        {q.options && q.options.length > 0 && (
                          <span className="text-[11px] text-slate-400">{q.options.length} options</span>
                        )}
                      </div>
                      {q.options && q.options.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {q.options.map((opt, oi) => (
                            <span key={oi} className="inline-flex items-center rounded-md bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-400 ring-1 ring-inset ring-slate-200 dark:ring-slate-700">
                              {opt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                        onClick={() => openEditModal(q)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                        onClick={() => handleDeleteQuestion(q.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t border-slate-100 dark:border-slate-800 px-6 py-4">
            <Button variant="ghost" onClick={() => setStep(1)} className="gap-2 text-slate-500">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={handleFinalSubmit} disabled={submitting} className="gap-2 shadow-md">
              <Send className="h-4 w-4" /> Submit Assessment
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Add/Edit Question Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) resetModal(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">{editingQuestion ? "Edit Question" : "Add New Question"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <div className="space-y-1.5">
              <Label className="text-sm">Question Title</Label>
              <Input value={qTitle} onChange={(e) => setQTitle(e.target.value)} placeholder="Enter your question..." className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Answer Type</Label>
              <Select value={qType} onValueChange={(val: any) => setQType(val)}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text (Essay / Short Answer)</SelectItem>
                  <SelectItem value="radio">Radio (Single Choice)</SelectItem>
                  <SelectItem value="checkbox">Checkbox (Multiple Choice)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {qType !== "text" && (
              <div className="space-y-2">
                <Label className="text-sm">Options</Label>
                <div className="space-y-2">
                  {qOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-500">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <Input
                        value={opt}
                        onChange={(e) => { const n = [...qOptions]; n[idx] = e.target.value; setQOptions(n); }}
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        className="h-9"
                      />
                      {qOptions.length > 2 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-slate-400 hover:text-red-500"
                          onClick={() => setQOptions(qOptions.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-1 text-xs" onClick={() => setQOptions([...qOptions, ""])}>
                  + Add Option
                </Button>
              </div>
            )}
            <Button className="w-full h-10" onClick={handleSaveQuestion}>
              {editingQuestion ? "Update Question" : "Save Question"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
