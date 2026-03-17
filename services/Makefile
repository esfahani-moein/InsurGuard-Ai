.PHONY: dev dev-build dev-stop dev-logs dev-shell dev-install dev-lint \
        backend-logs backend-shell backend-build \
        prod prod-build prod-stop prod-logs clean

# ─── Development ──────────────────────────────────────────────────────────────

## Build and start dev environment with hot reload (frontend + backend)
dev:
	docker compose -f docker-compose.dev.yml up

## Build dev images from scratch (use after package.json or pyproject.toml changes)
dev-build:
	docker compose -f docker-compose.dev.yml up --build

## Stop dev environment
dev-stop:
	docker compose -f docker-compose.dev.yml down

## View all dev logs
dev-logs:
	docker compose -f docker-compose.dev.yml logs -f

## View frontend logs only
frontend-logs:
	docker compose -f docker-compose.dev.yml logs -f frontend

## Open a shell inside the running frontend dev container
dev-shell:
	docker compose -f docker-compose.dev.yml exec frontend sh

## Run npm install inside the dev container (after adding new deps to package.json)
dev-install:
	docker compose -f docker-compose.dev.yml exec frontend npm install --legacy-peer-deps

## Run lint inside dev container
dev-lint:
	docker compose -f docker-compose.dev.yml exec frontend npm run lint

# ─── Backend ──────────────────────────────────────────────────────────────────

## View backend logs only
backend-logs:
	docker compose -f docker-compose.dev.yml logs -f backend

## Open a shell inside the running backend dev container
backend-shell:
	docker compose -f docker-compose.dev.yml exec backend sh

## Rebuild backend image only (after changing pyproject.toml)
backend-build:
	docker compose -f docker-compose.dev.yml build backend

# ─── Production ───────────────────────────────────────────────────────────────

## Build and start production environment
prod:
	docker compose -f project-services.yml up

## Build prod images from scratch
prod-build:
	docker compose -f project-services.yml up --build

## Stop production environment
prod-stop:
	docker compose -f project-services.yml down

## View prod logs
prod-logs:
	docker compose -f project-services.yml logs -f

# ─── Cleanup ──────────────────────────────────────────────────────────────────

## Remove all containers, volumes, and images for this project
clean:
	docker compose -f docker-compose.dev.yml down -v --rmi local 2>/dev/null || true
	docker compose -f project-services.yml down -v --rmi local 2>/dev/null || true
