-- BAEBLADE ACADEMY — live sync table
-- Paste this whole file into Supabase → SQL Editor → New query → Run.

create table if not exists public.kv (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- Party-grade access: anyone with the site link can read and write.
-- Fine for a private party; don't reuse this setup for anything sensitive.
alter table public.kv enable row level security;
drop policy if exists "party read"   on public.kv;
drop policy if exists "party insert" on public.kv;
drop policy if exists "party update" on public.kv;
drop policy if exists "party delete" on public.kv;
create policy "party read"   on public.kv for select using (true);
create policy "party insert" on public.kv for insert with check (true);
create policy "party update" on public.kv for update using (true) with check (true);
create policy "party delete" on public.kv for delete using (true);

-- Real-time updates to every phone and the TV.
alter table public.kv replica identity full;
alter publication supabase_realtime add table public.kv;
