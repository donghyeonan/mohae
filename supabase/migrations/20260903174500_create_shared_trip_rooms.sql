create extension if not exists pgcrypto with schema extensions;

create table public.mohae_trip_rooms (
  id uuid primary key default gen_random_uuid(),
  room_token_hash text not null unique,
  title text not null check (char_length(title) between 1 and 100),
  scene jsonb not null check (jsonb_typeof(scene) = 'object'),
  scene_revision integer not null default 1 check (scene_revision > 0),
  stage text not null default 'collecting' check (stage in ('collecting', 'proposed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

create table public.mohae_trip_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.mohae_trip_rooms(id) on delete cascade,
  member_token_hash text not null,
  display_name text not null check (char_length(display_name) between 1 and 40),
  role text not null default 'member' check (role in ('host', 'member')),
  ready boolean not null default false,
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (room_id, member_token_hash)
);

create table public.mohae_trip_events (
  id bigint generated always as identity primary key,
  room_id uuid not null references public.mohae_trip_rooms(id) on delete cascade,
  member_id uuid not null references public.mohae_trip_members(id) on delete cascade,
  event_type text not null check (event_type in ('choice', 'note')),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now()
);

create index mohae_trip_members_room_idx on public.mohae_trip_members (room_id, joined_at);
create index mohae_trip_events_room_idx on public.mohae_trip_events (room_id, id);
create index mohae_trip_events_member_idx on public.mohae_trip_events (member_id, id);

alter table public.mohae_trip_rooms enable row level security;
alter table public.mohae_trip_members enable row level security;
alter table public.mohae_trip_events enable row level security;

revoke all on public.mohae_trip_rooms from anon, authenticated;
revoke all on public.mohae_trip_members from anon, authenticated;
revoke all on public.mohae_trip_events from anon, authenticated;
revoke all on sequence public.mohae_trip_events_id_seq from anon, authenticated;

create or replace function public.mohae_trip_token_hash(p_token text)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select pg_catalog.encode(extensions.digest(p_token, 'sha256'), 'hex')
$$;

create or replace function public.mohae_trip_snapshot(p_room_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_room public.mohae_trip_rooms%rowtype;
  v_snapshot jsonb;
begin
  select * into v_room
  from public.mohae_trip_rooms
  where room_token_hash = public.mohae_trip_token_hash(p_room_token)
    and expires_at > pg_catalog.now();

  if not found then
    raise exception 'Trip room not found or expired.' using errcode = 'P0002';
  end if;

  select pg_catalog.jsonb_build_object(
    'room', pg_catalog.jsonb_build_object(
      'id', v_room.id,
      'title', v_room.title,
      'scene', v_room.scene,
      'sceneRevision', v_room.scene_revision,
      'stage', v_room.stage,
      'createdAt', v_room.created_at,
      'updatedAt', v_room.updated_at,
      'expiresAt', v_room.expires_at
    ),
    'members', coalesce((
      select pg_catalog.jsonb_agg(
        pg_catalog.jsonb_build_object(
          'id', member.id,
          'displayName', member.display_name,
          'role', member.role,
          'ready', member.ready,
          'joinedAt', member.joined_at
        ) order by member.joined_at
      )
      from public.mohae_trip_members as member
      where member.room_id = v_room.id
    ), '[]'::jsonb),
    'events', coalesce((
      select pg_catalog.jsonb_agg(event_record order by (event_record->>'id')::bigint)
      from (
        select pg_catalog.jsonb_build_object(
          'id', event.id,
          'memberId', event.member_id,
          'type', event.event_type,
          'payload', event.payload,
          'createdAt', event.created_at
        ) as event_record
        from public.mohae_trip_events as event
        where event.room_id = v_room.id
        order by event.id desc
        limit 500
      ) as recent_events
    ), '[]'::jsonb)
  ) into v_snapshot;

  return v_snapshot;
end;
$$;

create or replace function public.mohae_create_trip_room(
  p_room_token text,
  p_member_token text,
  p_display_name text,
  p_title text,
  p_scene jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_room_id uuid;
  v_member_id uuid;
  v_name text := pg_catalog.btrim(p_display_name);
  v_title text := pg_catalog.btrim(p_title);
begin
  if char_length(p_room_token) < 24 or char_length(p_room_token) > 160 then
    raise exception 'Invalid room token.' using errcode = '22023';
  end if;
  if char_length(p_member_token) < 24 or char_length(p_member_token) > 160 then
    raise exception 'Invalid member token.' using errcode = '22023';
  end if;
  if char_length(v_name) < 1 or char_length(v_name) > 40 then
    raise exception 'Display name must contain 1 to 40 characters.' using errcode = '22023';
  end if;
  if char_length(v_title) < 1 or char_length(v_title) > 100 then
    raise exception 'Room title must contain 1 to 100 characters.' using errcode = '22023';
  end if;
  if p_scene is null or pg_catalog.jsonb_typeof(p_scene) <> 'object'
    or pg_catalog.jsonb_typeof(p_scene->'candidates') <> 'array'
    or pg_catalog.jsonb_array_length(p_scene->'candidates') < 1 then
    raise exception 'A shared trip room requires a candidate scene.' using errcode = '22023';
  end if;

  insert into public.mohae_trip_rooms (room_token_hash, title, scene)
  values (public.mohae_trip_token_hash(p_room_token), v_title, p_scene)
  returning id into v_room_id;

  insert into public.mohae_trip_members (room_id, member_token_hash, display_name, role)
  values (v_room_id, public.mohae_trip_token_hash(p_member_token), v_name, 'host')
  returning id into v_member_id;

  return public.mohae_trip_snapshot(p_room_token)
    || pg_catalog.jsonb_build_object('currentMemberId', v_member_id);
end;
$$;

create or replace function public.mohae_join_trip_room(
  p_room_token text,
  p_member_token text,
  p_display_name text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_room_id uuid;
  v_member_id uuid;
  v_name text := pg_catalog.btrim(p_display_name);
begin
  if char_length(p_member_token) < 24 or char_length(p_member_token) > 160 then
    raise exception 'Invalid member token.' using errcode = '22023';
  end if;
  if char_length(v_name) < 1 or char_length(v_name) > 40 then
    raise exception 'Display name must contain 1 to 40 characters.' using errcode = '22023';
  end if;

  select id into v_room_id
  from public.mohae_trip_rooms
  where room_token_hash = public.mohae_trip_token_hash(p_room_token)
    and expires_at > pg_catalog.now();

  if not found then
    raise exception 'Trip room not found or expired.' using errcode = 'P0002';
  end if;

  select id into v_member_id
  from public.mohae_trip_members
  where room_id = v_room_id
    and member_token_hash = public.mohae_trip_token_hash(p_member_token);

  if found then
    update public.mohae_trip_members
    set display_name = v_name, updated_at = pg_catalog.now()
    where id = v_member_id;
  else
    if (select count(*) from public.mohae_trip_members where room_id = v_room_id) >= 8 then
      raise exception 'Trip room is full.' using errcode = '54000';
    end if;
    insert into public.mohae_trip_members (room_id, member_token_hash, display_name)
    values (v_room_id, public.mohae_trip_token_hash(p_member_token), v_name)
    returning id into v_member_id;
  end if;

  return public.mohae_trip_snapshot(p_room_token)
    || pg_catalog.jsonb_build_object('currentMemberId', v_member_id);
end;
$$;

create or replace function public.mohae_get_trip_room(p_room_token text)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select public.mohae_trip_snapshot(p_room_token)
$$;

create or replace function public.mohae_record_trip_choice(
  p_room_token text,
  p_member_token text,
  p_place_id text,
  p_place_title text,
  p_decision text,
  p_surface text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_room public.mohae_trip_rooms%rowtype;
  v_member_id uuid;
  v_place_id text := pg_catalog.btrim(p_place_id);
  v_place_title text := pg_catalog.btrim(p_place_title);
begin
  if p_decision not in ('saved', 'passed') then
    raise exception 'Decision must be saved or passed.' using errcode = '22023';
  end if;
  if p_surface not in ('card', 'detail', 'map') then
    raise exception 'Unknown choice surface.' using errcode = '22023';
  end if;
  if char_length(v_place_id) < 1 or char_length(v_place_id) > 180
    or char_length(v_place_title) < 1 or char_length(v_place_title) > 160 then
    raise exception 'Invalid place choice.' using errcode = '22023';
  end if;

  select * into v_room
  from public.mohae_trip_rooms
  where room_token_hash = public.mohae_trip_token_hash(p_room_token)
    and expires_at > pg_catalog.now();
  if not found then
    raise exception 'Trip room not found or expired.' using errcode = 'P0002';
  end if;

  select id into v_member_id
  from public.mohae_trip_members
  where room_id = v_room.id
    and member_token_hash = public.mohae_trip_token_hash(p_member_token);
  if not found then
    raise exception 'Join the trip room before choosing.' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from pg_catalog.jsonb_array_elements(v_room.scene->'candidates') as candidate
    where candidate->>'id' = v_place_id
  ) then
    raise exception 'Place is not in the current shared scene.' using errcode = '22023';
  end if;

  insert into public.mohae_trip_events (room_id, member_id, event_type, payload)
  values (v_room.id, v_member_id, 'choice', pg_catalog.jsonb_build_object(
    'placeId', v_place_id,
    'placeTitle', v_place_title,
    'decision', p_decision,
    'surface', p_surface,
    'sceneRevision', v_room.scene_revision
  ));

  update public.mohae_trip_rooms set updated_at = pg_catalog.now() where id = v_room.id;

  return public.mohae_trip_snapshot(p_room_token)
    || pg_catalog.jsonb_build_object('currentMemberId', v_member_id);
end;
$$;

create or replace function public.mohae_add_trip_note(
  p_room_token text,
  p_member_token text,
  p_text text,
  p_referenced_place_ids jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_room public.mohae_trip_rooms%rowtype;
  v_member_id uuid;
  v_text text := pg_catalog.btrim(p_text);
begin
  if char_length(v_text) < 1 or char_length(v_text) > 600 then
    raise exception 'Trip note must contain 1 to 600 characters.' using errcode = '22023';
  end if;
  if p_referenced_place_ids is null or pg_catalog.jsonb_typeof(p_referenced_place_ids) <> 'array'
    or pg_catalog.jsonb_array_length(p_referenced_place_ids) > 20 then
    raise exception 'referencedPlaceIds must be an array with at most 20 entries.' using errcode = '22023';
  end if;

  select * into v_room
  from public.mohae_trip_rooms
  where room_token_hash = public.mohae_trip_token_hash(p_room_token)
    and expires_at > pg_catalog.now();
  if not found then
    raise exception 'Trip room not found or expired.' using errcode = 'P0002';
  end if;

  select id into v_member_id
  from public.mohae_trip_members
  where room_id = v_room.id
    and member_token_hash = public.mohae_trip_token_hash(p_member_token);
  if not found then
    raise exception 'Join the trip room before adding context.' using errcode = '42501';
  end if;

  insert into public.mohae_trip_events (room_id, member_id, event_type, payload)
  values (v_room.id, v_member_id, 'note', pg_catalog.jsonb_build_object(
    'text', v_text,
    'referencedPlaceIds', p_referenced_place_ids,
    'sceneRevision', v_room.scene_revision
  ));

  update public.mohae_trip_rooms set updated_at = pg_catalog.now() where id = v_room.id;

  return public.mohae_trip_snapshot(p_room_token)
    || pg_catalog.jsonb_build_object('currentMemberId', v_member_id);
end;
$$;

create or replace function public.mohae_set_trip_ready(
  p_room_token text,
  p_member_token text,
  p_ready boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_room_id uuid;
  v_member_id uuid;
begin
  select id into v_room_id
  from public.mohae_trip_rooms
  where room_token_hash = public.mohae_trip_token_hash(p_room_token)
    and expires_at > pg_catalog.now();
  if not found then
    raise exception 'Trip room not found or expired.' using errcode = 'P0002';
  end if;

  select id into v_member_id
  from public.mohae_trip_members
  where room_id = v_room_id
    and member_token_hash = public.mohae_trip_token_hash(p_member_token);
  if not found then
    raise exception 'Join the trip room first.' using errcode = '42501';
  end if;

  update public.mohae_trip_members
  set ready = p_ready, updated_at = pg_catalog.now()
  where id = v_member_id;
  update public.mohae_trip_rooms set updated_at = pg_catalog.now() where id = v_room_id;

  return public.mohae_trip_snapshot(p_room_token)
    || pg_catalog.jsonb_build_object('currentMemberId', v_member_id);
end;
$$;

create or replace function public.mohae_publish_trip_scene(
  p_room_token text,
  p_member_token text,
  p_scene jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_room_id uuid;
  v_member_id uuid;
begin
  if p_scene is null or pg_catalog.jsonb_typeof(p_scene) <> 'object'
    or pg_catalog.jsonb_typeof(p_scene->'candidates') <> 'array'
    or pg_catalog.jsonb_array_length(p_scene->'candidates') < 1 then
    raise exception 'A shared scene requires candidates.' using errcode = '22023';
  end if;

  select id into v_room_id
  from public.mohae_trip_rooms
  where room_token_hash = public.mohae_trip_token_hash(p_room_token)
    and expires_at > pg_catalog.now();
  if not found then
    raise exception 'Trip room not found or expired.' using errcode = 'P0002';
  end if;

  select id into v_member_id
  from public.mohae_trip_members
  where room_id = v_room_id
    and member_token_hash = public.mohae_trip_token_hash(p_member_token)
    and role = 'host';
  if not found then
    raise exception 'Only the host can publish a shared scene.' using errcode = '42501';
  end if;

  update public.mohae_trip_rooms
  set scene = p_scene,
      title = left(coalesce(nullif(pg_catalog.btrim(p_scene->>'title'), ''), title), 100),
      scene_revision = scene_revision + 1,
      stage = 'proposed',
      updated_at = pg_catalog.now()
  where id = v_room_id;

  return public.mohae_trip_snapshot(p_room_token)
    || pg_catalog.jsonb_build_object('currentMemberId', v_member_id);
end;
$$;

revoke all on function public.mohae_trip_token_hash(text) from public;
revoke all on function public.mohae_trip_snapshot(text) from public;
revoke all on function public.mohae_create_trip_room(text, text, text, text, jsonb) from public;
revoke all on function public.mohae_join_trip_room(text, text, text) from public;
revoke all on function public.mohae_get_trip_room(text) from public;
revoke all on function public.mohae_record_trip_choice(text, text, text, text, text, text) from public;
revoke all on function public.mohae_add_trip_note(text, text, text, jsonb) from public;
revoke all on function public.mohae_set_trip_ready(text, text, boolean) from public;
revoke all on function public.mohae_publish_trip_scene(text, text, jsonb) from public;

grant execute on function public.mohae_create_trip_room(text, text, text, text, jsonb) to anon, authenticated;
grant execute on function public.mohae_join_trip_room(text, text, text) to anon, authenticated;
grant execute on function public.mohae_get_trip_room(text) to anon, authenticated;
grant execute on function public.mohae_record_trip_choice(text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.mohae_add_trip_note(text, text, text, jsonb) to anon, authenticated;
grant execute on function public.mohae_set_trip_ready(text, text, boolean) to anon, authenticated;
grant execute on function public.mohae_publish_trip_scene(text, text, jsonb) to anon, authenticated;
