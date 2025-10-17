## Campus Help

Next.js 15 + Supabase marketplace that lets THI students post study requests, collect tutor bids, and manage availability.

### Local setup

```bash
npm install
npm run dev
```

The app expects environment variables for the Supabase client in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### Provision Supabase tables

The UI depends on a handful of tables (`profiles`, `public_profiles`, `tutor_availability`, `requests`, `replies`, `bids`). Run the statements in `supabase/schema.sql` inside the Supabase SQL editor. Every block is wrapped with `create table if not exists` so it is safe to rerun if you already created some tables. The policies in that file unlock:

- role switching + tutor directory publishing
- request creation, updates, and deletion by the author
- replies/bids from authenticated students with `ON DELETE CASCADE` relationships

If you see a toast like “Could not find the table `public.bids` in the schema cache`, it means the schema file has not been applied yet.

### Useful scripts

- `npm run lint` – ensure the app passes ESLint/TypeScript checks
- `npm run dev` – run the Next.js dev server on port 3000

### Troubleshooting

- Request delete blocked by RLS: confirm the `requests delete own` policy exists (see `supabase/schema.sql`).
- Missing bids/replies data: re-run the schema file to create the tables and indexes.
- Availability/calendar empty: make sure `public_profiles.is_listed` is true and the `tutor_availability` table contains slots for that tutor.
