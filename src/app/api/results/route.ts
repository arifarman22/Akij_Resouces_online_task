import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { withAuth } from "@/lib/auth/withAuth";
import { rateLimit } from "@/lib/auth/rateLimit";

export async function GET(req: NextRequest) {
  const rl = rateLimit(req);
  if (!rl.success) return rl.response!;

  const auth = withAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const examId = searchParams.get("examId");

    const where: any = {};

    if (auth.user.role === "CANDIDATE") {
      where.candidateId = auth.user.userId;
    }

    if (examId) {
      where.examId = examId;
    }

    const results = await prisma.candidateResult.findMany({
      where,
      include: {
        candidate: { select: { id: true, email: true, name: true } },
        exam: { select: { id: true, title: true } },
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Get results error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(req);
  if (!rl.success) return rl.response!;

  const auth = withAuth(req, ["CANDIDATE"]);
  if (auth instanceof NextResponse) return auth;

  try {
    const { examId, answers, tabSwitches, fullscreenExits } = await req.json();

    if (!examId) {
      return NextResponse.json({ error: "Exam ID is required" }, { status: 400 });
    }

    // Check if already submitted
    const existing = await prisma.candidateResult.findUnique({
      where: { candidateId_examId: { candidateId: auth.user.userId, examId } },
    });

    if (existing) {
      return NextResponse.json({ error: "Already submitted this exam" }, { status: 409 });
    }

    // Verify exam exists
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const result = await prisma.candidateResult.create({
      data: {
        candidateId: auth.user.userId,
        examId,
        answers: answers || {},
        tabSwitches: tabSwitches || 0,
        fullscreenExits: fullscreenExits || 0,
      },
    });

    return NextResponse.json({ success: true, result }, { status: 201 });
  } catch (error) {
    console.error("Submit result error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
