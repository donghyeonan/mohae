alter table public.mohae_source_entries
  add constraint mohae_source_entries_admitted_requires_explore_payload
  check (admission_status <> 'admitted' or explore_payload is not null)
  not valid;

alter table public.mohae_source_entries
  validate constraint mohae_source_entries_admitted_requires_explore_payload;
