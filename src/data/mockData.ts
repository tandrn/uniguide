export interface Program {
    id: string;
    name: string;
    university: string;
    universityShort: string;
    matchPercent: number;
    tags: string[];
    aiInsight: string;
    city: string;
    duration: string;
    language: string;
    passingScore: number;
    budgetPlaces: number;
    costPerYear: number;
    description: string;
    whyFits: string;
    theoryPercent: number;
    practicePercent: number;
    rating: number;
    employment: number;
    dropout: number;
    satisfaction: number;
    expectedSalary: { claimed: number; real: number };
    hashtags: string[];
    subjects: string[];
    careers: string[];
    partners: string[];
}

export const MOCK_PROGRAMS: Program[] = [
    {
        id: "1",
        name: "Software Engineering & Robotics",
        university: "МГТУ им. Н.Э. Баумана",
        universityShort: "МГТУ",
        matchPercent: 94,
        tags: ["Бюджетные места", "Общежитие"],
        aiInsight:
            "Программа идеально подходит под ваши баллы по физике (85+) и интерес к робототехнике. У университета сильные связи с индустрией.",
        city: "Москва",
        duration: "4 года",
        language: "Рус / Eng",
        passingScore: 270,
        budgetPlaces: 120,
        costPerYear: 350000,
        description:
            "Программа направлена на подготовку инженеров в области программирования и робототехники с фокусом на практическое применение.",
        whyFits:
            "Ваш профиль указывает на склонность к практическому кодингу, а не к теории. Эта программа включает 70% лабораторных работ, что на 25% выше среднего показателя.",
        theoryPercent: 30,
        practicePercent: 70,
        rating: 4.8,
        employment: 94,
        dropout: 5,
        satisfaction: 85,
        expectedSalary: { claimed: 90000, real: 120000 },
        hashtags: ["#Робототехника", "#Python"],
        subjects: ["Математика", "Физика", "Информатика", "Программирование"],
        careers: ["ML Engineer", "Робототехник", "Разработчик"],
        partners: ["Яндекс", "Сбер", "Mail.ru"],
    },
    {
        id: "2",
        name: "Прикладная математика и информатика",
        university: "МГУ им. М.В. Ломоносова",
        universityShort: "МГУ",
        matchPercent: 91,
        tags: ["Фундаментальная база", "Олимпиады"],
        aiInsight:
            "Сильная математическая школа соответствует вашему профилю олимпиадника. Высокий шанс прохождения на бюджет.",
        city: "Москва",
        duration: "4 года",
        language: "Рус",
        passingScore: 290,
        budgetPlaces: 80,
        costPerYear: 420000,
        description:
            "Классическая фундаментальная программа с акцентом на математический аппарат и алгоритмы.",
        whyFits:
            "Ваш интерес к олимпиадной математике и программированию отлично подходит к фундаментальному подходу МГУ.",
        theoryPercent: 60,
        practicePercent: 40,
        rating: 4.9,
        employment: 92,
        dropout: 8,
        satisfaction: 82,
        expectedSalary: { claimed: 100000, real: 140000 },
        hashtags: ["#Алгоритмы", "#МатАнализ"],
        subjects: ["Высшая математика", "Алгоритмы", "Дискретная математика"],
        careers: ["Data Scientist", "Аналитик", "Исследователь"],
        partners: ["Google", "Тинькофф", "ВТБ"],
    },
    {
        id: "3",
        name: "Бизнес-информатика",
        university: "НИУ ВШЭ",
        universityShort: "ВШЭ",
        matchPercent: 78,
        tags: ["Стажировки", "Международный обмен"],
        aiInsight:
            "Альтернативный вариант. Меньше технического уклона, но отличные перспективы в управлении IT продуктами.",
        city: "Москва",
        duration: "4 года",
        language: "Рус / Eng",
        passingScore: 260,
        budgetPlaces: 60,
        costPerYear: 480000,
        description:
            "Программа на стыке бизнеса и IT — подготовка продакт-менеджеров, аналитиков и технологических предпринимателей.",
        whyFits:
            "Если вас интересует не только код, но и бизнес-сторона IT — ВШЭ предлагает уникальное сочетание.",
        theoryPercent: 45,
        practicePercent: 55,
        rating: 4.6,
        employment: 96,
        dropout: 3,
        satisfaction: 88,
        expectedSalary: { claimed: 85000, real: 110000 },
        hashtags: ["#ProductManagement", "#UX"],
        subjects: ["Экономика", "Менеджмент", "Информационные системы"],
        careers: ["Product Manager", "Бизнес-аналитик", "Предприниматель"],
        partners: ["McKinsey", "Deloitte", "Яндекс"],
    },
    {
        id: "4",
        name: "ИИ и большие данные",
        university: "МФТИ",
        universityShort: "МФТИ",
        matchPercent: 98,
        tags: ["Высокий рейтинг", "Наука"],
        aiInsight:
            "Сильный фокус на проектной деятельности и стажировках в BigTech.",
        city: "Москва",
        duration: "4 года",
        language: "Рус / Eng",
        passingScore: 300,
        budgetPlaces: 50,
        costPerYear: 400000,
        description:
            "Элитная программа подготовки специалистов по искусственному интеллекту и анализу данных.",
        whyFits:
            "Ваш интерес к DS и Machine Learning совпадает с профилем программы. Стажировки в Яндекс, Сбер, Google.",
        theoryPercent: 40,
        practicePercent: 60,
        rating: 4.9,
        employment: 97,
        dropout: 4,
        satisfaction: 90,
        expectedSalary: { claimed: 120000, real: 180000 },
        hashtags: ["#AI", "#BigData"],
        subjects: ["Машинное обучение", "Нейросети", "Статистика"],
        careers: ["ML Engineer", "Data Scientist", "AI Researcher"],
        partners: ["Яндекс", "Google", "Сбер"],
    },
];

export const SUBJECTS_LIST = [
    { id: "math", name: "Математика", subtitle: "Профильный уровень", icon: "📐" },
    { id: "physics", name: "Физика", subtitle: "", icon: "⚡" },
    { id: "informatics", name: "Информатика", subtitle: "", icon: "💻" },
    { id: "chemistry", name: "Химия", subtitle: "", icon: "🧪" },
    { id: "biology", name: "Биология", subtitle: "", icon: "🧬" },
    { id: "russian", name: "Русский язык", subtitle: "", icon: "📝" },
    { id: "history", name: "История", subtitle: "", icon: "📜" },
    { id: "english", name: "Английский язык", subtitle: "", icon: "🌍" },
];
