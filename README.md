# kS1 — Sewing Circle Integrated App

Single Vite + React project combining:

| App | Route | Description |
|---|---|---|
| **sewingStatic-master** | `/` | Public company website |
| **candidatePortal** | `/portal` | Internal employee portal (RBAC) |

## Structure

```
src/
├── App.jsx              ← Root router (React Router v6)
├── main.jsx             ← Entry point with BrowserRouter
├── index.css            ← Tailwind + portal CSS variables
│
├── public-site/         ← sewingStatic-master (public website)
│   ├── App.jsx          ← Public site root component
│   ├── components/      ← All public site sections
│   └── image/           ← Event photos, logos, backgrounds
│
└── portal/              ← candidatePortal (employee portal)
    ├── PortalApp.jsx    ← Portal root component
    ├── components/      ← Sidebar, Header, all tabs
    ├── store/           ← Zustand store + PERMISSIONS
    ├── data/            ← Mock data, skill categories
    └── utils/           ← Scoring engine, resume parser, DB layer
```

## Routes

- `/` → Public Sewing Circle website (hero, about, events, contact)
- `/portal` → Employee portal (requires role-based access)

## RBAC

| Tier | Role | Access |
|---|---|---|
| **t-1** | Admin | All tabs: Overview, Candidates, Jobs, Scoring, **Events**, Audit |
| **t-2** | Recruiter | Candidates (add/edit own) + Jobs (view only) |
| **t-3** | Client | Candidates (shared profiles only) |

## Events Integration

The **Events tab** (t-1 only) in the portal manages events that appear on the
public website's Events section. Both apps share the same `localStorage` key
`cp_events`. In production, replace with a shared MongoDB backend.

## Dev

```bash
npm install
npm run dev      # http://localhost:5173
                 # /portal for the employee portal
```

## Build & Deploy

```bash
npm run build    # outputs to dist/
```

Deploy `dist/` to Netlify — the `netlify.toml` handles SPA routing.
