-- Clinical documentation fields added for clinician action workflow
alter table public.encounters
  add column if not exists diagnosis   text,
  add column if not exists prescription text,
  add column if not exists referral     text;
