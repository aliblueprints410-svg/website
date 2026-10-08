-- Enforce a project-wide cap of 20 accepted contact messages per hour.
-- The window starts with the first accepted message and resets one hour later.

create schema if not exists private;

create table if not exists private.contact_message_rate_limit (
  bucket text primary key check (bucket = 'global'),
  window_started_at timestamptz not null,
  message_count integer not null check (message_count >= 0)
);

alter table private.contact_message_rate_limit enable row level security;
revoke all on table private.contact_message_rate_limit
  from public, anon, authenticated, service_role;

create or replace function private.enforce_contact_message_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  current_time_utc timestamptz := pg_catalog.clock_timestamp();
  accepted_count integer;
begin
  insert into private.contact_message_rate_limit as rate_window (
    bucket,
    window_started_at,
    message_count
  )
  values ('global', current_time_utc, 1)
  on conflict (bucket) do update
  set
    window_started_at = case
      when rate_window.window_started_at <= current_time_utc - interval '1 hour'
        then current_time_utc
      else rate_window.window_started_at
    end,
    message_count = case
      when rate_window.window_started_at <= current_time_utc - interval '1 hour'
        then 1
      else rate_window.message_count + 1
    end
  returning message_count into accepted_count;

  if accepted_count > 20 then
    raise exception using
      errcode = 'P0001',
      message = 'too_many_messages';
  end if;

  return new;
end;
$function$;

revoke all on function private.enforce_contact_message_rate_limit()
  from public, anon, authenticated, service_role;

drop trigger if exists enforce_contact_message_rate_limit
  on public.messages;

create trigger enforce_contact_message_rate_limit
before insert on public.messages
for each row
execute function private.enforce_contact_message_rate_limit();
