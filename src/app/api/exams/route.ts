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
    const exams = await prisma.exam.findMany({
      include: { questions: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, exams });
  } catch (error) {
    console.error("Get exams error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(req);
  if (!rl.success) return rl.response!;

  const auth = withAuth(req, ["EMPLOYER"]);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { title, totalCandidates, totalSlots, questionSets, questionType, startTime, endTime, duration, negativeMarking, questions } = body;

    if (!title || !startTime || !endTime || !duration) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const exam = await prisma.exam.create({
      data: {
        title,
        totalCandidates: Number(totalCandidates),
        totalSlots: Number(totalSlots),
        questionSets: Number(questionSets),
        questionType,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        duration: Number(duration),
        negativeMarking: Boolean(negativeMarking),
        employerId: auth.user.userId,
        questions: {
          create: (questions || []).map((q: any, i: number) => ({
            title: q.title,
            type: q.type,
            options: q.options || [],
            order: i,
          })),
        },
      },
      include: { questions: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ success: true, exam }, { status: 201 });
  } catch (error) {
    console.error("Create exam error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
