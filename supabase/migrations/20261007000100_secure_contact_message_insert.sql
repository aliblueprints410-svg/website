-- Keep public message submissions limited to the fields accepted by the
-- validated anon INSERT policy. Do not permit table-wide INSERT.

drop policy if exists messages_public_insert on public.messages;

grant insert (name, contact, subject, message)
  on table public.messages to anon;
