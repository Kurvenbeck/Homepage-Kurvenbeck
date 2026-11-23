-- Auswertung (Phase 1): anonyme Statistik-Aggregate VOR der Löschung der Bestellungen.
--
-- Hintergrund: backstube_orders wird 7 Tage nach dem Backtag gelöscht (Cron
-- `delete-old-backstube-orders`, 03:15). Damit Verläufe/Vergleiche möglich sind,
-- schreibt `snapshot_backstube_orders()` (Cron 03:05, also davor) pro Backtag
-- anonyme Zahlen weg: KEIN Name, KEINE E-Mail, KEINE Telefonnummer, KEINE Notiz,
-- keine Bestell-ID, keine Einzelzeitpunkte (nur Zähler je Wochentag/Stunde).
-- Anonyme Aggregate fallen nicht unter die Löschpflicht (Datenschutzerklärung
-- bekommt dazu einen Satz).
--
-- Sicherheit: alle Tabellen NUR Admin lesbar (is_admin()), kein anon, kein
-- Schreiben aus der App — nur die security-definer-Funktion schreibt.
-- Idempotent: pro Backtag wird der vollständige Stand überschrieben.

-- ---------------------------------------------------------------------------
-- Tabellen
-- ---------------------------------------------------------------------------

create table public.backtag_stats_day (
  backtag_date  date primary key,
  orders_count  int           not null,
  items_count   int           not null,   -- Stück gesamt
  revenue       numeric(10,2) not null,
  -- Bestellungen je Wochentag+Stunde (Berliner Zeit): {"<isodow 1-7>_<stunde 0-23>": anzahl}
  slots         jsonb         not null default '{}'::jsonb,
  -- Bestellungen je Vorlauf in Tagen vor dem Backtag (0 = am Backtag selbst, 7 = 7+ Tage): {"0": n, …}
  lead_days     jsonb         not null default '{}'::jsonb,
  snapshot_at   timestamptz   not null default now()
);

create table public.backtag_stats_item (
  backtag_date  date          not null references public.backtag_stats_day(backtag_date) on delete cascade,
  menu_item_id  text          not null,   -- Menü-ID als Text (Backware kann später gelöscht sein)
  name          text          not null,   -- Name zum Bestellzeitpunkt
  qty           int           not null,
  revenue       numeric(10,2) not null,
  orders_count  int           not null,   -- in wie vielen Bestellungen enthalten
  primary key (backtag_date, menu_item_id)
);

create table public.backtag_stats_pair (
  backtag_date  date not null references public.backtag_stats_day(backtag_date) on delete cascade,
  item_a        text not null,
  item_b        text not null,
  orders_count  int  not null,            -- Bestellungen, in denen beide vorkamen
  primary key (backtag_date, item_a, item_b),
  check (item_a < item_b)
);

grant select on public.backtag_stats_day, public.backtag_stats_item, public.backtag_stats_pair
  to authenticated;

alter table public.backtag_stats_day  enable row level security;
alter table public.backtag_stats_item enable row level security;
alter table public.backtag_stats_pair enable row level security;

create policy "backtag_stats_day_admin_read" on public.backtag_stats_day
  for select to authenticated using (public.is_admin());
create policy "backtag_stats_item_admin_read" on public.backtag_stats_item
  for select to authenticated using (public.is_admin());
create policy "backtag_stats_pair_admin_read" on public.backtag_stats_pair
  for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Snapshot-Funktion
-- ---------------------------------------------------------------------------

create or replace function public.snapshot_backstube_orders()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  d date;
begin
  for d in
    select distinct coalesce(backtag_date, created_at::date)
    from public.backstube_orders
    where coalesce(backtag_date, created_at::date) < current_date
  loop
    -- Tagesstand (überschreibt)
    insert into public.backtag_stats_day as s
      (backtag_date, orders_count, items_count, revenue, slots, lead_days, snapshot_at)
    select
      d,
      count(*),
      coalesce(sum(q.qty), 0),
      coalesce(sum(o.total), 0),
      coalesce((
        select jsonb_object_agg(k, c) from (
          select extract(isodow from o2.created_at at time zone 'Europe/Berlin')::int
                 || '_' || extract(hour from o2.created_at at time zone 'Europe/Berlin')::int as k,
                 count(*) as c
          from public.backstube_orders o2
          where coalesce(o2.backtag_date, o2.created_at::date) = d
          group by 1
        ) x
      ), '{}'::jsonb),
      coalesce((
        select jsonb_object_agg(k, c) from (
          select least(7, greatest(0, d - (o3.created_at at time zone 'Europe/Berlin')::date))::text as k,
                 count(*) as c
          from public.backstube_orders o3
          where coalesce(o3.backtag_date, o3.created_at::date) = d
          group by 1
        ) y
      ), '{}'::jsonb),
      now()
    from public.backstube_orders o
    left join lateral (
      select sum((e->>'qty')::int) as qty from jsonb_array_elements(o.items) e
    ) q on true
    where coalesce(o.backtag_date, o.created_at::date) = d
    on conflict (backtag_date) do update set
      orders_count = excluded.orders_count,
      items_count  = excluded.items_count,
      revenue      = excluded.revenue,
      slots        = excluded.slots,
      lead_days    = excluded.lead_days,
      snapshot_at  = excluded.snapshot_at;

    -- Backwaren (überschreibt: erst leeren, dann neu schreiben)
    delete from public.backtag_stats_item where backtag_date = d;
    insert into public.backtag_stats_item (backtag_date, menu_item_id, name, qty, revenue, orders_count)
    select d,
           e->>'id',
           max(e->>'name'),
           sum((e->>'qty')::int),
           sum((e->>'qty')::int * (e->>'unitPrice')::numeric),
           count(distinct o.id)
    from public.backstube_orders o, jsonb_array_elements(o.items) e
    where coalesce(o.backtag_date, o.created_at::date) = d
    group by e->>'id';

    -- „Zusammen bestellt“ (Paare je Bestellung, ohne Bestellbezug)
    delete from public.backtag_stats_pair where backtag_date = d;
    insert into public.backtag_stats_pair (backtag_date, item_a, item_b, orders_count)
    select d, a.id, b.id, count(*)
    from (
      select o.id as oid, e->>'id' as id
      from public.backstube_orders o, jsonb_array_elements(o.items) e
      where coalesce(o.backtag_date, o.created_at::date) = d
      group by o.id, e->>'id'
    ) a
    join (
      select o.id as oid, e->>'id' as id
      from public.backstube_orders o, jsonb_array_elements(o.items) e
      where coalesce(o.backtag_date, o.created_at::date) = d
      group by o.id, e->>'id'
    ) b on a.oid = b.oid and a.id < b.id
    group by a.id, b.id;
  end loop;
end;
$$;

-- Nur der Cron-Job (postgres) darf die Funktion ausführen — nicht anon/authenticated.
revoke all on function public.snapshot_backstube_orders() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Cron: 03:05 — VOR dem Löschjob (03:15)
-- ---------------------------------------------------------------------------

create extension if not exists pg_cron;

select cron.schedule(
  'snapshot-backstube-orders',
  '5 3 * * *',
  $$ select public.snapshot_backstube_orders() $$
);

-- Erstlauf: schreibt sofort alle vergangenen Backtage, deren Bestellungen noch da sind.
select public.snapshot_backstube_orders();
