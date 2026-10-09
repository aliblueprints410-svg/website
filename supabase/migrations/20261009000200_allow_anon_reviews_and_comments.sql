-- ==============================================================================
-- Migration: 20261009000200_allow_anon_reviews_and_comments.sql
-- Description: Allow all visitors (unauthenticated/anonymous) to submit reviews,
--              comments, and sync likes across all devices.
-- ==============================================================================

-- 1. Allow anonymous visitors to insert reviews without user_id
alter table public.app_reviews alter column user_id drop not null;
alter table public.app_reviews drop constraint if exists app_reviews_app_user_unique;

grant select, insert on public.app_reviews to anon, authenticated;

drop policy if exists app_reviews_anon_insert on public.app_reviews;
create policy app_reviews_anon_insert
  on public.app_reviews
  for insert
  to anon, authenticated
  with check (
    rating between 1 and 5
    and char_length(trim(review_text)) > 0
  );

-- 2. Allow anonymous visitors to insert post comments without user_id
alter table public.post_comments alter column user_id drop not null;

grant select, insert on public.post_comments to anon, authenticated;

drop policy if exists post_comments_anon_insert on public.post_comments;
create policy post_comments_anon_insert
  on public.post_comments
  for insert
  to anon, authenticated
  with check (
    char_length(trim(comment_text)) > 0
  );

-- 3. Create post_likes table to sync likes across all visitors and browsers
create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  visitor_id text not null,
  created_at timestamptz not null default now(),
  constraint post_likes_unique unique (post_id, visitor_id)
);

alter table public.post_likes enable row level security;
grant select, insert, delete on public.post_likes to anon, authenticated;

drop policy if exists post_likes_select on public.post_likes;
create policy post_likes_select
  on public.post_likes
  for select
  to anon, authenticated
  using (true);

drop policy if exists post_likes_insert on public.post_likes;
create policy post_likes_insert
  on public.post_likes
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists post_likes_delete on public.post_likes;
create policy post_likes_delete
  on public.post_likes
  for delete
  to anon, authenticated
  using (true);
