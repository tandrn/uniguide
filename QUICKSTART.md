# 🚀 Быстрый старт с Supabase

## Что нужно сделать (5 минут)

### 1. Создай проект в Supabase
- Перейди на https://supabase.com
- Нажми **"New Project"**
- Name: `edumatch`
- Region: Frankfurt (ближайшая к РФ)
- Password: сохрани!

### 2. Скопируй ключи в .env.local

После создания проекта:
- **Settings** → **API**
- Скопируй 3 значения в `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
```

### 3. Создай таблицы в БД

- В Supabase: **SQL Editor** → **New query**
- Скопируй содержимое `supabase/schema.sql`
- Нажми **Run**

✅ Готово! Все таблицы и данные созданы.

### 4. Проверь подключение

```bash
npx tsx scripts/test-supabase.ts
```

Если видишь список университетов — всё работает!

### 5. Запусти проект

```bash
npm run dev
```

---

## 📁 Что изменилось

| Файл | Зачем |
|------|-------|
| `src/lib/supabase.ts` | Клиент Supabase |
| `supabase/schema.sql` | Схема БД (таблицы + данные) |
| `scripts/test-supabase.ts` | Тест подключения |
| `SUPABASE_SETUP.md` | Подробная инструкция |
| `.env.local` | Ключи доступа |

---

## ❓ Проблемы?

- **Invalid API key** → Проверь что используешь `anon public` ключ
- **Database connection failed** → Проверь пароль в `SUPABASE_DATABASE_URL`
- **Таблиц нет** → Запусти `supabase/schema.sql` в SQL Editor

---

## 🎯 Следующие шаги

1. ✅ Настроить Supabase
2. ✅ Запустить `npm run dev`
3. ✅ Протестировать API: http://localhost:3000/api/programs
4. ✅ Обновить фронтенд для работы с API
