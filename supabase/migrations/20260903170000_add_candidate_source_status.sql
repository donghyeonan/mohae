alter table public.mohae_source_entries
  drop constraint mohae_source_entries_admission_status_check;

alter table public.mohae_source_entries
  add constraint mohae_source_entries_admission_status_check
  check (admission_status in ('admitted', 'candidate', 'enrichment_required', 'hold'));

alter table public.mohae_source_entries
  drop constraint mohae_source_entries_admitted_requires_explore_payload;

alter table public.mohae_source_entries
  add constraint mohae_source_entries_recommendable_requires_explore_payload
  check (admission_status not in ('admitted', 'candidate') or explore_payload is not null);
