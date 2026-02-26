/**
 * Скрипт для начального заполнения базы данных
 * Запуск: npx tsx scripts/seed.ts
 */

import { prisma } from "../src/lib/db";

const universities = [
  {
    id: "mgtu",
    name: "МГТУ им. Н.Э. Баумана",
    shortName: "МГТУ",
    city: "Москва",
    website: "https://bmstu.ru",
    description:
      "Один из старейших и крупнейших технических университетов России",
  },
  {
    id: "msu",
    name: "МГУ им. М.В. Ломоносова",
    shortName: "МГУ",
    city: "Москва",
    website: "https://msu.ru",
    description: "Классический университет с сильной фундаментальной подготовкой",
  },
  {
    id: "hse",
    name: "НИУ ВШЭ",
    shortName: "ВШЭ",
    city: "Москва",
    website: "https://hse.ru",
    description:
      "Ведущий исследовательский университет с международным признанием",
  },
  {
    id: "mipt",
    name: "МФТИ",
    shortName: "МФТИ",
    city: "Москва",
    website: "https://mipt.ru",
    description: "Элитный технический вуз с фокусом на физику и IT",
  },
];

const programs = [
  {
    id: "1",
    universityId: "mgtu",
    name: "Software Engineering & Robotics",
    description:
      "Программа направлена на подготовку инженеров в области программирования и робототехники с фокусом на практическое применение.",
    degree: "bachelor",
    duration: 4,
    language: "Рус / Eng",
    city: "Москва",
    passingScore: 270,
    budgetPlaces: 120,
    costPerYear: 350000,
    rating: 4.8,
    employment: 94,
    dropout: 5,
    satisfaction: 85,
    expectedSalaryClaimed: 90000,
    expectedSalaryReal: 120000,
    aiInsight:
      "Программа идеально подходит под ваши баллы по физике (85+) и интерес к робототехнике. У университета сильные связи с индустрией.",
    whyFits:
      "Ваш профиль указывает на склонность к практическому кодингу, а не к теории. Эта программа включает 70% лабораторных работ, что на 25% выше среднего показателя.",
    theoryPercent: 30,
    practicePercent: 70,
    tags: ["Бюджетные места", "Общежитие"],
    hashtags: ["#Робототехника", "#Python"],
  },
  {
    id: "2",
    universityId: "msu",
    name: "Прикладная математика и информатика",
    description:
      "Классическая фундаментальная программа с акцентом на математический аппарат и алгоритмы.",
    degree: "bachelor",
    duration: 4,
    language: "Рус",
    passingScore: 290,
    budgetPlaces: 80,
    costPerYear: 420000,
    rating: 4.9,
    employment: 92,
    dropout: 8,
    satisfaction: 82,
    expectedSalaryClaimed: 100000,
    expectedSalaryReal: 140000,
    aiInsight:
      "Сильная математическая школа соответствует вашему профилю олимпиадника. Высокий шанс прохождения на бюджет.",
    whyFits:
      "Ваш интерес к олимпиадной математике и программированию отлично подходит к фундаментальному подходу МГУ.",
    theoryPercent: 60,
    practicePercent: 40,
    tags: ["Фундаментальная база", "Олимпиады"],
    hashtags: ["#Алгоритмы", "#МатАнализ"],
  },
  {
    id: "3",
    universityId: "hse",
    name: "Бизнес-информатика",
    description:
      "Программа на стыке бизнеса и IT — подготовка продакт-менеджеров, аналитиков и технологических предпринимателей.",
    degree: "bachelor",
    duration: 4,
    language: "Рус / Eng",
    passingScore: 260,
    budgetPlaces: 60,
    costPerYear: 480000,
    rating: 4.6,
    employment: 96,
    dropout: 3,
    satisfaction: 88,
    expectedSalaryClaimed: 85000,
    expectedSalaryReal: 110000,
    aiInsight:
      "Альтернативный вариант. Меньше технического уклона, но отличные перспективы в управлении IT продуктами.",
    whyFits:
      "Если вас интересует не только код, но и бизнес-сторона IT — ВШЭ предлагает уникальное сочетание.",
    theoryPercent: 45,
    practicePercent: 55,
    tags: ["Стажировки", "Международный обмен"],
    hashtags: ["#ProductManagement", "#UX"],
  },
  {
    id: "4",
    universityId: "mipt",
    name: "Искусственный интеллект и большие данные",
    description:
      "Элитная программа подготовки специалистов по искусственному интеллекту и анализу данных.",
    degree: "bachelor",
    duration: 4,
    language: "Рус / Eng",
    passingScore: 300,
    budgetPlaces: 50,
    costPerYear: 400000,
    rating: 4.9,
    employment: 97,
    dropout: 4,
    satisfaction: 90,
    expectedSalaryClaimed: 120000,
    expectedSalaryReal: 180000,
    aiInsight:
      "Сильный фокус на проектной деятельности и стажировках в BigTech.",
    whyFits:
      "Ваш интерес к DS и Machine Learning совпадает с профилем программы. Стажировки в Яндекс, Сбер, Google.",
    theoryPercent: 40,
    practicePercent: 60,
    tags: ["Высокий рейтинг", "Наука"],
    hashtags: ["#AI", "#BigData"],
  },
];

const subjects = [
  { id: "math", name: "Математика", category: "Математика" },
  { id: "physics", name: "Физика", category: "Естественные науки" },
  { id: "informatics", name: "Информатика", category: "Программирование" },
  { id: "programming", name: "Программирование", category: "Программирование" },
  { id: "algorithms", name: "Алгоритмы", category: "Программирование" },
  { id: "ml", name: "Машинное обучение", category: "Программирование" },
  { id: "databases", name: "Базы данных", category: "Программирование" },
  { id: "economics", name: "Экономика", category: "Гуманитарные" },
  { id: "management", name: "Менеджмент", category: "Гуманитарные" },
];

const careers = [
  { id: "ml-engineer", name: "ML Engineer", avgSalary: 150000 },
  { id: "data-scientist", name: "Data Scientist", avgSalary: 180000 },
  { id: "backend-dev", name: "Backend Developer", avgSalary: 120000 },
  { id: "robotics", name: "Робототехник", avgSalary: 130000 },
  { id: "product-manager", name: "Product Manager", avgSalary: 200000 },
  { id: "analyst", name: "Бизнес-аналитик", avgSalary: 100000 },
  { id: "ai-researcher", name: "AI Researcher", avgSalary: 250000 },
];

async function seed() {
  console.log("🌱 Starting seed...");

  // Очистка базы
  console.log("🧹 Cleaning database...");
  await prisma.userSavedProgram.deleteMany();
  await prisma.programCareer.deleteMany();
  await prisma.programSubject.deleteMany();
  await prisma.career.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.program.deleteMany();
  await prisma.university.deleteMany();
  await prisma.user.deleteMany();

  // Университеты
  console.log("🏫 Creating universities...");
  for (const uni of universities) {
    await prisma.university.create({
      data: uni,
    });
  }

  // Программы
  console.log("📚 Creating programs...");
  for (const prog of programs) {
    await prisma.program.create({
      data: {
        ...prog,
        tags: JSON.stringify(prog.tags),
        hashtags: JSON.stringify(prog.hashtags),
      },
    });
  }

  // Предметы
  console.log("📖 Creating subjects...");
  for (const subj of subjects) {
    await prisma.subject.create({
      data: subj,
    });
  }

  // Карьеры
  console.log("💼 Creating careers...");
  for (const career of careers) {
    await prisma.career.create({
      data: career,
    });
  }

  // Связи программ с предметами
  console.log("🔗 Linking programs with subjects...");
  const programSubjects: Record<string, string[]> = {
    "1": ["programming", "algorithms", "physics", "ml"],
    "2": ["math", "algorithms", "programming"],
    "3": ["informatics", "economics", "management"],
    "4": ["math", "programming", "ml", "algorithms"],
  };

  for (const [programId, subjectIds] of Object.entries(programSubjects)) {
    for (const subjectId of subjectIds) {
      await prisma.programSubject.create({
        data: {
          programId,
          subjectId,
          year: Math.floor(Math.random() * 4) + 1,
          semester: Math.floor(Math.random() * 2) + 1,
          credits: Math.floor(Math.random() * 4) + 3,
        },
      });
    }
  }

  // Связи программ с карьерами
  console.log("🔗 Linking programs with careers...");
  const programCareers: Record<string, string[]> = {
    "1": ["backend-dev", "robotics", "ml-engineer"],
    "2": ["data-scientist", "analyst", "backend-dev"],
    "3": ["product-manager", "analyst"],
    "4": ["ml-engineer", "data-scientist", "ai-researcher"],
  };

  for (const [programId, careerIds] of Object.entries(programCareers)) {
    for (const careerId of careerIds) {
      await prisma.programCareer.create({
        data: {
          programId,
          careerId,
        },
      });
    }
  }

  console.log("✅ Seed completed successfully!");
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
