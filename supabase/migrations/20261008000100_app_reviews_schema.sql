-- ==============================================================================
-- Migration: 20261008000100_app_reviews_schema.sql
-- Description: Interactive visitor ratings & reviews for apps + post comments
-- ==============================================================================

-- 1. App Reviews Table
create table if not exists public.app_reviews (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  user_id uuid not null default auth.uid(),
  user_name text not null default 'زائر',
  rating smallint not null check (rating >= 1 and rating <= 5),
  review_text text not null check (char_length(trim(review_text)) > 0 and char_length(review_text) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint app_reviews_app_user_unique unique (app_id, user_id)
);

create index if not exists idx_app_reviews_app_id on public.app_reviews(app_id);
create index if not exists idx_app_reviews_created_at on public.app_reviews(created_at desc);

-- 2. Post Comments Table
create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null default auth.uid(),
  user_name text not null default 'زائر',
  comment_text text not null check (char_length(trim(comment_text)) > 0 and char_length(comment_text) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_post_comments_post_id on public.post_comments(post_id);
create index if not exists idx_post_comments_created_at on public.post_comments(created_at desc);

-- 3. Enable Row Level Security (RLS)
alter table public.app_reviews enable row level security;
alter table public.post_comments enable row level security;

-- 4. RLS Policies for App Reviews
drop policy if exists app_reviews_public_select on public.app_reviews;
create policy app_reviews_public_select
  on public.app_reviews
  for select
  to public
  using (true);

drop policy if exists app_reviews_auth_insert on public.app_reviews;
create policy app_reviews_auth_insert
  on public.app_reviews
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and rating between 1 and 5
  );

drop policy if exists app_reviews_auth_update on public.app_reviews;
create policy app_reviews_auth_update
  on public.app_reviews
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists app_reviews_auth_delete on public.app_reviews;
create policy app_reviews_auth_delete
  on public.app_reviews
  for delete
  to authenticated
  using (auth.uid() = user_id or (select public.is_owner()));

-- 5. RLS Policies for Post Comments
drop policy if exists post_comments_public_select on public.post_comments;
create policy post_comments_public_select
  on public.post_comments
  for select
  to public
  using (true);

drop policy if exists post_comments_auth_insert on public.post_comments;
create policy post_comments_auth_insert
  on public.post_comments
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists post_comments_auth_delete on public.post_comments;
create policy post_comments_auth_delete
  on public.post_comments
  for delete
  to authenticated
  using (auth.uid() = user_id or (select public.is_owner()));

-- 6. Ratings Summary View
create or replace view public.app_ratings_summary as
select
  app_id,
  count(*)::int as total_reviews,
  round(avg(rating)::numeric, 1) as average_rating
from public.app_reviews
group by app_id;

-- 7. Grant Permissions
grant select on public.app_reviews to anon, authenticated;
grant insert, update, delete on public.app_reviews to authenticated;

grant select on public.post_comments to anon, authenticated;
grant insert, update, delete on public.post_comments to authenticated;

grant select on public.app_ratings_summary to anon, authenticated;
