# Spec: Life Planner (личный трекер жизненных сфер)

## Objective

Личный веб-планер для одного пользователя (владельца) для отслеживания прогресса в пяти сферах жизни: спорт, учёба, привычки (включая намазы), питание+сон, финансы. Пользователь вносит записи вручную и видит динамику на графиках. Данные хранятся между сессиями и синхронизируются между устройствами (телефон + компьютер). Полностью бесплатный стек, без сложной авторизации (один пользователь, вход по email+password).

**Успех:** владелец может за несколько секунд с телефона добавить запись в любую из 5 сфер и увидеть тренд на графике; данные не теряются и видны на любом устройстве после логина.

## Tech Stack

- **Frontend:** React 18 + Vite (JavaScript, без TypeScript)
- **Styling:** Tailwind CSS, тёмная тема (единственная тема, без переключателя)
- **Routing:** react-router-dom
- **Backend/DB:** Supabase (Postgres + Auth), free tier
- **Auth:** Supabase email+password, один аккаунт, создан вручную через Supabase Dashboard. Публичная регистрация (signup) отключена в UI.
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
    pages/           → Dashboard.jsx, Sport.jsx, Study.jsx, Habits.jsx, Nutrition.jsx, Finance.jsx, Login.jsx
    components/      → переиспользуемые UI-компоненты (Card, ChartWrapper, EntryForm, ProgressBar, ProtectedRoute)
    hooks/            → data-хуки на сферу (useWorkouts, useStudy, useHabits, useDailyLog, useFinance)
    lib/
      supabaseClient.js → инициализация Supabase-клиента
      calculations.js   → чистые функции: прогресс целей, стрики привычек, агрегации для графиков
      calculations.test.js → unit-тесты на calculations.js
    App.jsx, main.jsx, index.css
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

-- Привычки (включая 5 намазов как обычные привычки)
habits (id uuid pk, user_id uuid, name text, sort_order int, created_at timestamptz)
habit_logs (id uuid pk, user_id uuid, habit_id uuid references habits, date date, done boolean, unique(habit_id, date))

-- Питание + сон (один ряд в день)
daily_log (id uuid pk, user_id uuid, date date unique, weight_kg numeric, meals_count int, water_glasses int, plan_score int check (plan_score between 1 and 5), sleep_hours numeric, created_at timestamptz)

-- Финансы
finance_transactions (id uuid pk, user_id uuid, date date, type text check (type in ('income','expense')), category text, amount numeric, note text, created_at timestamptz)
finance_goals (id uuid pk, user_id uuid, title text, target_amount numeric, current_amount numeric, target_date date, created_at timestamptz)
```

Начальные данные: при первом запуске (seed) создаются 5 привычек-намазов (Фаджр, Зухр, Аср, Магриб, Иша) — через `supabase/schema.sql` или разово вручную.

## Pages / Navigation

- `/login` — форма email+password (без signup), редирект на `/` после входа
- `/` (Dashboard) — сводка по всем 5 сферам: последняя активность + мини-показатель по каждой (напр. тренировок за неделю, % выполненных привычек за 7 дней, последний вес, баланс за месяц)
- `/sport` — форма добавления тренировки + список записей + график длительности во времени
- `/study` — список целей с прогресс-барами + форма добавления сессии + график времени занятий
- `/habits` — сетка (привычки × дни), клик по ячейке переключает да/нет
- `/nutrition` — форма дневного лога (вес, приёмы пищи, вода, сон, оценка) + графики (вес, сон во времени)
- `/finance` — форма транзакции + список + разбивка расходов по категориям + цели с прогресс-баром

Все страницы кроме `/login` защищены (redirect на `/login`, если нет сессии).

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
- **Покрытие:** только `lib/calculations.js` — прогресс целей (учёба, финансы), стрики привычек, агрегации данных для графиков (группировка по неделям/месяцам). UI-компоненты и data-хуки не тестируются (ручная проверка в браузере на каждом срезе).
- Тесты пишутся до реализации функции (TDD) для каждой новой расчётной функции.

## Boundaries

- **Всегда:** запускать `npm run build` и `npm test` перед тем, как считать срез готовым; держать RLS включённым на всех таблицах; валидировать формы перед вставкой (обязательные поля, числовые ограничения).
- **Сначала спросить:** добавление новых зависимостей вне согласованного стека; изменение схемы БД после первоначального создания; смена хостинг-провайдера; включение публичной регистрации.
- **Никогда:** не коммитить `.env` с ключами; не использовать Supabase `service_role` key на клиенте (только `anon` key); не отключать RLS; не пушить в удалённый репозиторий без явного запроса пользователя.

## Success Criteria

- [ ] Логин по email+password работает, неавторизованный доступ к страницам данных невозможен
- [ ] Каждая из 5 сфер: есть форма добавления записи, список/сетка записей, и график/визуализация прогресса во времени
- [ ] Данные сохраняются в Supabase и видны после перезахода и с другого устройства/браузера
- [ ] Dashboard показывает сводку по всем 5 сферам на одной странице
- [ ] Тёмная тема, адаптивный layout работает на ширине от ~375px (телефон)
- [ ] `npm run build` проходит без ошибок, `npm test` — все тесты зелёные
- [ ] Приложение задеплоено на Vercel и доступно по публичному URL бесплатно

## Open Questions

- Нет открытых вопросов — всё согласовано на этапе интервью.
