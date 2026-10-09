-- ==============================================================================
-- Migration: 20261009000200_allow_anon_reviews_and_comments.sql
-- Description: Allow all visitors (unauthenticated/anonymous) to submit reviews and comments
-- ==============================================================================

-- 1. Relax user_id not null requirement for anonymous visitors
alter table public.app_reviews alter column user_id drop not null;
alter table public.app_reviews drop constraint if exists app_reviews_app_user_unique;

alter table public.post_comments alter column user_id drop not null;

-- 2. Grant insert permissions to anonymous role (anon)
grant select, insert on public.app_reviews to anon;
grant select, insert on public.post_comments to anon;

-- 3. RLS policy to allow anonymous visitors to insert app reviews
drop policy if exists app_reviews_anon_insert on public.app_reviews;
create policy app_reviews_anon_insert
  on public.app_reviews
  for insert
  to anon
  with check (
    rating between 1 and 5
    and char_length(trim(review_text)) > 0
  );

-- 4. RLS policy to allow anonymous visitors to insert post comments
drop policy if exists post_comments_anon_insert on public.post_comments;
create policy post_comments_anon_insert
  on public.post_comments
  for insert
  to anon
  with check (
    char_length(trim(comment_text)) > 0
  );
