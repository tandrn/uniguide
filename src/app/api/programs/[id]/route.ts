import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// GET /api/programs/[id] — получить программу по ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: program, error } = await supabase
      .from("programs")
      .select("*, university:universities(*), subjects:ProgramSubject(subject:subjects(*)), careers:ProgramCareer(career:careers(*))")
      .eq("id", id)
      .single();

    if (error || !program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    return NextResponse.json(program);
  } catch (error) {
    console.error("Error fetching program:", error);
    return NextResponse.json({ error: "Failed to fetch program" }, { status: 500 });
  }
}
