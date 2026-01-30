-- Campus Help Supabase schema essentials
-- Run these statements in your project SQL editor to provision the tables the app expects.

create extension if not exists "pgcrypto";

-- Profiles ------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  program text,
  year text,
  courses text[] default '{}',
  rate_cents integer,
  contact text,
  preferred_role text default 'learner' check (preferred_role in ('learner','tutor')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles selectable" on public.profiles;
create policy "profiles selectable" on public.profiles
  for select using (true);

drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Public directory ----------------------------------------------------------
create table if not exists public.public_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  full_name text,
  program text,
  year text,
  courses text[] default '{}',
  rate_cents integer,
  contact text,
  is_listed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.public_profiles enable row level security;

drop policy if exists "public_profiles visible" on public.public_profiles;
create policy "public_profiles visible" on public.public_profiles
  for select using (is_listed = true);

drop policy if exists "public_profiles manage own" on public.public_profiles;
create policy "public_profiles manage own" on public.public_profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Tutor availability --------------------------------------------------------
create table if not exists public.tutor_availability (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.profiles(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  mode text not null check (mode in ('online','in-person')),
  is_emergency boolean default false,
  created_at timestamptz default now()
);

alter table public.tutor_availability enable row level security;

drop policy if exists "availability viewable" on public.tutor_availability;
create policy "availability viewable" on public.tutor_availability
  for select using (true);

drop policy if exists "availability manage own" on public.tutor_availability;
create policy "availability manage own" on public.tutor_availability
  for all using (auth.uid() = tutor_id) with check (auth.uid() = tutor_id);

create index if not exists idx_tutor_availability_tutor on public.tutor_availability(tutor_id);
create index if not exists idx_tutor_availability_start on public.tutor_availability(start_time);

-- Requests ------------------------------------------------------------------
create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  course text not null,
  description text not null,
  budget_cents integer check (budget_cents is null or budget_cents >= 0),
  mode text not null default 'online' check (mode in ('online','in-person')),
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz default now()
);

alter table public.requests enable row level security;

drop policy if exists "requests readable" on public.requests;
create policy "requests readable" on public.requests
  for select using (true);

drop policy if exists "requests insert own" on public.requests;
create policy "requests insert own" on public.requests
  for insert with check (auth.uid() = author_id);

drop policy if exists "requests update own" on public.requests;
create policy "requests update own" on public.requests
  for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

drop policy if exists "requests delete own" on public.requests;
create policy "requests delete own" on public.requests
  for delete using (auth.uid() = author_id);

create index if not exists idx_requests_author on public.requests(author_id);
create index if not exists idx_requests_status on public.requests(status);

-- Replies -------------------------------------------------------------------
create table if not exists public.replies (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  helper_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  created_at timestamptz default now()
);

alter table public.replies enable row level security;

drop policy if exists "replies readable" on public.replies;
create policy "replies readable" on public.replies
  for select using (true);

drop policy if exists "replies insert own" on public.replies;
create policy "replies insert own" on public.replies
  for insert with check (auth.uid() = helper_id);

drop policy if exists "replies update own" on public.replies;
create policy "replies update own" on public.replies
  for update using (auth.uid() = helper_id) with check (auth.uid() = helper_id);

drop policy if exists "replies delete own" on public.replies;
create policy "replies delete own" on public.replies
  for delete using (auth.uid() = helper_id);

create index if not exists idx_replies_request on public.replies(request_id);
create index if not exists idx_replies_helper on public.replies(helper_id);

-- Bids ----------------------------------------------------------------------
create table if not exists public.bids (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  helper_id uuid not null references public.profiles(id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  message text,
  created_at timestamptz default now()
);

create unique index if not exists bids_request_helper_unique on public.bids(request_id, helper_id);
create index if not exists idx_bids_request on public.bids(request_id);
create index if not exists idx_bids_helper on public.bids(helper_id);

alter table public.bids enable row level security;

drop policy if exists "bids readable" on public.bids;
create policy "bids readable" on public.bids
  for select using (true);

drop policy if exists "bids insert own" on public.bids;
create policy "bids insert own" on public.bids
  for insert with check (auth.uid() = helper_id);

drop policy if exists "bids update own" on public.bids;
create policy "bids update own" on public.bids
  for update using (auth.uid() = helper_id) with check (auth.uid() = helper_id);

drop policy if exists "bids delete own" on public.bids;
create policy "bids delete own" on public.bids
  for delete using (auth.uid() = helper_id);

-- Bookings ------------------------------------------------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  tutor_id uuid not null references public.profiles(id) on delete cascade,
  availability_id uuid references public.tutor_availability(id) on delete set null,
  scheduled_start timestamptz not null,
  scheduled_end timestamptz not null,
  mode text not null check (mode in ('online','in-person')),
  status text not null default 'pending' check (status in ('pending','confirmed','completed','cancelled')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.bookings enable row level security;

drop policy if exists "bookings viewable by participants" on public.bookings;
create policy "bookings viewable by participants" on public.bookings
  for select using (auth.uid() = student_id or auth.uid() = tutor_id);

drop policy if exists "bookings insert by student" on public.bookings;
create policy "bookings insert by student" on public.bookings
  for insert with check (auth.uid() = student_id);

drop policy if exists "bookings update by participants" on public.bookings;
create policy "bookings update by participants" on public.bookings
  for update using (auth.uid() = student_id or auth.uid() = tutor_id);

drop policy if exists "bookings delete by student" on public.bookings;
create policy "bookings delete by student" on public.bookings
  for delete using (auth.uid() = student_id);

create index if not exists idx_bookings_student on public.bookings(student_id);
create index if not exists idx_bookings_tutor on public.bookings(tutor_id);
create index if not exists idx_bookings_status on public.bookings(status);
create index if not exists idx_bookings_scheduled on public.bookings(scheduled_start);
