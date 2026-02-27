import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, programName, context } = body;

        // Ensure DEEPSEEK_API_KEY is available
        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            console.warn("DEEPSEEK_API_KEY is missing. Using fallback mock data.");
            return generateMockResponse(type, programName, context);
        }

        let prompt = "";

        switch (type) {
            case "gap_warning":
                prompt = `You are an expert academic advisor for a student studying "${programName}". 
                The student wants to achieve the following goal: "${context.goal}".
                Briefly identify 1 critical skill gap they might have right now and suggest 1 external course to fill it.
                Keep the tone professional, minimal, and direct. Output ONLY valid JSON:
                {
                    "warningText": "Краткое предупреждение о нехватке навыка (макс 2 предложения)",
                    "suggestedCourse": {
                        "provider": "Название платформы (например, Яндекс Практикум)",
                        "name": "Название курса",
                        "duration": "Длительность (например, 3 месяца)"
                    }
                }`;
                break;
            case "semester_details":
                prompt = `You are an academic advisor analyzing the "${context.semester}" semester of the "${programName}" program.
                Provide a deep realistic dive into this semester. Output ONLY valid JSON:
                {
                    "skills": [
                        {"name": "Название навыка 1", "hours": 120},
                        {"name": "Название навыка 2", "hours": 72}
                    ],
                    "difficulty": "Высокая / Средняя / Низкая (с кратким пояснением почему)",
                    "jobProspects": "Кем можно работать после этого семестра и примерное количество вакансий (макс 2 предложения)"
                }`;
                break;
            case "reality_tracker":
                prompt = `You are an academic advisor. A student studying "${programName}" just failed the following exam: "${context.failedSubject}".
                How does this impact their future, and what is the immediate corrective action? Output ONLY valid JSON:
                {
                    "impact": "Краткое описание риска для будущего (1 предложение)",
                    "advice": "Конкретный совет (например: Найти репетитора по теме X)"
                }`;
                break;
            case "what_if":
                prompt = `A student studying "${programName}" wants to change their ultimate career goal to "${context.newGoal}".
                They are keeping their current degree but adjusting their future path.
                Recommend 2 new future milestones (like a specialized Master's degree, a student club, or a specific internship) to help them pivot. Output ONLY valid JSON:
                {
                    "justification": "Кратко почему это хороший пивот (1 предложение)",
                    "newMilestones": [
                        {"title": "Название варианта 1", "subtitle": "Краткое описание"},
                        {"title": "Название варианта 2", "subtitle": "Краткое описание"}
                    ]
                }`;
                break;
            default:
                return NextResponse.json({ error: "Invalid request type" }, { status: 400 });
        }

        const response = await fetch("https://api.deepseek.com/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "You are an API that outputs ONLY valid JSON without Markdown blocks or any other text." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            console.error("DeepSeek API error:", await response.text());
            return generateMockResponse(type, programName, context);
        }

        const data = await response.json();
        try {
            const parsedContent = JSON.parse(data.choices[0].message.content);
            return NextResponse.json(parsedContent);
        } catch (e) {
            console.error("Failed to parse DeepSeek JSON response:", data.choices[0].message.content);
            return generateMockResponse(type, programName, context);
        }

    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Fallback mock responses if API fails or key is missing
function generateMockResponse(type: string, programName: string, context: any) {
    if (type === "gap_warning") {
        return NextResponse.json({
            warningText: `Для стажировки по направлению "${context.goal}" требуется знание промышленных фреймворков. В учебном плане вуза они начнутся только через год.`,
            suggestedCourse: {
                provider: "Яндекс Практикум",
                name: "React-разработчик",
                duration: "10 месяцев"
            }
        });
    }
    if (type === "semester_details") {
        return NextResponse.json({
            skills: [
                { name: "Объектно-ориентированное программирование", hours: 144 },
                { name: "Базы данных (SQL)", hours: 72 }
            ],
            difficulty: "Высокая. Ожидается 2 курсовых проекта и сложная сессия.",
            jobProspects: "Достигнут уровень Junior Developer. Открыто более 150 стажировок."
        });
    }
    if (type === "reality_tracker") {
        return NextResponse.json({
            impact: `Завал предмета "${context.failedSubject}" критически снижает шансы на поступление в магистратуру и прохождение технических интервью.`,
            advice: "Рекомендуется найти репетитора и пересдать в ближайшую комиссию."
        });
    }
    if (type === "what_if") {
        return NextResponse.json({
            justification: `Смена цели на "${context.newGoal}" логична, текущий бэкграунд послужит отличной базой.`,
            newMilestones: [
                { title: `Магистратура: Технологическое предпринимательство`, subtitle: "Фокус на бизнес-процессах" },
                { title: "Студенческий бизнес-клуб", subtitle: "Расширение нетворка на 3 курсе" }
            ]
        });
    }
    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
}
