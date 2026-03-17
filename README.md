# InsurGuard-Ai


> **All commands must be run inside Docker. Do not install Node.js, npm, or any packages on your local machine.**

---

## Development (Hot Reload)

First-time setup or after changing `package.json`:

```bash
make dev-build
```

Subsequent runs (no package changes):

```bash
make dev
```

The app will be available at **http://localhost:3000** with full hot reload via volume mounts.

### Other dev commands

| Command | Description |
|---|---|
| `make dev-stop` | Stop dev containers |
| `make dev-logs` | Tail dev container logs |
| `make dev-shell` | Open shell inside dev container |
| `make dev-install` | Run `npm install` inside dev container (after adding deps to `package.json`) |
| `make dev-lint` | Run ESLint inside dev container |

---

## Production Build

```bash
make prod-build
```

Then visit **http://localhost:3000**.

| Command | Description |
|---|---|
| `make prod` | Start prod (no rebuild) |
| `make prod-stop` | Stop prod containers |
| `make prod-logs` | Tail prod container logs |

---

## Changing Dependencies

1. Edit `services/frontend-services/package.json` (add/update deps)
2. Rebuild the dev image to install them:
   ```bash
   make dev-build
   ```

**Never run `npm install` locally.**

---

## Project Structure

```
services/
├── Makefile                      # All Docker commands
├── docker-compose.dev.yml        # Dev compose (hot reload)
├── project-services.yml          # Prod compose
└── frontend-services/
    ├── Dockerfile                # Production multi-stage build
    ├── Dockerfile.dev            # Development image
    ├── package.json              # Dependencies (edit here, build in Docker)
    ├── src/
    │   ├── app/                  # Next.js App Router pages
    │   ├── components/           # UI components
    │   └── lib/                  # Store, API client, utils
    └── ...
```

---

## Stack

| Package | Version | Purpose |
|---|---|---|
| Next.js | 15.3.3 | React framework |
| React | 19.2.4 | UI library |
| Tailwind CSS | 3.4.17 | Styling |
| framer-motion | 12.37.0 | Animations |
| Zustand | 5.0.12 | State management |
| lucide-react | 0.577.0 | Icons |
| axios | 1.13.6 | HTTP client |
| Node.js | 22 LTS | Runtime (Docker only) |
