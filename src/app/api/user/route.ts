import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// GET /api/user — получить текущего пользователя
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch user profile
    const { data: profile, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (error || !profile) {
      // Auto-create profile if missing
      const { data: newProfile, error: createError } = await supabase
        .from("users")
        .insert({
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.name || null,
        })
        .select()
        .single();

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }

      return NextResponse.json(newProfile);
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PUT /api/user — обновить предпочтения пользователя
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...data } = body;

    const { data: updated, error } = await supabase
      .from("users")
      .update({
        ...data,
        "updatedAt": new Date().toISOString(),
      })
      .eq("id", authUser.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
