-- Prerequisites:
-- 1. Create the public `space-assets` bucket in Supabase Storage.
-- 2. Review existing storage.objects policies first; permissive RLS policies combine with OR.
-- Public bucket downloads are public. Listing and all writes remain owner-only.

do $migration$
begin
  if not exists (
    select 1
    from storage.buckets
    where id = 'space-assets'
      and public = true
  ) then
    raise exception 'Create the public space-assets bucket before applying this migration.';
  end if;
end;
$migration$;

drop policy if exists space_assets_owner_select on storage.objects;
create policy space_assets_owner_select
on storage.objects
for select
to authenticated
using (
  bucket_id = 'space-assets'
  and (select public.is_owner())
);

drop policy if exists space_assets_owner_insert on storage.objects;
create policy space_assets_owner_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'space-assets'
  and (select public.is_owner())
);

drop policy if exists space_assets_owner_update on storage.objects;
create policy space_assets_owner_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'space-assets'
  and (select public.is_owner())
)
with check (
  bucket_id = 'space-assets'
  and (select public.is_owner())
);

drop policy if exists space_assets_owner_delete on storage.objects;
create policy space_assets_owner_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'space-assets'
  and (select public.is_owner())
);
