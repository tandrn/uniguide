import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("subjects")
            .select("*")
            .order("name");

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data || []);
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
