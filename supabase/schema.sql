create table if not exists games (
  id text primary key,
  st text not null default 'backlog',
  r int not null default 0,
  h int not null default 0,
  n text not null default '',
  c jsonb not null,
  created_at timestamptz not null default now()
);
alter table games enable row level security;
create policy "single user" on games for all to anon using (true) with check (true);
