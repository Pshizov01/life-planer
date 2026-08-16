# Task List: Life Planner

See `tasks/plan.md` for phases/checkpoints overview and `docs/SPEC.md` for the full spec.

## Phase 1: Foundation

### Task 1: Scaffold проекта и инструментов

**Description:** Создать Vite+React проект, подключить Tailwind (тёмная тема по умолчанию), ESLint, Vitest, react-router-dom, базовую структуру папок и общие UI-компоненты (Card, ProgressBar, ChartWrapper, EntryForm-обёртку).

**Acceptance criteria:**
- [ ] `npm run dev` поднимает пустое приложение с тёмным фоном и роутером (заглушки страниц)
- [ ] Tailwind работает (утилити-классы применяются)
- [ ] Структура папок соответствует `docs/SPEC.md` → Project Structure

**Verification:**
- [ ] `npm run build` — без ошибок
- [ ] `npm run lint` — без ошибок
- [ ] Manual check: страница открывается в браузере, видна тёмная тема и переключение между страницами-заглушками

**Dependencies:** None

**Files likely touched:**
- `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`
- `src/main.jsx`, `src/App.jsx`, `src/index.css`
- `src/pages/*.jsx` (заглушки), `src/components/Card.jsx`, `src/components/ProgressBar.jsx`, `src/components/ChartWrapper.jsx`

**Estimated scope:** Medium: 3-5 files (плюс конфиги)

---

### Task 2: Supabase — схема БД и клиент

**Description:** Создать Supabase-проект (пользователь делает вручную в браузере), применить `supabase/schema.sql` (все 7 таблиц + RLS-политики + seed 5 намазов), подключить `@supabase/supabase-js` клиент через `.env`.

**Acceptance criteria:**
- [ ] `supabase/schema.sql` содержит все таблицы из `docs/SPEC.md` → Data Model с RLS-политиками `user_id = auth.uid()`
- [ ] Seed 5 привычек-намазов включён в schema.sql (или отдельный `seed.sql`)
- [ ] `src/lib/supabaseClient.js` инициализирует клиент из `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
- [ ] `.env.example` создан, `.env` в `.gitignore`

**Verification:**
- [ ] Manual check: SQL применён в Supabase SQL Editor без ошибок
- [ ] Manual check: запрос к любой таблице без авторизации (anon, без сессии) возвращает пустой результат (RLS работает)
- [ ] `npm run build` — без ошибок

**Dependencies:** Task 1

**Files likely touched:**
- `supabase/schema.sql`
- `src/lib/supabaseClient.js`
- `.env.example`, `.gitignore`

**Estimated scope:** Small: 1-2 files (+ ручной шаг в Supabase Dashboard)

---

### Task 3: Авторизация и защищённые роуты

**Description:** Страница `/login` (email+password, без signup), хранение сессии через Supabase Auth, `ProtectedRoute`-обёртка для всех остальных страниц, редирект неавторизованных на `/login`.

**Acceptance criteria:**
- [ ] Пользователь может залогиниться существующим аккаунтом (созданным вручную в Supabase Dashboard)
- [ ] При отсутствии сессии любой защищённый роут редиректит на `/login`
- [ ] После логина сессия сохраняется между перезагрузками страницы

**Verification:**
- [ ] `npm run build` — без ошибок
- [ ] Manual check: логин с правильными данными → попадаешь на `/`; с неправильными → ошибка на форме; прямой заход на `/sport` без сессии → редирект на `/login`

**Dependencies:** Task 2

**Files likely touched:**
- `src/pages/Login.jsx`
- `src/components/ProtectedRoute.jsx`
- `src/App.jsx` (роутинг)
- `src/hooks/useAuth.js` (или контекст сессии)

**Estimated scope:** Medium: 3-5 files

## Checkpoint: Foundation
- [ ] `npm run build` проходит
- [ ] Логин работает end-to-end против реального Supabase-проекта
- [ ] Неавторизованный доступ редиректит на `/login`
- [ ] **Review with human before proceeding**

## Phase 2: Вертикальные срезы по сферам

### Task 4: Сфера «Привычки»

**Description:** Страница `/habits` — сетка (привычки × последние N дней), клик по ячейке переключает done/not done. CRUD для добавления новой привычки. Функция стрика в `calculations.js` (TDD).

**Acceptance criteria:**
- [ ] Написан тест на `habitStreak()` в `calculations.test.js` до реализации функции
- [ ] Можно добавить новую привычку, кликнуть ячейку дня → сохраняется в `habit_logs`
- [ ] 5 намазов видны в сетке из seed-данных
- [ ] Стрик отображается рядом с каждой привычкой

**Verification:**
- [ ] `npm test` — зелёный, включая новый тест на `habitStreak`
- [ ] `npm run build` — без ошибок
- [ ] Manual check: отметить привычку за сегодня, обновить страницу — состояние сохранилось

**Dependencies:** Task 3

**Files likely touched:**
- `src/pages/Habits.jsx`
- `src/hooks/useHabits.js`
- `src/lib/calculations.js`, `src/lib/calculations.test.js`

**Estimated scope:** Medium: 3-5 files

---

### Task 5: Сфера «Спорт»

**Description:** Страница `/sport` — форма добавления тренировки (тип, длительность, заметка), список записей, график длительности во времени (по неделям).

**Acceptance criteria:**
- [ ] Написан тест на функцию агрегации по неделям (`groupByWeek` или аналог) до реализации
- [ ] Добавленная тренировка появляется в списке и на графике
- [ ] Форма валидирует обязательные поля (тип, длительность > 0)

**Verification:**
- [ ] `npm test` — зелёный
- [ ] `npm run build` — без ошибок
- [ ] Manual check: добавить 2-3 тренировки, увидеть их на графике

**Dependencies:** Task 3

**Files likely touched:**
- `src/pages/Sport.jsx`
- `src/hooks/useWorkouts.js`
- `src/lib/calculations.js`, `src/lib/calculations.test.js` (переиспользование агрегации)

**Estimated scope:** Medium: 3-5 files

---

### Task 6: Сфера «Питание/Сон»

**Description:** Страница `/nutrition` — форма дневного лога (вес, приёмы пищи, вода, сон, оценка 1-5), upsert по дате (одна запись в день), графики веса и сна во времени.

**Acceptance criteria:**
- [ ] Повторное сохранение за уже существующую дату обновляет запись (upsert), а не создаёт дубликат
- [ ] Графики веса и сна отображают исторические записи
- [ ] Форма валидирует диапазоны (оценка 1-5, вес > 0)

**Verification:**
- [ ] `npm test` — зелёный
- [ ] `npm run build` — без ошибок
- [ ] Manual check: сохранить лог за сегодня дважды с разными значениями — в БД одна строка с последними значениями

**Dependencies:** Task 3

**Files likely touched:**
- `src/pages/Nutrition.jsx`
- `src/hooks/useDailyLog.js`
- `src/lib/calculations.js` (переиспользование, при необходимости)

**Estimated scope:** Medium: 3-5 files

## Checkpoint: Первые три сферы
- [ ] Все тесты зелёные, build чистый
- [ ] Привычки, спорт, питание — рабочие end-to-end
- [ ] **Review with human before proceeding**

---

### Task 7: Сфера «Учёба»

**Description:** Страница `/study` — список целей с прогресс-баром (создание/обновление цели), форма добавления сессии занятий (дата, предмет, длительность), график времени занятий по неделям.

**Acceptance criteria:**
- [ ] Написан тест на `goalProgress()` (например, progress/target → %) до реализации
- [ ] Можно создать цель и обновлять её progress вручную или через сессии (см. Open note ниже)
- [ ] Добавленная сессия появляется в списке и на графике

**Verification:**
- [ ] `npm test` — зелёный
- [ ] `npm run build` — без ошибок
- [ ] Manual check: создать цель, добавить сессию, увидеть прогресс-бар и график

**Dependencies:** Task 3 (не зависит от Task 4-6, можно делать параллельно)

**Files likely touched:**
- `src/pages/Study.jsx`
- `src/hooks/useStudyGoals.js`, `src/hooks/useStudySessions.js`
- `src/lib/calculations.js`, `src/lib/calculations.test.js`

**Estimated scope:** Medium: 3-5 files

---

### Task 8: Сфера «Финансы»

**Description:** Страница `/finance` — форма транзакции (доход/расход, категория, сумма, дата), список транзакций, разбивка расходов по категориям (диаграмма), финансовые цели с прогресс-баром.

**Acceptance criteria:**
- [ ] Написан тест на агрегацию расходов по категориям и на `goalProgress()` (переиспользование из Task 7, если применимо) до реализации новых функций
- [ ] Добавленная транзакция появляется в списке и влияет на разбивку по категориям
- [ ] Цель отображает прогресс (current/target)

**Verification:**
- [ ] `npm test` — зелёный
- [ ] `npm run build` — без ошибок
- [ ] Manual check: добавить доход и 2 расхода в разных категориях, увидеть разбивку

**Dependencies:** Task 3 (не зависит от Task 4-7, можно делать параллельно)

**Files likely touched:**
- `src/pages/Finance.jsx`
- `src/hooks/useFinance.js`
- `src/lib/calculations.js`, `src/lib/calculations.test.js`

**Estimated scope:** Medium: 3-5 files

## Checkpoint: Все сферы готовы
- [ ] Все 5 сфер работают end-to-end
- [ ] **Review with human before proceeding**

## Phase 3: Сводка и деплой

### Task 9: Dashboard — сводная страница

**Description:** Страница `/` — сводка по всем 5 сферам (карточки: тренировки за неделю, % привычек за 7 дней, последний вес/сон, прогресс учебных целей, баланс/расходы за месяц).

**Acceptance criteria:**
- [ ] Каждая карточка тянет данные через уже существующие хуки (без новых Supabase-запросов вне хуков)
- [ ] Дашборд открывается за разумное время (нет видимых лишних перезапросов)

**Verification:**
- [ ] `npm run build` — без ошибок
- [ ] Manual check: данные на дашборде совпадают с тем, что видно на отдельных страницах сфер

**Dependencies:** Tasks 4-8

**Files likely touched:**
- `src/pages/Dashboard.jsx`
- `src/components/Card.jsx` (при необходимости расширить)

**Estimated scope:** Medium: 3-5 files

---

### Task 10: Мобильная адаптивность и визуальная полировка

**Description:** Проверить и поправить все страницы на ширине ~375px (телефон) и ~768px+ (десктоп): формы, графики, сетка привычек не должны ломаться/обрезаться.

**Acceptance criteria:**
- [ ] Все 6 страниц (включая Dashboard) корректно отображаются на 375px без горизонтального скролла
- [ ] Графики читаемы на маленьком экране (либо адаптивная высота/легенда)

**Verification:**
- [ ] Manual check: DevTools responsive mode 375px и 768px на каждой странице

**Dependencies:** Task 9

**Files likely touched:** любые `src/pages/*.jsx`, `src/components/*.jsx` (точечные правки классов)

**Estimated scope:** Medium: 3-5 files

---

### Task 11: Деплой на Vercel + финальная проверка

**Description:** Запушить репозиторий на GitHub, подключить Vercel (free tier), настроить env-переменные (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) в Vercel, проверить рабочий URL с телефона.

**Acceptance criteria:**
- [ ] Приложение доступно по публичному URL Vercel
- [ ] Логин и хотя бы одна операция в каждой сфере работают на проде
- [ ] Проверено с реального телефона (не только DevTools-эмуляция)

**Verification:**
- [ ] Manual check: открыть URL с телефона, залогиниться, добавить запись, увидеть на графике

**Dependencies:** Task 10

**Files likely touched:** `vercel.json` (если нужен), `README.md` (инструкция по деплою)

**Estimated scope:** Small: 1-2 files (+ ручные шаги вне кода)

## Checkpoint: Complete
- [ ] Все success criteria из `docs/SPEC.md` выполнены
- [ ] Приложение доступно по публичному URL, проверено с телефона
- [ ] Ready for review
