-- Vault Crawler Supabase schema (idempotent)
-- Apply with: npx supabase db query --linked -f server/supabase/live_schema.sql

create extension if not exists pgcrypto;

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  wallet_address text,
  auth_id text,
  nickname text not null default 'Vault Traveler',
  cvt_balance numeric(18,2) not null default 100.00,
  auth_provider text not null default 'metamask',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists accounts_wallet_address_key
  on public.accounts (lower(wallet_address))
  where wallet_address is not null and wallet_address <> '';

create unique index if not exists accounts_auth_id_key
  on public.accounts (auth_id)
  where auth_id is not null and auth_id <> '';

create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.accounts(id) on delete cascade,
  name text not null,
  class text not null,
  level integer not null default 1,
  health integer not null,
  attack integer not null,
  defense integer not null,
  name_color text,
  name_effect text,
  name_cost integer not null default 0,
  color_cost integer not null default 0,
  effect_cost integer not null default 0,
  class_cost integer not null default 0,
  is_trading boolean not null default false,
  trade_price numeric(18,2),
  trade_offered_by text,
  experience integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists characters_owner_id_idx
  on public.characters (owner_id);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  payment_method text not null check (payment_method in ('stripe', 'apple', 'google', 'crypto')),
  amount_usd numeric(18,2) not null check (amount_usd >= 0),
  vt_amount integer not null check (vt_amount >= 0),
  transaction_id text not null,
  status text not null default 'completed',
  created_at timestamptz not null default now()
);

create unique index if not exists purchases_transaction_id_key
  on public.purchases (transaction_id);

create index if not exists purchases_account_created_idx
  on public.purchases (account_id, created_at desc);

create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete cascade,
  from_wallet text not null,
  to_wallet text,
  price numeric(18,2) not null check (price > 0),
  status text not null default 'listing' check (status in ('listing', 'accepted', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trades_status_created_idx
  on public.trades (status, created_at desc);

create index if not exists trades_character_id_idx
  on public.trades (character_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_accounts_updated_at on public.accounts;
create trigger trg_accounts_updated_at
before update on public.accounts
for each row
execute function public.set_updated_at();

drop trigger if exists trg_characters_updated_at on public.characters;
create trigger trg_characters_updated_at
before update on public.characters
for each row
execute function public.set_updated_at();

drop trigger if exists trg_trades_updated_at on public.trades;
create trigger trg_trades_updated_at
before update on public.trades
for each row
execute function public.set_updated_at();

alter table public.accounts enable row level security;
alter table public.characters enable row level security;
alter table public.purchases enable row level security;
alter table public.trades enable row level security;

-- Keep public API access closed; backend should use service role key.
drop policy if exists accounts_deny_all on public.accounts;
create policy accounts_deny_all on public.accounts
for all to anon, authenticated
using (false)
with check (false);

drop policy if exists characters_deny_all on public.characters;
create policy characters_deny_all on public.characters
for all to anon, authenticated
using (false)
with check (false);

drop policy if exists purchases_deny_all on public.purchases;
create policy purchases_deny_all on public.purchases
for all to anon, authenticated
using (false)
with check (false);

drop policy if exists trades_deny_all on public.trades;
create policy trades_deny_all on public.trades
for all to anon, authenticated
using (false)
with check (false);
