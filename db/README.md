# Database locale — guida all'accesso

Postgres gira in un container Docker chiamato `gargantua-pg`.
Lo schema è in [schema.sql](schema.sql) e si applica con `npm run db:init`.

## Dati di connessione

| Parametro | Valore |
|---|---|
| Host | `127.0.0.1` |
| Porta | `5433` (non la solita 5432) |
| Database | `diario` |
| Utente | `gargantua` |
| Password | `orizzonte-locale` |
| URL completo | `postgres://gargantua:orizzonte-locale@127.0.0.1:5433/diario` |

L'URL è anche in `.env.local` come `DATABASE_URL`.

## 1. Accendere e spegnere il container

Dopo un riavvio del PC il container non riparte da solo. Prima di usare il sito o il database:

```bash
docker start gargantua-pg      # accende
docker ps                      # controlla: deve comparire gargantua-pg
docker stop gargantua-pg       # spegne (i dati restano)
```

Per farlo ripartire sempre in automatico:

```bash
docker update --restart unless-stopped gargantua-pg
```

## 2. Entrare con il terminale (psql)

```bash
docker exec -it gargantua-pg psql -U gargantua -d diario
```

Il prompt diventa `diario=#`. Comandi utili dentro psql:

| Comando | Cosa fa |
|---|---|
| `\dt` | elenca le tabelle |
| `\d film` | mostra le colonne di una tabella |
| `\x` | attiva o disattiva la vista "a schede", comoda per testi lunghi |
| `\q` | esce |

Le query SQL finiscono con `;`:

```sql
select * from film;
select titolo, stato from libri where orbita = 'entangled';
select testo, banda, creato_il from segnali order by creato_il desc limit 10;
update film set stato = 'osservato' where id = 3;
delete from pensieri where id = 7;
```

Per lanciare una sola query senza entrare:

```bash
docker exec gargantua-pg psql -U gargantua -d diario -c "select * from missioni;"
```

## 3. Entrare con un programma grafico

Con un client come **DBeaver** (`sudo pacman -S dbeaver`), **pgAdmin** o **TablePlus**: crea una nuova connessione PostgreSQL e inserisci i dati della tabella in alto. Da lì puoi vedere e modificare le righe come in un foglio di calcolo.

## 4. Backup e ripristino

```bash
# Salva tutto in un file
docker exec gargantua-pg pg_dump -U gargantua diario > backup-diario.sql

# Ripristina da un file
docker exec -i gargantua-pg psql -U gargantua -d diario < backup-diario.sql
```

## 5. Ricominciare da zero

Questi comandi **cancellano tutti i dati locali**:

```bash
docker rm -f gargantua-pg
docker volume rm gargantua-pg-dati

docker run -d --name gargantua-pg -e POSTGRES_USER=gargantua \
  -e POSTGRES_PASSWORD=orizzonte-locale -e POSTGRES_DB=diario \
  -p 127.0.0.1:5433:5432 -v gargantua-pg-dati:/var/lib/postgresql/data \
  postgres:17-alpine

npm run db:init
```

## Tabelle (v2, terza forma normale)

**Tabelle di riferimento** — le etichette e i valori ammessi stanno qui, non nel codice:

| Tabella | Contenuto |
|---|---|
| `persone` | `jo` → Jo, `alix` → Alix |
| `bande` | le categorie della bacheca: film, serie, libri, piatti, viaggi, uscite, musica, giochi, casa, regali, ricordi, sogni, altro |
| `stati_voce` | `nebulosa` (in attesa), `fusione` (in corso), `supernova` (fatto) |
| `stati_missione` | `progettazione`, `in_volo`, `atterrata` |
| `livelli_umore` | 1 Buco nero · 2 Nana bruna · 3 Nebulosa · 4 Stella · 5 Supernova |
| `emozioni` | felice, calma, grata, innamorata, energica, ansiosa, triste, … |

**Entità**:

| Tabella | Pagina | Contenuto |
|---|---|---|
| `voci` | `/bacheca` | tutto ciò che vogliamo vedere, leggere, cucinare, fare |
| `messaggi` | `/welcome` (Singolarità) | i messaggini tra Jo e Alix |
| `rilevazioni` | `/telemetria` | umore, energia, stress, benessere fisico, sonno, causa |
| `rilevazione_emozioni` | `/telemetria` | tabella ponte: le emozioni di ogni rilevazione |
| `pensieri` | `/pensieri` | Materia oscura |
| `missioni` | `/missioni` | progetti |

**Identificazione e contatore**:

| Tabella | Contenuto |
|---|---|
| `chiavi` | la chiave personale di Jo e di Alix, solo come hash scrypt + sale |
| `sessioni` | gli accessi aperti (hash del token del cookie, scadenza a 30 giorni) |
| `parole_accesso` | ogni parola provata al cancello: parola, persona, riuscita sì/no, quando |

Impostare (o reimpostare, se dimenticata) una chiave:

```bash
npm run chiave -- jo
npm run chiave -- alix
```

Poi ognuno può cambiarla da `/profilo`. Sul database di Vercel/Neon:
`DATABASE_URL=... node scripts/imposta-chiave.mjs jo`.

Le classifiche delle rime in Singolarità contano solo le parole riuscite.
Per azzerarle: `delete from parole_accesso;`

**Per chi**: la colonna `per_persona` vale `NULL` per *Entangled* (insieme),
oppure `jo` / `alix` per "solo per". Le scale (energia, stress, benessere, voto)
vanno da 1 a 5.

Per aggiungere una categoria, un'emozione o un nome basta un `insert` nella
tabella di riferimento (o modificare `db/schema.sql` e rilanciare `npm run db:init`):

```sql
insert into bande (codice, etichetta, simbolo, ordine) values ('podcast', 'Podcast', '◌', 14);
```

## Da sapere

- **Questo è il database locale.** Quello del sito su Vercel (Neon) è separato: ha un suo URL, che trovi nella dashboard di Neon o di Vercel. Ci si collega allo stesso modo, ad esempio con DBeaver.
- **Password locale.** `orizzonte-locale` vale solo sul tuo PC, perché la porta è aperta solo su `127.0.0.1`. Per Neon si usano le credenziali che genera lui.
