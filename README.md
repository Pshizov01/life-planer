# Life Planner

Личный веб-планер для отслеживания прогресса в пяти сферах жизни: спорт, привычки, питание/сон, учёба, финансы. Один пользователь, без публичной регистрации. Подробности — [docs/SPEC.md](docs/SPEC.md).

## Стек

React + Vite + Tailwind CSS + Supabase (Postgres + Auth) + Chart.js. Хостинг — Vercel (free tier).

## Локальная разработка

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm test
npm run lint
```

Нужен файл `.env.local` (см. `.env.example`) с ключами твоего Supabase-проекта.

## Настройка Supabase (один раз)

1. Создай проект на [supabase.com](https://supabase.com).
2. Выполни `supabase/schema.sql` в SQL Editor.
3. Создай единственного пользователя вручную: Authentication → Users → Add user.
4. Скопируй Project URL и Publishable (anon) key из Project Settings → API в `.env.local`.

## Деплой

Импортируй репозиторий в [Vercel](https://vercel.com), добавь переменные окружения `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` в настройках проекта, задеплой. `vercel.json` уже настроен под client-side роутинг (react-router).
