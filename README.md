# Prenotazioni serate

App per gestire le prenotazioni delle serate: gli ospiti vedono le serate aperte e prenotano in un minuto; l'admin gestisce serate e prenotazioni da un'area riservata protetta da PIN.

## Funzionalità

**Per gli ospiti**

- Elenco delle serate aperte con data, ora, descrizione e immagine.
- Descrizioni con link cliccabili nelle pagine delle serate.
- Prenotazione con nome, cognome, numero di persone ed email facoltativa.
- Se l'ospite lascia l'email riceve un link personale per **modificare o cancellare** la prenotazione in autonomia. Senza email, solo l'admin può intervenire.
- Da ogni pagina serata si scarica il **QR code** che porta alla pagina stessa.

**Per l'admin** (accesso con PIN da `/admin`)

- CRUD completo delle serate: nome, descrizione, data, ora, data limite prenotazioni, immagine hero, colore tema, apertura/chiusura prenotazioni.
- Lista prenotati per serata con totale persone.
- Modifica, eliminazione e inserimento manuale di ogni prenotazione (es. prese al telefono).

## Avvio

```bash
npm install            # installa le dipendenze (genera anche il client Prisma)
npx prisma db push     # crea il database SQLite (prisma/dev.db)
npm run db:seed        # (facoltativo) 3 serate di esempio
npm run dev            # http://localhost:3000
```

PIN admin predefinito: **2026** (configurabile in `.env`).

## Configurazione (`.env`)

Copia `.env.example` in `.env` e personalizza:

| Variabile | Descrizione |
| --- | --- |
| `DATABASE_URL` | Percorso del database SQLite (default `file:./prisma/dev.db`). |
| `ADMIN_PIN` | PIN di accesso all'area admin (default `2026`). |
| `AUTH_SECRET` | Segreto per firmare i cookie di sessione. **Obbligatorio in produzione** (`openssl rand -hex 32`). |
| `BASE_URL` | URL pubblico del sito, usato per QR code e link nelle email. Se assente viene dedotto dalla richiesta. |
| `SMTP_HOST` … `SMTP_FROM` | Configurazione SMTP per l'invio delle email. Se non configurato, il link di gestione viene solo loggato in console (utile in sviluppo). |
| `NEXT_PUBLIC_SITE_NAME` | Nome mostrato nell'interfaccia (default "CAP Faenza"). |

## Produzione

```bash
npm run build
npm start
```

## Deploy da zero con Docker

Questo progetto usa SQLite e salva le immagini caricate su disco, quindi il deploy
consigliato è una VPS o macchina Docker con filesystem persistente. Il file
`compose.yaml` avvia:

- `app`: Next.js in produzione, con migration Prisma applicate all'avvio.
- `caddy`: reverse proxy HTTPS automatico per il dominio configurato.
- `app-data`: volume persistente con database SQLite e immagini caricate.

Sul server:

```bash
# prerequisiti: Docker Engine e Docker Compose plugin
git clone git@github.com:cap-faenza/reservations.git
cd reservations
cp .env.production.example .env.production
```

Poi modifica `.env.production`:

- `SITE_DOMAIN`: dominio puntato al server via DNS.
- `BASE_URL`: URL pubblico, normalmente `https://<SITE_DOMAIN>`.
- `ADMIN_PIN`: PIN reale dell'area admin.
- `AUTH_SECRET`: genera con `openssl rand -hex 32`.
- SMTP facoltativo, ma consigliato per inviare i link di gestione via email.

Avvio iniziale:

```bash
docker compose up -d --build
docker compose logs -f app
```

Aggiornamento dopo un nuovo push:

```bash
git pull
docker compose up -d --build
```

Il database di produzione nasce dentro il volume Docker `app-data` al percorso
`/app/data/production.db`; le immagini finiscono in `/app/data/uploads`.
Non cancellare quel volume durante rebuild o aggiornamenti.

### Server con reverse proxy già presente (deploy attuale)

Il deploy su `reservations.muvat.cloud` gira su un server con Apache già in
ascolto su 80/443 e Docker/docker-compose datati: si usa `compose.server.yaml`
(solo il container app su `127.0.0.1:8105`, senza Caddy), con vhost Apache +
certbot per il TLS. Il file `.env.production` è **senza virgolette** nei valori
(docker-compose v1 le passerebbe letteralmente). Aggiornamento:

```bash
cd ~/reservations.muvat.cloud
git pull
docker-compose -f compose.server.yaml up -d --build
```

### Deploy automatico a ogni push (GitHub Actions)

Ogni push su `main` fa partire il workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
che si connette in SSH al server e ricostruisce il container. Si può anche
lanciare a mano da GitHub → Actions → Deploy → *Run workflow*.

Come è configurato:

- Sul server c'è `~/deploy-reservations.sh` (copia versionata in
  [`scripts/server-deploy.sh`](scripts/server-deploy.sh)) che fa
  `git fetch` + `reset --hard FETCH_HEAD` + `docker-compose up -d --build`.
- Una chiave SSH dedicata è registrata in `~/.ssh/authorized_keys` con un
  **forced-command**: quella chiave può *solo* eseguire lo script di deploy,
  niente shell. Così, anche se il segreto trapelasse dal repo pubblico, non
  darebbe accesso al server.
- La chiave privata è nel secret GitHub `DEPLOY_SSH_KEY`; la host key del
  server è pinnata nel workflow.

Se cambi `scripts/server-deploy.sh`, aggiorna la copia sul server:
`scp scripts/server-deploy.sh ovh:/home/ddiiorio/deploy-reservations.sh`.

Note per il deploy:

- Il database è **SQLite** e le immagini caricate finiscono in `data/uploads/`: serve un hosting con **filesystem persistente** (VPS, Docker con volume, ecc.). Non adatto così com'è a piattaforme serverless come Vercel.
- Imposta sempre `AUTH_SECRET`, `ADMIN_PIN` e `BASE_URL` in produzione.

## Stack

Next.js (App Router) · React 19 · Tailwind CSS 4 · shadcn/ui · Prisma 7 + SQLite · Nodemailer · qrcode
