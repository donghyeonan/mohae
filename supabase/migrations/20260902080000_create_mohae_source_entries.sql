create table public.mohae_source_entries (
  id text primary key,
  source_index_position integer not null unique check (source_index_position >= 0),
  admission_status text not null check (admission_status in ('admitted', 'enrichment_required', 'hold')),
  matched_explore_id text,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now()
);

create index mohae_source_entries_status_position_idx
  on public.mohae_source_entries (admission_status, source_index_position);

alter table public.mohae_source_entries enable row level security;

create policy "public can read mohae source entries"
  on public.mohae_source_entries
  for select
  to anon, authenticated
  using (true);

grant select on public.mohae_source_entries to anon, authenticated;
revoke insert, update, delete on public.mohae_source_entries from anon, authenticated;
