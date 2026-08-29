-- Life Planner: схема БД + RLS-политики.
-- Применить целиком в Supabase Dashboard → SQL Editor (после создания проекта).

create extension if not exists "pgcrypto";

-- ==================== Спорт ====================
create table workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  date date not null,
  type text not null,
  duration_min int not null check (duration_min > 0),
  note text,
  created_at timestamptz not null default now()
);

-- ==================== Учёба ====================
create table study_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text not null,
  target numeric not null check (target > 0),
  progress numeric not null default 0,
  unit text not null default '',
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  date date not null,
  subject text not null,
  duration_min int not null check (duration_min > 0),
  created_at timestamptz not null default now()
);

-- ==================== Привычки (включая намазы) ====================
create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  habit_id uuid not null references habits on delete cascade,
  date date not null,
  done boolean not null default true,
  unique (habit_id, date)
);

-- ==================== Питание + сон (один ряд в день) ====================
create table daily_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  date date not null,
  weight_kg numeric check (weight_kg > 0),
  meals_count int check (meals_count >= 0),
  water_glasses int check (water_glasses >= 0),
  plan_score int check (plan_score between 1 and 5),
  sleep_hours numeric check (sleep_hours >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

-- ==================== Финансы ====================
create table finance_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  date date not null,
  type text not null check (type in ('income', 'expense')),
  category text not null,
  amount numeric not null check (amount > 0),
  note text,
  created_at timestamptz not null default now()
);

create table finance_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text not null,
  target_amount numeric not null check (target_amount > 0),
  current_amount numeric not null default 0,
  target_date date,
  created_at timestamptz not null default now()
);

-- ==================== Фокус (Pomodoro) ====================
create table focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  date date not null,
  duration_min int not null check (duration_min > 0),
  created_at timestamptz not null default now()
);

-- ==================== Проекты ====================
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

create table project_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  project_id uuid not null references projects on delete cascade,
  title text not null,
  done boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ==================== RLS: включаем и ограничиваем доступ владельцем ====================
alter table workouts enable row level security;
alter table study_goals enable row level security;
alter table study_sessions enable row level security;
alter table habits enable row level security;
alter table habit_logs enable row level security;
alter table daily_log enable row level security;
alter table finance_transactions enable row level security;
alter table finance_goals enable row level security;
alter table focus_sessions enable row level security;
alter table projects enable row level security;
alter table project_tasks enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'workouts', 'study_goals', 'study_sessions', 'habits',
    'habit_logs', 'daily_log', 'finance_transactions', 'finance_goals',
    'focus_sessions', 'projects', 'project_tasks'
  ]
  loop
    execute format(
      'create policy "owner_all" on %I for all using (user_id = auth.uid()) with check (user_id = auth.uid());',
      t
    );
  end loop;
end $$;

-- ==================== Seed: 5 намазов как обычные привычки ====================
-- Выполнить один раз после того, как единственный пользователь создан
-- (Dashboard → Authentication → Add user), подставив его id ниже.
-- select id from auth.users; -- чтобы найти свой user_id
--
-- insert into habits (user_id, name, sort_order) values
--   ('<ВАШ_USER_ID>', 'Фаджр', 1),
--   ('<ВАШ_USER_ID>', 'Зухр', 2),
--   ('<ВАШ_USER_ID>', 'Аср', 3),
--   ('<ВАШ_USER_ID>', 'Магриб', 4),
--   ('<ВАШ_USER_ID>', 'Иша', 5);
