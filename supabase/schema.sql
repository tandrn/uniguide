-- ============================================
-- EduMatch Database Schema for Supabase
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- УНИВЕРСИТЕТЫ
-- ============================================
CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    city TEXT NOT NULL,
    website TEXT,
    description TEXT,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_universities_name ON universities(name);
CREATE INDEX idx_universities_city ON universities(city);

-- ============================================
-- ОБРАЗОВАТЕЛЬНЫЕ ПРОГРАММЫ
-- ============================================
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    "universityId" UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    degree TEXT NOT NULL, -- bachelor, master, specialist
    duration INTEGER NOT NULL, -- лет
    language TEXT NOT NULL,
    city TEXT NOT NULL,
    "passingScore" INTEGER,
    "budgetPlaces" INTEGER,
    "costPerYear" INTEGER,
    rating FLOAT DEFAULT 0,
    employment INTEGER DEFAULT 0,
    dropout INTEGER DEFAULT 0,
    satisfaction INTEGER DEFAULT 0,
    "expectedSalaryClaimed" INTEGER DEFAULT 0,
    "expectedSalaryReal" INTEGER DEFAULT 0,
    "aiInsight" TEXT,
    "whyFits" TEXT,
    "theoryPercent" INTEGER DEFAULT 50,
    "practicePercent" INTEGER DEFAULT 50,
    tags TEXT[],
    hashtags TEXT[],
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_programs_university ON programs("universityId");
CREATE INDEX idx_programs_name ON programs(name);
CREATE INDEX idx_programs_degree ON programs(degree);

-- ============================================
-- ПРЕДМЕТЫ
-- ============================================
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subjects_name ON subjects(name);
CREATE INDEX idx_subjects_category ON subjects(category);

-- ============================================
-- СВЯЗЬ: Программа <-> Предметы
-- ============================================
CREATE TABLE "ProgramSubject" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "programId" UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    "subjectId" UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    year INTEGER,
    semester INTEGER,
    credits INTEGER,
    hours INTEGER,
    type TEXT
);

CREATE UNIQUE INDEX idx_program_subject_unique ON "ProgramSubject"("programId", "subjectId");
CREATE INDEX idx_program_subject_program ON "ProgramSubject"("programId");
CREATE INDEX idx_program_subject_subject ON "ProgramSubject"("subjectId");

-- ============================================
-- КАРЬЕРЫ
-- ============================================
CREATE TABLE careers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    "avgSalary" INTEGER,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_careers_name ON careers(name);

-- ============================================
-- СВЯЗЬ: Программа <-> Карьеры
-- ============================================
CREATE TABLE "ProgramCareer" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "programId" UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    "careerId" UUID NOT NULL REFERENCES careers(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_program_career_unique ON "ProgramCareer"("programId", "careerId");
CREATE INDEX idx_program_career_program ON "ProgramCareer"("programId");
CREATE INDEX idx_program_career_career ON "ProgramCareer"("careerId");

-- ============================================
-- ПОЛЬЗОВАТЕЛИ
-- Привязка к Supabase Auth: users.id = auth.uid()
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    name TEXT,
    "avatarUrl" TEXT,
    "educationLevel" TEXT,
    "selectedSubjects" TEXT[],
    "studyFormat" TEXT,
    "careerTrack" TEXT,
    "egeScores" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- СОХРАНЁННЫЕ ПРОГРАММЫ
-- ============================================
CREATE TABLE "UserSavedProgram" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "programId" UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_user_saved_unique ON "UserSavedProgram"("userId", "programId");
CREATE INDEX idx_user_saved_user ON "UserSavedProgram"("userId");
CREATE INDEX idx_user_saved_program ON "UserSavedProgram"("programId");

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProgramSubject" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProgramCareer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserSavedProgram" ENABLE ROW LEVEL SECURITY;

-- Публичный доступ на чтение справочных таблиц
CREATE POLICY "Public read access" ON universities FOR SELECT USING (true);
CREATE POLICY "Public read access" ON programs FOR SELECT USING (true);
CREATE POLICY "Public read access" ON subjects FOR SELECT USING (true);
CREATE POLICY "Public read access" ON careers FOR SELECT USING (true);
CREATE POLICY "Public read access" ON "ProgramSubject" FOR SELECT USING (true);
CREATE POLICY "Public read access" ON "ProgramCareer" FOR SELECT USING (true);

-- Пользователи: только свои данные через auth.uid()
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (id = auth.uid());

-- Сохранённые: только свои через auth.uid()
CREATE POLICY "Users can read own saved" ON "UserSavedProgram"
  FOR SELECT USING ("userId" = auth.uid());
CREATE POLICY "Users can insert own saved" ON "UserSavedProgram"
  FOR INSERT WITH CHECK ("userId" = auth.uid());
CREATE POLICY "Users can delete own saved" ON "UserSavedProgram"
  FOR DELETE USING ("userId" = auth.uid());

-- ============================================
-- INITIAL DATA
-- ============================================

-- Университеты
INSERT INTO universities (id, name, "shortName", city, website, description) VALUES
('00000000-0000-0000-0000-000000000001', 'МГТУ им. Н.Э. Баумана', 'МГТУ', 'Москва', 'https://bmstu.ru', 'Один из старейших и крупнейших технических университетов России'),
('00000000-0000-0000-0000-000000000002', 'МГУ им. М.В. Ломоносова', 'МГУ', 'Москва', 'https://msu.ru', 'Классический университет с сильной фундаментальной подготовкой'),
('00000000-0000-0000-0000-000000000003', 'НИУ ВШЭ', 'ВШЭ', 'Москва', 'https://hse.ru', 'Ведущий исследовательский университет с международным признанием'),
('00000000-0000-0000-0000-000000000004', 'МФТИ', 'МФТИ', 'Москва', 'https://mipt.ru', 'Элитный технический вуз с фокусом на физику и IT');

-- Программы
INSERT INTO programs (id, name, description, "universityId", degree, duration, language, city, "passingScore", "budgetPlaces", "costPerYear", rating, employment, dropout, satisfaction, "expectedSalaryClaimed", "expectedSalaryReal", "aiInsight", "whyFits", "theoryPercent", "practicePercent", tags, hashtags) VALUES
('00000000-0000-0000-0000-000000000001', 'Software Engineering & Robotics', 'Программа направлена на подготовку инженеров в области программирования и робототехники с фокусом на практическое применение.', '00000000-0000-0000-0000-000000000001', 'bachelor', 4, 'Рус / Eng', 'Москва', 270, 120, 350000, 4.8, 94, 5, 85, 90000, 120000, 'Программа идеально подходит под ваши баллы по физике (85+) и интерес к робототехнике. У университета сильные связи с индустрией.', 'Ваш профиль указывает на склонность к практическому кодингу, а не к теории. Эта программа включает 70% лабораторных работ, что на 25% выше среднего показателя.', 30, 70, ARRAY['Бюджетные места', 'Общежитие'], ARRAY['#Робототехника', '#Python']),
('00000000-0000-0000-0000-000000000002', 'Прикладная математика и информатика', 'Классическая фундаментальная программа с акцентом на математический аппарат и алгоритмы.', '00000000-0000-0000-0000-000000000002', 'bachelor', 4, 'Рус', 'Москва', 290, 80, 420000, 4.9, 92, 8, 82, 100000, 140000, 'Сильная математическая школа соответствует вашему профилю олимпиадника. Высокий шанс прохождения на бюджет.', 'Ваш интерес к олимпиадной математике и программированию отлично подходит к фундаментальному подходу МГУ.', 60, 40, ARRAY['Фундаментальная база', 'Олимпиады'], ARRAY['#Алгоритмы', '#МатАнализ']),
('00000000-0000-0000-0000-000000000003', 'Бизнес-информатика', 'Программа на стыке бизнеса и IT — подготовка продакт-менеджеров, аналитиков и технологических предпринимателей.', '00000000-0000-0000-0000-000000000003', 'bachelor', 4, 'Рус / Eng', 'Москва', 260, 60, 480000, 4.6, 96, 3, 88, 85000, 110000, 'Альтернативный вариант. Меньше технического уклона, но отличные перспективы в управлении IT продуктами.', 'Если вас интересует не только код, но и бизнес-сторона IT — ВШЭ предлагает уникальное сочетание.', 45, 55, ARRAY['Стажировки', 'Международный обмен'], ARRAY['#ProductManagement', '#UX']),
('00000000-0000-0000-0000-000000000004', 'Искусственный интеллект и большие данные', 'Элитная программа подготовки специалистов по искусственному интеллекту и анализу данных.', '00000000-0000-0000-0000-000000000004', 'bachelor', 4, 'Рус / Eng', 'Москва', 300, 50, 400000, 4.9, 97, 4, 90, 120000, 180000, 'Сильный фокус на проектной деятельности и стажировках в BigTech.', 'Ваш интерес к DS и Machine Learning совпадает с профилем программы. Стажировки в Яндекс, Сбер, Google.', 40, 60, ARRAY['Высокий рейтинг', 'Наука'], ARRAY['#AI', '#BigData']);

-- Предметы
INSERT INTO subjects (id, name, category) VALUES
('00000000-0000-0000-0000-000000000001', 'Математика', 'Математика'),
('00000000-0000-0000-0000-000000000002', 'Физика', 'Естественные науки'),
('00000000-0000-0000-0000-000000000003', 'Информатика', 'Программирование'),
('00000000-0000-0000-0000-000000000004', 'Программирование', 'Программирование'),
('00000000-0000-0000-0000-000000000005', 'Алгоритмы', 'Программирование'),
('00000000-0000-0000-0000-000000000006', 'Машинное обучение', 'Программирование'),
('00000000-0000-0000-0000-000000000007', 'Базы данных', 'Программирование'),
('00000000-0000-0000-0000-000000000008', 'Экономика', 'Гуманитарные'),
('00000000-0000-0000-0000-000000000009', 'Менеджмент', 'Гуманитарные');

-- Карьеры
INSERT INTO careers (id, name, "avgSalary") VALUES
('00000000-0000-0000-0000-000000000001', 'ML Engineer', 150000),
('00000000-0000-0000-0000-000000000002', 'Data Scientist', 180000),
('00000000-0000-0000-0000-000000000003', 'Backend Developer', 120000),
('00000000-0000-0000-0000-000000000004', 'Робототехник', 130000),
('00000000-0000-0000-0000-000000000005', 'Product Manager', 200000),
('00000000-0000-0000-0000-000000000006', 'Бизнес-аналитик', 100000),
('00000000-0000-0000-0000-000000000007', 'AI Researcher', 250000);

-- Связи программ с предметами
INSERT INTO "ProgramSubject" ("programId", "subjectId", year, semester, credits) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 1, 1, 6),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 2, 3, 5),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 1, 2, 6),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', 3, 5, 6),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 1, 1, 8),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 2, 3, 6),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 1, 2, 6),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 1, 1, 5),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000008', 2, 3, 4),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000009', 3, 5, 4),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 1, 1, 8),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 1, 2, 6),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000006', 2, 3, 6),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', 2, 4, 5);

-- Связи программ с карьерами
INSERT INTO "ProgramCareer" ("programId", "careerId") VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003'),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005'),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000006'),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000007');
