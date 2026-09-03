alter table public.mohae_source_entries
  add column explore_payload jsonb;

alter table public.mohae_source_entries
  add constraint mohae_source_entries_explore_payload_object
  check (explore_payload is null or jsonb_typeof(explore_payload) = 'object');
