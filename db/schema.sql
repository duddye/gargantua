-- =========================================================
-- GARGANTUA — schema del diario (v2, terza forma normale)
-- Idempotente: si può rilanciare senza perdere dati
-- (npm run db:init).
--
-- Tabelle di riferimento (lookup): persone, bande, stati_voce,
--   stati_missione, livelli_umore, emozioni
-- Entità: voci (bacheca), pensieri, missioni, messaggi, rilevazioni
-- Ponte (molti-a-molti): rilevazione_emozioni
--
-- per_persona NULL  = Entangled (insieme)
-- per_persona 'jo'  = in orbita di Jo (solo per Jo), ecc.
-- =========================================================

begin;

-- ---------------------------------------------------------
-- TABELLE DI RIFERIMENTO
-- ---------------------------------------------------------

create table if not exists persone (
  codice text primary key check (codice ~ '^[a-z]+$'),
  nome   text not null unique
);

insert into persone (codice, nome) values
  ('jo', 'Jo'),
  ('alix', 'Alix')
on conflict (codice) do update set nome = excluded.nome;

-- Bande: le categorie della bacheca
create table if not exists bande (
  codice    text primary key,
  etichetta text not null unique,
  simbolo   text not null,
  ordine    smallint not null
);

insert into bande (codice, etichetta, simbolo, ordine) values
  ('film',    'Film',                  '◎', 1),
  ('serie',   'Serie TV',              '◉', 2),
  ('libri',   'Libri',                 '✶', 3),
  ('piatti',  'Piatti e ricette',      '◍', 4),
  ('viaggi',  'Viaggi',                '➚', 5),
  ('uscite',  'Uscite e appuntamenti', '✧', 6),
  ('musica',  'Musica',                '♫', 7),
  ('giochi',  'Giochi',                '◈', 8),
  ('casa',    'Casa',                  '⌂', 9),
  ('regali',  'Regali',                '✦', 10),
  ('ricordi', 'Ricordi',               '☾', 11),
  ('sogni',   'Sogni e desideri',      '☆', 12),
  ('altro',   'Altro',                 '·', 13)
on conflict (codice) do update
  set etichetta = excluded.etichetta,
      simbolo   = excluded.simbolo,
      ordine    = excluded.ordine;

create table if not exists stati_voce (
  codice    text primary key,
  etichetta text not null unique,
  ordine    smallint not null
);

insert into stati_voce (codice, etichetta, ordine) values
  ('nebulosa',  'Nebulosa · in attesa', 1),
  ('fusione',   'In fusione · in corso', 2),
  ('supernova', 'Supernova · fatto',     3)
on conflict (codice) do update
  set etichetta = excluded.etichetta, ordine = excluded.ordine;

create table if not exists stati_missione (
  codice    text primary key,
  etichetta text not null unique,
  ordine    smallint not null
);

insert into stati_missione (codice, etichetta, ordine) values
  ('progettazione', 'In progettazione',       1),
  ('in_volo',       'In volo · in corso',     2),
  ('atterrata',     'Atterrata · completata', 3)
on conflict (codice) do update
  set etichetta = excluded.etichetta, ordine = excluded.ordine;

-- Umore: 1 (peggiore) → 5 (migliore)
create table if not exists livelli_umore (
  valore      smallint primary key check (valore between 1 and 5),
  nome        text not null unique,
  descrizione text not null
);

insert into livelli_umore (valore, nome, descrizione) values
  (1, 'Buco nero',  'pessimo'),
  (2, 'Nana bruna', 'giù'),
  (3, 'Nebulosa',   'così così'),
  (4, 'Stella',     'bene'),
  (5, 'Supernova',  'benissimo')
on conflict (valore) do update
  set nome = excluded.nome, descrizione = excluded.descrizione;

create table if not exists emozioni (
  codice    text primary key,
  etichetta text not null unique,
  ordine    smallint not null
);

insert into emozioni (codice, etichetta, ordine) values
  ('felice',     'Felice',      1),
  ('calma',      'Calma',       2),
  ('grata',      'Gratitudine', 3),
  ('innamorata', 'Innamorata',  4),
  ('energica',   'Carica',      5),
  ('ansiosa',    'Ansia',       6),
  ('triste',     'Tristezza',   7),
  ('arrabbiata', 'Rabbia',      8),
  ('stanca',     'Stanchezza',  9),
  ('stressata',  'Stress',      10),
  ('sola',       'Solitudine',  11),
  ('annoiata',   'Noia',        12)
on conflict (codice) do update
  set etichetta = excluded.etichetta, ordine = excluded.ordine;

-- ---------------------------------------------------------
-- ENTITÀ
-- ---------------------------------------------------------

-- Bacheca: tutto ciò che vogliamo vedere, leggere, cucinare, fare…
create table if not exists voci (
  id            bigint generated always as identity primary key,
  banda         text not null references bande (codice),
  titolo        text not null check (length(titolo) between 1 and 300),
  dettaglio     text check (length(dettaglio) <= 200),   -- autore, regia, luogo…
  anno          smallint check (anno between 1000 and 2100),
  note          text check (length(note) <= 5000),
  stato         text not null default 'nebulosa' references stati_voce (codice),
  voto          smallint check (voto between 1 and 5),
  per_persona   text references persone (codice),
  aggiunta_da   text not null references persone (codice),
  creato_il     timestamptz not null default now(),
  modificato_il timestamptz
);

create index if not exists voci_banda_idx on voci (banda);
create index if not exists voci_stato_idx on voci (stato);
create index if not exists voci_per_persona_idx on voci (per_persona);

-- Materia oscura: pensieri filosofici e idee strane
create table if not exists pensieri (
  id            bigint generated always as identity primary key,
  testo         text not null check (length(testo) between 1 and 5000),
  autore        text not null references persone (codice),
  per_persona   text references persone (codice),
  creato_il     timestamptz not null default now(),
  modificato_il timestamptz
);

-- Missioni: progetti
create table if not exists missioni (
  id            bigint generated always as identity primary key,
  titolo        text not null check (length(titolo) between 1 and 300),
  descrizione   text check (length(descrizione) <= 5000),
  stato         text not null default 'progettazione' references stati_missione (codice),
  lancio        date,
  per_persona   text references persone (codice),
  aggiunta_da   text not null references persone (codice),
  creato_il     timestamptz not null default now(),
  modificato_il timestamptz
);

-- Singolarità: messaggini tra Jo e Alix
create table if not exists messaggi (
  id         bigint generated always as identity primary key,
  mittente   text not null references persone (codice),
  testo      text not null check (length(testo) between 1 and 2000),
  inviato_il timestamptz not null default now()
);

create index if not exists messaggi_inviato_idx on messaggi (inviato_il desc);

-- Telemetria: diario dell'umore e dei parametri vitali
create table if not exists rilevazioni (
  id               bigint generated always as identity primary key,
  persona          text not null references persone (codice),
  giorno           date not null default current_date,
  umore            smallint not null references livelli_umore (valore),
  energia          smallint check (energia between 1 and 5),
  stress           smallint check (stress between 1 and 5),
  benessere_fisico smallint check (benessere_fisico between 1 and 5),
  sonno_ore        numeric(3, 1) check (sonno_ore between 0 and 24),
  causa            text check (length(causa) <= 2000),
  creato_il        timestamptz not null default now(),
  modificato_il    timestamptz
);

create index if not exists rilevazioni_persona_giorno_idx
  on rilevazioni (persona, giorno desc);

create table if not exists rilevazione_emozioni (
  rilevazione_id bigint not null references rilevazioni (id) on delete cascade,
  emozione       text not null references emozioni (codice),
  primary key (rilevazione_id, emozione)
);

-- ---------------------------------------------------------
-- IDENTIFICAZIONE (v3)
-- ---------------------------------------------------------

-- Chiave personale: hash scrypt + sale, mai la chiave in chiaro.
-- Si imposta con: npm run chiave -- jo   (poi si cambia da /profilo)
create table if not exists chiavi (
  persona       text primary key references persone (codice) on delete cascade,
  sale          bytea not null,
  hash          bytea not null,
  modificata_il timestamptz not null default now()
);

-- Sessioni: nel cookie c'è un token casuale, qui solo il suo hash
create table if not exists sessioni (
  token_hash text primary key,
  persona    text not null references persone (codice) on delete cascade,
  creata_il  timestamptz not null default now(),
  scade_il   timestamptz not null
);

create index if not exists sessioni_scadenza_idx on sessioni (scade_il);

-- Contatore: le parole provate al cancello della rima
create table if not exists parole_accesso (
  id       bigint generated always as identity primary key,
  parola   text not null check (length(parola) between 1 and 100),
  persona  text not null references persone (codice),
  riuscita boolean not null,
  usata_il timestamptz not null default now()
);

create index if not exists parole_accesso_usata_idx on parole_accesso (usata_il desc);

-- ---------------------------------------------------------
-- MIGRAZIONE DALLA v1
-- La vecchia bacheca "segnali" diventa la nuova bacheca "voci".
-- Le tabelle v1 si eliminano solo se vuote (film, libri, pensieri,
-- missioni v1 avevano colonne diverse).
-- ---------------------------------------------------------

do $$
declare
  vecchia_persona constant jsonb := '{"a": "jo", "b": "alix"}';
begin
  -- segnali (v1) → voci
  if to_regclass('public.segnali') is not null then
    insert into voci (banda, titolo, per_persona, aggiunta_da, creato_il, modificato_il)
    select coalesce(s.banda, 'altro'),
           left(s.testo, 300),
           case when s.orbita = 'entangled' then null
                else vecchia_persona ->> s.orbita end,
           vecchia_persona ->> s.autore,
           s.creato_il,
           s.modificato_il
    from segnali s
    where s.banda is null or s.banda in (select codice from bande);

    drop table segnali;
  end if;

  if to_regclass('public.film') is not null then
    if not exists (select 1 from film) then
      drop table film;
    end if;
  end if;

  if to_regclass('public.libri') is not null then
    if not exists (select 1 from libri) then
      drop table libri;
    end if;
  end if;

  -- pensieri/missioni v1 usavano la colonna "orbita": ricreale se vuote
  if exists (select 1 from information_schema.columns
             where table_name = 'pensieri' and column_name = 'orbita') then
    if exists (select 1 from pensieri) then
      raise exception 'pensieri v1 contiene dati: migrare a mano';
    end if;
    drop table pensieri;
    create table pensieri (
      id            bigint generated always as identity primary key,
      testo         text not null check (length(testo) between 1 and 5000),
      autore        text not null references persone (codice),
      per_persona   text references persone (codice),
      creato_il     timestamptz not null default now(),
      modificato_il timestamptz
    );
  end if;

  if exists (select 1 from information_schema.columns
             where table_name = 'missioni' and column_name = 'orbita') then
    if exists (select 1 from missioni) then
      raise exception 'missioni v1 contiene dati: migrare a mano';
    end if;
    drop table missioni;
    create table missioni (
      id            bigint generated always as identity primary key,
      titolo        text not null check (length(titolo) between 1 and 300),
      descrizione   text check (length(descrizione) <= 5000),
      stato         text not null default 'progettazione' references stati_missione (codice),
      lancio        date,
      per_persona   text references persone (codice),
      aggiunta_da   text not null references persone (codice),
      creato_il     timestamptz not null default now(),
      modificato_il timestamptz
    );
  end if;
end
$$;

commit;
