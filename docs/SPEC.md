# Spec: Life Planner (личный трекер жизненных сфер)

## Objective

Веб-планер для отслеживания прогресса в семи сферах жизни: намаз, спорт, учёба, привычки, питание+сон, финансы, плюс два вспомогательных инструмента — фокус-таймер (Помодоро) и трекер крупных проектов с чек-листами. Пользователь вносит записи вручную и видит динамику на графиках. Данные хранятся между сессиями и синхронизируются между устройствами (телефон + компьютер). Полностью бесплатный стек.

**Успех:** пользователь может за несколько секунд с телефона добавить запись в любую сферу и увидеть тренд на графике; данные не теряются и видны на любом устройстве после логина.

**История изменений:** изначально был личный однопользовательский планер (5 сфер, тёмная тема, вход по email+password, публичная регистрация отключена). После первого прохода реализации: редизайн на светлую тему (вдохновлённую похожим Telegram-мини-приложением, не копирующую её один в один), намаз вынесен в отдельную сферу с недельным отчётом (Пн-Вс), добавлены Фокус-таймер и Проекты. Затем приложение подключено как Telegram Mini App и открыто для любого пользователя Telegram (см. "Auth" ниже) — из строго личного инструмента превратилось в мультипользовательский сервис, где данные каждого пользователя изолированы через Supabase RLS.

## Tech Stack

- **Frontend:** React 18 + Vite (JavaScript, без TypeScript)
- **Styling:** Tailwind CSS, светлая тема (единственная тема, без переключателя)
- **Routing:** react-router-dom
- **Backend/DB:** Supabase (Postgres + Auth), free tier
- **Auth:** два пути к одним и тем же RLS-политикам (`user_id = auth.uid()`):
  1. Email+password (Supabase Auth) — для доступа через обычный браузер, пользователь создаётся вручную через Supabase Dashboard, публичная регистрация в UI отключена.
  2. Telegram Mini App — `api/telegram-auth.js` (Vercel serverless function) проверяет подпись `initData` (HMAC по токену бота, см. `verifyTelegramInitData` + тесты в `api/telegram-auth.test.js`), затем через Supabase Admin API (`service_role`) создаёт/логинит пользователя с синтетическим email `tg-<telegram_id>@telegram.local` и возвращает сессию. `AuthProvider` пробует этот путь автоматически, если `window.Telegram.WebApp.initData` присутствует и обычной сессии ещё нет.
- **Telegram Web App SDK:** `src/lib/telegram.js` — мягкая инициализация (ready/expand/цвета), каждый вызов в своём try/catch, чтобы неподдерживаемый метод в конкретном клиенте Telegram не блокировал рендер всего приложения.
- **Графики:** Chart.js + react-chartjs-2
- **Тесты:** Vitest (только чистая логика расчётов)
- **Хостинг:** Vercel free tier, авто-деплой из GitHub-репозитория

## Commands

```
Dev:     npm run dev
Build:   npm run build
Preview: npm run preview
Test:    npm test
Lint:    npm run lint
```

## Project Structure

```
life-planner/
  src/
    pages/           → Dashboard.jsx, Prayers.jsx, Sport.jsx, Study.jsx, Habits.jsx, Nutrition.jsx, Finance.jsx, Focus.jsx, Projects.jsx, Login.jsx
    components/      → переиспользуемые UI-компоненты (Card, ChartWrapper, ProgressBar, ProtectedRoute, AuthProvider)
    hooks/            → data-хуки на сферу (useWorkouts, useStudy, useHabits, useDailyLog, useFinance, useFocusSessions, useProjects)
    lib/
      supabaseClient.js → инициализация Supabase-клиента
      constants.js      → PRAYER_NAMES (список имён намазов, разделяет Habits/Prayers на одних и тех же таблицах), GENERIC_ERROR
      dates.js          → today(), dayLabel() — общие для всех страниц
      calculations.js   → чистые функции: прогресс целей, стрики привычек, агрегации для графиков (по неделям/категориям), mondayOf()
      calculations.test.js → unit-тесты на calculations.js
      telegram.js       → мягкая инициализация Telegram Web App SDK (no-op вне Telegram)
    App.jsx, main.jsx, index.css
  api/
    telegram-auth.js      → Vercel serverless function: проверка initData + выдача сессии Supabase
    telegram-auth.test.js → unit-тесты на verifyTelegramInitData (HMAC-проверка)
  supabase/
    schema.sql        → DDL таблиц + RLS-политики (применяется вручную через Supabase SQL Editor)
  docs/
    SPEC.md            → этот файл
  .env.example         → шаблон переменных окружения (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
  tasks/               → план и список задач (создаётся на шаге Planning)
```

## Data Model (Supabase Postgres)

Все таблицы имеют `user_id uuid references auth.users` и RLS-политику `user_id = auth.uid()` на SELECT/INSERT/UPDATE/DELETE.

```sql
-- Спорт
workouts (id uuid pk, user_id uuid, date date, type text, duration_min int, note text, created_at timestamptz)

-- Учёба
study_goals (id uuid pk, user_id uuid, title text, target numeric, progress numeric, unit text, done boolean, created_at timestamptz)
study_sessions (id uuid pk, user_id uuid, date date, subject text, duration_min int, created_at timestamptz)

-- Привычки и намаз (5 намазов и личные привычки — одни и те же таблицы,
-- разделяются на UI-уровне по lib/constants.js → PRAYER_NAMES)
habits (id uuid pk, user_id uuid, name text, sort_order int, created_at timestamptz)
habit_logs (id uuid pk, user_id uuid, habit_id uuid references habits, date date, done boolean, unique(habit_id, date))

-- Питание + сон (один ряд в день)
daily_log (id uuid pk, user_id uuid, date date unique, weight_kg numeric, meals_count int, water_glasses int, plan_score int check (plan_score between 1 and 5), sleep_hours numeric, created_at timestamptz)

-- Финансы
finance_transactions (id uuid pk, user_id uuid, date date, type text check (type in ('income','expense')), category text, amount numeric, note text, created_at timestamptz)
finance_goals (id uuid pk, user_id uuid, title text, target_amount numeric, current_amount numeric, target_date date, created_at timestamptz)

-- Фокус (Помодоро)
focus_sessions (id uuid pk, user_id uuid, date date, duration_min int, created_at timestamptz)

-- Проекты
projects (id uuid pk, user_id uuid, title text, description text, created_at timestamptz)
project_tasks (id uuid pk, user_id uuid, project_id uuid references projects, title text, done boolean, sort_order int, created_at timestamptz)
```

Начальные данные: при первом запуске (seed) создаются 5 привычек-намазов (Фаджр, Зухр, Аср, Магриб, Иша) — через `supabase/schema.sql` или разово вручную.

## Pages / Navigation

- `/login` — форма email+password (без signup), редирект на `/` после входа
- `/` (Dashboard) — сводка по всем сферам: тренировок за неделю, % намаза и привычек за текущую неделю, последний вес/сон, прогресс учебных целей, баланс за месяц
- `/prayers` — 5 намазов: карточки на сегодня (тумблер вкл/выкл) + график % выполнения за текущую неделю
- `/sport` — форма добавления тренировки + список записей + график длительности во времени
- `/study` — список целей с прогресс-барами + форма добавления сессии + график времени занятий
- `/habits` — сетка (личные привычки × дни текущей недели, Пн-Вс), клик по ячейке переключает да/нет
- `/nutrition` — форма дневного лога (вес, приёмы пищи, вода, сон, оценка) + графики (вес, сон во времени)
- `/finance` — форма транзакции + список + разбивка расходов по категориям + цели с прогресс-баром
- `/focus` — таймер Помодоро (25/5 мин, старт/пауза/сброс), лог завершённых сессий + график по неделям
- `/projects` — список проектов с описанием, прогресс-баром и чек-листом задач внутри каждого

Все страницы кроме `/login` защищены (redirect на `/login`, если нет сессии). Даты для намаза и привычек — текущая календарная неделя (Пн-Вс), пересчитывается на лету от реальной даты.

## Code Style

Функциональные компоненты, именованные экспорты для хуков/утилит, default export для страниц-компонентов. Tailwind-классы прямо в JSX, без отдельных CSS-модулей. Не более ~150 строк на файл компонента — выносить подкомпоненты при превышении.

```jsx
// src/hooks/useWorkouts.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useWorkouts() {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('workouts')
      .select('*')
      .order('date', { ascending: false })
      .then(({ data }) => {
        setWorkouts(data ?? [])
        setLoading(false)
      })
  }, [])

  return { workouts, loading }
}
```

```js
// src/lib/calculations.js
export function habitStreak(logs) {
  // logs: [{ date: '2026-08-15', done: true }, ...] отсортированы по убыванию даты
  let streak = 0
  for (const log of logs) {
    if (!log.done) break
    streak += 1
  }
  return streak
}
```

## Testing Strategy

- **Framework:** Vitest
- **Расположение:** `src/lib/*.test.js`, рядом с тестируемым модулем
- **Покрытие:** `lib/calculations.js` — прогресс целей (учёба, финансы), стрики привычек, агрегации данных для графиков (группировка по неделям/месяцам); плюс `api/telegram-auth.js` → `verifyTelegramInitData` (HMAC-проверка подписи, безопасность). UI-компоненты и data-хуки не тестируются (ручная проверка в браузере на каждом срезе).
- Тесты пишутся до реализации функции (TDD) для каждой новой расчётной функции.

## Boundaries

- **Всегда:** запускать `npm run build` и `npm test` перед тем, как считать срез готовым; держать RLS включённым на всех таблицах; валидировать формы перед вставкой (обязательные поля, числовые ограничения).
- **Сначала спросить:** добавление новых зависимостей вне согласованного стека; изменение схемы БД после первоначального создания; смена хостинг-провайдера; включение публичной регистрации.
- **Никогда:** не коммитить `.env` с ключами; не использовать Supabase `service_role` key в клиентском коде (`src/`) — только в серверных функциях (`api/`) через переменные окружения без префикса `VITE_`; не отключать RLS; не пушить в удалённый репозиторий без явного запроса пользователя.

## Success Criteria

- [ ] Логин по email+password работает, неавторизованный доступ к страницам данных невозможен
- [ ] Каждая сфера: есть форма/действие добавления записи, список/сетка записей, и график/визуализация прогресса во времени
- [ ] Данные сохраняются в Supabase и видны после перезахода и с другого устройства/браузера
- [ ] Dashboard показывает сводку по всем сферам на одной странице
- [ ] Светлая тема, адаптивный layout работает на ширине от ~375px (телефон)
- [ ] `npm run build` проходит без ошибок, `npm test` — все тесты зелёные
- [ ] Приложение задеплоено на Vercel и доступно по публичному URL бесплатно

## Open Questions

- Нет открытых вопросов — всё согласовано на этапе интервью.
