-- Sessions: durable state so a display refresh rehydrates instantly.
-- The phone owns the row; the display only reads it. Realtime broadcast
-- channels (display:{code}, session:{id}) carry live updates and need no table.

create table if not exists public.sessions (
  id uuid primary key,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.sessions enable row level security;

-- Bones-phase policies: no auth exists yet, so anon can read/write sessions
-- keyed by unguessable uuid. Tightened when device identity lands (Phase 7).
create policy "anon read sessions" on public.sessions
  for select to anon using (true);
create policy "anon insert sessions" on public.sessions
  for insert to anon with check (true);
create policy "anon update sessions" on public.sessions
  for update to anon using (true) with check (true);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger sessions_touch
  before update on public.sessions
  for each row execute function public.touch_updated_at();

-- Clock-offset estimation: clients compare this to their local clock so
-- anchors derive against corrected time (STACK.md §3).
create or replace function public.server_time_ms()
returns double precision
language sql stable
as $$ select extract(epoch from clock_timestamp()) * 1000 $$;

grant execute on function public.server_time_ms() to anon;
