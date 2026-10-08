-- Add fields used by the existing public app/post cards and detail pages.
-- Existing RLS policies continue to control row access.

alter table public.apps
  add column if not exists icon text not null default '',
  add column if not exists catalog_description text not null default '',
  add column if not exists price_label text,
  add column if not exists is_demo boolean not null default false;

alter table public.posts
  add column if not exists excerpt text not null default '',
  add column if not exists kind_label text not null default '',
  add column if not exists visual_title text,
  add column if not exists visual_subtitle text,
  add column if not exists visual_variant text,
  add column if not exists related_app_slug text,
  add column if not exists related_app_label text,
  add column if not exists is_demo boolean not null default false;
