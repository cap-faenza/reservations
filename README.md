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

Note per il deploy:

- Il database è **SQLite** e le immagini caricate finiscono in `data/uploads/`: serve un hosting con **filesystem persistente** (VPS, Docker con volume, ecc.). Non adatto così com'è a piattaforme serverless come Vercel.
- Imposta sempre `AUTH_SECRET`, `ADMIN_PIN` e `BASE_URL` in produzione.

## Stack

Next.js (App Router) · React 19 · Tailwind CSS 4 · shadcn/ui · Prisma 7 + SQLite · Nodemailer · qrcode
