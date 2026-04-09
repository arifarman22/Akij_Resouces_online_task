"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useEmployerStore } from "@/store/useEmployerStore";
import { useCandidateStore } from "@/store/useCandidateStore";
import { useTimer, useProctoring } from "@/hooks";
import { examsApi, resultsApi } from "@/lib/api/client";
import { AlertCircle, Clock, Maximize, AlertTriangle, ShieldCheck, SkipForward, Save, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import Header from "@/components/layout/Header";

export default function ExamScreen() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  const { exams } = useEmployerStore();
  const { currentUser, addResult } = useCandidateStore();

  interface ExamQuestion {
    id: string;
    title: string;
    type: "radio" | "checkbox" | "text";
    options?: string[];
  }
  interface ExamData {
    id: string;
    title: string;
    duration: number;
    questions: ExamQuestion[];
  }

  const [exam, setExam] = useState<ExamData | null>(null);
  const [loadingExam, setLoadingExam] = useState(true);

  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [hasStarted, setHasStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCompleted, setShowCompleted] = useState(false);
  const [wasTimedOut, setWasTimedOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const doSubmit = useCallback(async (timedOut: boolean) => {
    if (document.fullscreenElement) document.exitFullscreen();
    try {
      const res = await resultsApi.submit({
        examId,
        answers,
        tabSwitches: proctoring.tabSwitches,
        fullscreenExits: proctoring.fullscreenExits,
      });
      if (res.success) addResult(res.result);
    } catch (err) {
      console.error("Submit error:", err);
    }
    setWasTimedOut(timedOut);
    setShowCompleted(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, examId]);

  const handleSubmit = useCallback(() => doSubmit(false), [doSubmit]);
  const handleTimeout = useCallback(() => doSubmit(true), [doSubmit]);

  const timer = useTimer(exam ? exam.duration * 60 : 0, handleTimeout);
  const proctoring = useProctoring(hasStarted);

  useEffect(() => {
    if (!currentUser) { router.push("/candidate/login"); return; }
    // Try local store first, then fetch from API
    const localExam = exams.find((e: any) => e.id === examId);
    if (localExam) {
      setExam(localExam);
      setLoadingExam(false);
    } else {
      examsApi.getById(examId)
        .then((res) => { if (res.success) setExam(res.exam); else router.push("/candidate/dashboard"); })
        .catch(() => router.push("/candidate/dashboard"))
        .finally(() => setLoadingExam(false));
    }
  }, [currentUser, examId, exams, router]);

  const enterFullscreen = async () => {
    if (containerRef.current) {
      const ok = await proctoring.enterFullscreen(containerRef.current);
      if (ok) {
        setHasStarted(true);
        timer.start();
      }
    }
  };

  const updateAnswer = useCallback((qId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  }, []);

  const totalQuestions = exam?.questions.length ?? 0;
  const currentQuestion = exam?.questions[currentIndex];
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const handleSaveAndContinue = () => {
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions - 1));
    }
  };

  const handleSkip = () => {
    if (isLastQuestion) return;
    setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions - 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const profile = currentUser
    ? {
        name: currentUser.name,
        refId: currentUser.email.split("@")[0].toUpperCase() + "-" + currentUser.id?.slice(-6).toUpperCase(),
      }
    : undefined;

  if (loadingExam) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
    </div>
  );

  if (!exam || !currentUser) return null;

  // Completion dialog
  if (showCompleted) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-8 text-center animate-fadeScaleIn">
          {wasTimedOut ? (
            <>
              {/* Animated clock/timeout icon */}
              <div className="mx-auto mb-6 relative">
                <div className="h-24 w-24 mx-auto rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center animate-scaleIn">
                  <svg
                    className="h-14 w-14 text-amber-500"
                    viewBox="0 0 52 52"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="26"
                      cy="26"
                      r="24"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      className="animate-circleIn"
                      style={{ strokeDasharray: 151, strokeDashoffset: 151 }}
                    />
                    {/* Clock body */}
                    <circle
                      cx="26"
                      cy="26"
                      r="11"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      fill="none"
                      className="animate-checkIn"
                      style={{ strokeDasharray: 69, strokeDashoffset: 69 }}
                    />
                    {/* Clock hands */}
                    <path
                      d="M26 20V26L30 30"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      className="animate-checkIn"
                      style={{ strokeDasharray: 16, strokeDashoffset: 16 }}
                    />
                  </svg>
                </div>
                {/* Pulse rings */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-24 w-24 rounded-full border-2 border-amber-300/40 animate-pingOnce-1" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-24 w-24 rounded-full border-2 border-amber-300/20 animate-pingOnce-2" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 animate-fadeUp-1">
                Time&apos;s Up!
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed animate-fadeUp-2">
                Dear <span className="font-semibold text-slate-800 dark:text-slate-200">{currentUser.name}</span>,
                <br />
                Your exam time has expired and your answers have been automatically submitted.
                <br />
                Thank you for participating.
              </p>
            </>
          ) : (
            <>
              {/* Animated checkmark */}
              <div className="mx-auto mb-6 relative">
                <div className="h-24 w-24 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center animate-scaleIn">
                  <svg
                    className="h-14 w-14 text-emerald-500"
                    viewBox="0 0 52 52"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="26"
                      cy="26"
                      r="24"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      className="animate-circleIn"
                      style={{ strokeDasharray: 151, strokeDashoffset: 151 }}
                    />
                    <path
                      d="M15 27L22 34L37 19"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      className="animate-checkIn"
                      style={{ strokeDasharray: 40, strokeDashoffset: 40 }}
                    />
                  </svg>
                </div>
                {/* Pulse rings */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-24 w-24 rounded-full border-2 border-emerald-300/40 animate-pingOnce-1" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-24 w-24 rounded-full border-2 border-emerald-300/20 animate-pingOnce-2" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 animate-fadeUp-1">
                Test Completed!
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed animate-fadeUp-2">
                Congratulations <span className="font-semibold text-slate-800 dark:text-slate-200">{currentUser.name}</span>,
                <br />
                You have completed your exam.
                <br />
                Thank you for participating.
              </p>
            </>
          )}

          <Button
            onClick={() => router.push("/candidate/dashboard")}
            className="mt-8 h-11 px-8 text-sm font-semibold text-white shadow-lg animate-fadeUp-3"
            style={{ background: wasTimedOut ? "#D97706" : "#6633FF" }}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Pre-start screen
  if (!hasStarted) {
    return (
      <div className="flex justify-center mt-20" ref={containerRef}>
        <Card className="max-w-lg shadow-xl border-purple-100">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{exam.title}</CardTitle>
            <CardDescription>Duration: {exam.duration} minutes • Questions: {exam.questions.length}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div className="bg-orange-50 text-orange-800 p-4 rounded-lg flex gap-3">
              <AlertCircle className="shrink-0 mt-0.5 h-5 w-5" />
              <div>
                <p className="font-bold mb-1">Strict Monitoring Rules:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>This assessment must be taken in Fullscreen mode.</li>
                  <li>Exiting fullscreen will be recorded as a violation.</li>
                  <li>Switching tabs or minimizing the browser will be recorded.</li>
                  <li>The exam will auto-submit when the timer reaches 0.</li>
                </ul>
              </div>
            </div>
            <Button onClick={enterFullscreen} className="w-full h-12 text-lg bg-purple-600 hover:bg-purple-700 gap-2">
              <Maximize size={20} /> Enter Fullscreen & Start
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 overflow-y-auto z-50 flex flex-col" ref={containerRef}>
      {/* Navbar with profile */}
      <Header heading="Online Assessment" profile={profile} />

      {/* Sub-header: Timer + Proctoring + Submit */}
      <div className="sticky top-20 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate max-w-xs sm:max-w-md">
              {exam.title}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Proctoring Active
            </div>
          </div>
          <div className="flex items-center gap-3">
            {proctoring.warning && (
              <div className="animate-pulse bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> {proctoring.warning}
              </div>
            )}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-sm font-bold ${
              timer.timeLeft < 60
                ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            }`}>
              <Clock className={`w-4 h-4 ${timer.timeLeft < 60 ? "animate-pulse" : ""}`} />
              {timer.formatted}
            </div>
            <Button onClick={handleSubmit} size="sm" variant="destructive" className="shadow-sm text-xs h-8">
              Submit Exam
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full" style={{ maxWidth: 849 }}>
          {/* Progress indicator */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Question {currentIndex + 1}
              </span>
              <span className="text-sm text-slate-400">of {totalQuestions}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {exam.questions.map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    i === currentIndex
                      ? "w-6 bg-[#6633FF]"
                      : answers[exam.questions[i].id]
                      ? "w-2 bg-emerald-400"
                      : "w-2 bg-slate-300 dark:bg-slate-600"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Question Card */}
          {currentQuestion && (
            <div
              className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              style={{
                width: "100%",
                maxWidth: 849,
                minHeight: 432,
                borderRadius: 16,
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: "var(--color-slate-200)",
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                opacity: 1,
              }}
            >
              {/* Question header */}
              <div className="flex items-start gap-3 mb-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6633FF] text-white text-sm font-bold">
                  {currentIndex + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      currentQuestion.type === "radio"
                        ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-800"
                        : currentQuestion.type === "checkbox"
                        ? "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:ring-purple-800"
                        : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-800"
                    }`}>
                      {currentQuestion.type === "radio" ? "Single Choice" : currentQuestion.type === "checkbox" ? "Multiple Choice" : "Text"}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold leading-snug text-slate-900 dark:text-white">
                    {currentQuestion.title}
                  </h3>
                </div>
              </div>

              {/* Answer area */}
              <div className="flex-1 mt-4">
                {currentQuestion.type === "radio" && currentQuestion.options && (
                  <RadioGroup
                    onValueChange={(val) => updateAnswer(currentQuestion.id, val)}
                    value={(answers[currentQuestion.id] as string) || ""}
                    className="space-y-3"
                  >
                    {currentQuestion.options.map((opt, i) => (
                      <div
                        key={i}
                        style={{
                          width: "100%",
                          maxWidth: 801,
                          height: 52,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderStyle: "solid",
                          borderColor:
                            (answers[currentQuestion.id] as string) === opt
                              ? "#6633FF"
                              : "var(--color-slate-200)",
                          paddingTop: 14,
                          paddingRight: 16,
                          paddingBottom: 14,
                          paddingLeft: 16,
                          gap: 12,
                          opacity: 1,
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          background:
                            (answers[currentQuestion.id] as string) === opt
                              ? "rgba(102, 51, 255, 0.04)"
                              : "transparent",
                        }}
                        onClick={() => updateAnswer(currentQuestion.id, opt)}
                      >
                        <RadioGroupItem value={opt} id={`${currentQuestion.id}-${i}`} />
                        <Label
                          htmlFor={`${currentQuestion.id}-${i}`}
                          className="flex-1 cursor-pointer font-normal text-sm text-slate-700 dark:text-slate-300"
                        >
                          {opt}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {currentQuestion.type === "checkbox" && currentQuestion.options && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((opt, i) => {
                      const checked = ((answers[currentQuestion.id] as string[]) || []).includes(opt);
                      return (
                        <div
                          key={i}
                          style={{
                            width: "100%",
                            maxWidth: 801,
                            height: 52,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderStyle: "solid",
                            borderColor: checked ? "#6633FF" : "var(--color-slate-200)",
                            paddingTop: 14,
                            paddingRight: 16,
                            paddingBottom: 14,
                            paddingLeft: 16,
                            gap: 12,
                            opacity: 1,
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            background: checked ? "rgba(102, 51, 255, 0.04)" : "transparent",
                          }}
                          onClick={() => {
                            const cur = (answers[currentQuestion.id] as string[]) || [];
                            updateAnswer(currentQuestion.id, checked ? cur.filter((v) => v !== opt) : [...cur, opt]);
                          }}
                        >
                          <Checkbox
                            id={`${currentQuestion.id}-${i}`}
                            checked={checked}
                            onCheckedChange={(c) => {
                              const cur = (answers[currentQuestion.id] as string[]) || [];
                              updateAnswer(currentQuestion.id, c ? [...cur, opt] : cur.filter((v) => v !== opt));
                            }}
                          />
                          <Label
                            htmlFor={`${currentQuestion.id}-${i}`}
                            className="flex-1 cursor-pointer font-normal text-sm text-slate-700 dark:text-slate-300"
                          >
                            {opt}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                )}

                {currentQuestion.type === "text" && (
                  <textarea
                    className="w-full min-h-[200px] p-4 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#6633FF] focus:border-[#6633FF] focus:outline-none transition-all resize-none"
                    style={{ maxWidth: 801 }}
                    placeholder="Type your answer here..."
                    value={(answers[currentQuestion.id] as string) || ""}
                    onChange={(e) => updateAnswer(currentQuestion.id, e.target.value)}
                  />
                )}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="gap-2 h-10 px-5 text-sm font-semibold text-slate-600 dark:text-slate-400"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>

            <div className="flex items-center gap-3">
              {!isLastQuestion && (
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  className="gap-2 h-10 px-5 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400"
                >
                  <SkipForward className="h-4 w-4" /> Skip
                </Button>
              )}
              <Button
                onClick={handleSaveAndContinue}
                className="gap-2 h-10 px-6 text-sm font-semibold text-white shadow-md"
                style={{ background: "#6633FF" }}
              >
                <Save className="h-4 w-4" />
                {isLastQuestion ? "Save & Submit" : "Save & Continue"}
              </Button>
            </div>
          </div>

          {/* Question navigator grid */}
          <div className="mt-8 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Question Navigator</p>
            <div className="flex flex-wrap gap-2">
              {exam.questions.map((q, i) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = i === currentIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-8 w-8 rounded-md text-xs font-semibold transition-all duration-150 cursor-pointer ${
                      isCurrent
                        ? "bg-[#6633FF] text-white shadow-md"
                        : isAnswered
                        ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-800"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#6633FF]" /> Current</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" /> Answered</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-slate-300 dark:bg-slate-600" /> Unanswered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
