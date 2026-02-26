import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// GET /api/saved — получить сохранённые программы
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("UserSavedProgram")
      .select("*, program:programs(*, university:universities(*))")
      .eq("userId", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error fetching saved:", error);
    return NextResponse.json({ error: "Failed to fetch saved" }, { status: 500 });
  }
}

// POST /api/saved — сохранить программу
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { programId } = body;

    if (!programId) {
      return NextResponse.json({ error: "programId is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("UserSavedProgram")
      .insert({
        userId: user.id,
        programId,
      })
      .select("*, program:programs(*, university:universities(*))")
      .single();

    if (error) {
      if (error.message.includes("duplicate")) {
        return NextResponse.json({ error: "Already saved" }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error saving program:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

// DELETE /api/saved — убрать из сохранённых
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const programId = req.nextUrl.searchParams.get("programId");

    if (!programId) {
      return NextResponse.json({ error: "programId is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("UserSavedProgram")
      .delete()
      .eq("userId", user.id)
      .eq("programId", programId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing saved:", error);
    return NextResponse.json({ error: "Failed to remove" }, { status: 500 });
  }
}
