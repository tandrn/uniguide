# Настройка Supabase для EduMatch

## 📋 Шаг 1: Создать проект в Supabase

1. Перейди на https://supabase.com
2. Нажми **"Start your project"** или **"New Project"**
3. Заполни:
   - **Name**: edumatch
   - **Database Password**: (запомни или сохрани в менеджере паролей)
   - **Region**: Frankfurt ( Germany) — ближайшая к РФ
4. Нажми **"Create new project"**

⏱️ Создание проекта займёт 2-3 минуты.

---

## 🔑 Шаг 2: Получить API ключи

1. В проекте перейди в **Settings** (шестерёнка слева)
2. Выбери **API**
3. Скопируй:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Перейди в **Settings** → **Database**
5. Скопируй **Connection string** (URI mode) → `SUPABASE_DATABASE_URL`
6. Для `SUPABASE_SERVICE_ROLE_KEY`:
   - **Settings** → **API**
   - Скопируй **service_role** (secret!)

---

## 📝 Шаг 3: Заполнить .env.local

Открой `.env.local` и вставь значения:

```env
# DeepSeek API
DEEPSEEK_API_KEY=your-deepseek-api-key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
```

---

## 🗄️ Шаг 4: Применить схему БД

### Вариант A: Через SQL Editor (рекомендуется)

1. В Supabase перейди в **SQL Editor** (слева)
2. Нажми **"New query"**
3. Скопируй содержимое `supabase/schema.sql`
4. Вставь в редактор
5. Нажми **"Run"** (или Ctrl+Enter)

✅ Все таблицы созданы!

### Вариант B: Через Prisma Migrate

```bash
# Применить миграции
npx prisma migrate deploy

# Сгенерировать клиент
npx prisma generate
```

---

## ✅ Шаг 5: Проверить подключение

Запусти тестовый скрипт:

```bash
npx tsx scripts/test-supabase.ts
```

Если всё ок — увидишь список университетов.

---

## 🚀 Шаг 6: Запустить разработку

```bash
npm run dev
```

Открой http://localhost:3000

---

## 📊 Полезные ссылки

- **Dashboard**: https://app.supabase.com
- **Документация**: https://supabase.com/docs
- **Table Editor**: https://app.supabase.com/project/YOUR_PROJECT/editor
- **API Docs**: https://supabase.com/docs/reference/javascript/introduction

---

## 🔧 Troubleshooting

### Ошибка: "Invalid API key"
- Проверь что используешь `anon public` ключ, а не `service_role`
- Для `NEXT_PUBLIC_SUPABASE_ANON_KEY` нужен именно anon ключ

### Ошибка: "Database connection failed"
- Проверь `SUPABASE_DATABASE_URL` — должен начинаться с `postgresql://`
- Убедись что пароль правильный (без пробелов)

### Таблицы не создались
- Запусти SQL из `supabase/schema.sql` в **SQL Editor**
- Проверь что нет ошибок синтаксиса

---

## 🎯 Что дальше?

После настройки:
1. ✅ База данных готова
2. ✅ API работает
3. ✅ Можно запускать `npm run dev`
4. ✅ Тестировать функционал
