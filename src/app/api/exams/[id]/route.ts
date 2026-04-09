import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { withAuth } from "@/lib/auth/withAuth";
import { rateLimit } from "@/lib/auth/rateLimit";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rl = rateLimit(req);
  if (!rl.success) return rl.response!;

  const auth = withAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: { questions: { orderBy: { order: "asc" } } },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, exam });
  } catch (error) {
    console.error("Get exam error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rl = rateLimit(req);
  if (!rl.success) return rl.response!;

  const auth = withAuth(req, ["EMPLOYER"]);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    const exam = await prisma.exam.findUnique({ where: { id } });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    if (exam.employerId !== auth.user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.exam.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete exam error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
