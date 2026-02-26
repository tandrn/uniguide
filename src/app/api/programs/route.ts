import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("programs")
      .select("*, university:universities(*), subjects:ProgramSubject(subject:subjects(*)), careers:ProgramCareer(career:careers(*))");

    // Filters
    const degree = req.nextUrl.searchParams.get("degree");
    const city = req.nextUrl.searchParams.get("city");

    if (degree) query = query.eq("degree", degree);
    if (city) query = query.eq("city", city);

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform data to frontend format
    const programs = (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      university: p.university?.name || "",
      universityShort: p.university?.shortName || "",
      matchPercent: calculateMatch(p),
      tags: p.tags || [],
      aiInsight: p.aiInsight || "",
      city: p.city,
      duration: `${p.duration} года`,
      language: p.language,
      passingScore: p.passingScore,
      budgetPlaces: p.budgetPlaces,
      costPerYear: p.costPerYear,
      description: p.description || "",
      whyFits: p.whyFits || "",
      theoryPercent: p.theoryPercent,
      practicePercent: p.practicePercent,
      rating: p.rating,
      employment: p.employment,
      dropout: p.dropout,
      satisfaction: p.satisfaction,
      expectedSalary: {
        claimed: p.expectedSalaryClaimed,
        real: p.expectedSalaryReal,
      },
      hashtags: p.hashtags || [],
      subjects: p.subjects?.map((s: any) => s.subject?.name).filter(Boolean) || [],
      careers: p.careers?.map((c: any) => c.career?.name).filter(Boolean) || [],
      partners: [],
    }));

    return NextResponse.json(programs);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

function calculateMatch(p: any): number {
  let match = 50;
  match += (p.rating / 5) * 30;
  match += (p.employment / 100) * 20;
  return Math.min(Math.round(match), 99);
}
