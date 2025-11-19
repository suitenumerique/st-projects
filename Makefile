.PHONY: help setup up down restart logs keycloak-wait init-db clean

# Default values
COMPOSE_FILE := docker-compose-dev.yml
KEYCLOAK_URL := http://localhost:8080
INITIAL_USER_EMAIL ?= user.test@anct.gouv.fr
INITIAL_USER_PASSWORD ?= password
INITIAL_USER_USERNAME ?= test.user
INITIAL_USER_FIRST_NAME ?= Test
INITIAL_USER_LAST_NAME ?= User

help: ## Show this help message
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

bootstrap: ## Complete setup: start services and initialize database
	@echo "🚀 Starting complete setup..."
	@$(MAKE) up
	@echo "⏳ Waiting for services to be ready..."
	@sleep 10
	@$(MAKE) keycloak-wait
	@$(MAKE) init-db
	@echo "✅ Setup complete! Application is ready at http://localhost:3000"
	@echo "   Keycloak Admin Console: http://localhost:8080 (admin/admin)"
	@echo "   Keycloak realm is auto-imported from realm-export.json"

up: ## Start all Docker services
	@echo "🐳 Starting Docker services..."
	docker-compose -f $(COMPOSE_FILE) up -d
	@echo "✅ Services started. Use 'make logs' to view logs."

down: ## Stop all Docker services
	@echo "🛑 Stopping Docker services..."
	docker-compose -f $(COMPOSE_FILE) down
	@echo "✅ Services stopped."

restart: ## Restart all Docker services
	@echo "🔄 Restarting Docker services..."
	$(MAKE) down
	$(MAKE) up

logs: ## Show logs from all services
	docker-compose -f $(COMPOSE_FILE) logs -f

logs-server: ## Show logs from server only
	docker-compose -f $(COMPOSE_FILE) logs -f server

logs-keycloak: ## Show logs from Keycloak only
	docker-compose -f $(COMPOSE_FILE) logs -f keycloak

keycloak-wait: ## Wait for Keycloak to be ready
	@echo "⏳ Waiting for Keycloak to be ready..."
	@timeout=60; \
	while [ $$timeout -gt 0 ]; do \
		if curl -s -f $(KEYCLOAK_URL)/realms/master/.well-known/openid-configuration > /dev/null 2>&1; then \
			echo "✅ Keycloak is ready!"; \
			break; \
		fi; \
		echo "   Waiting... ($$timeout seconds remaining)"; \
		sleep 2; \
		timeout=$$((timeout - 2)); \
	done; \
	if [ $$timeout -le 0 ]; then \
		echo "❌ Timeout waiting for Keycloak"; \
		exit 1; \
	fi

init-db: ## Initialize the database (migrations and seeds)
	@echo "🗄️  Initializing database..."
	@echo "   Waiting for postgres to be ready..."
	@timeout=60; \
	while [ $$timeout -gt 0 ]; do \
		if docker-compose -f $(COMPOSE_FILE) exec -T postgres pg_isready -U user -d projets > /dev/null 2>&1; then \
			break; \
		fi; \
		sleep 2; \
		timeout=$$((timeout - 2)); \
	done
	@echo "   Running database migrations and seeds..."
	docker-compose -f $(COMPOSE_FILE) run --rm \
		-e DATABASE_URL=postgresql://user:password@postgres:5432/projets \
		-e DEFAULT_ADMIN_EMAIL=$(INITIAL_USER_EMAIL) \
		-e DEFAULT_ADMIN_PASSWORD=$(INITIAL_USER_PASSWORD) \
		-e DEFAULT_ADMIN_NAME="$(INITIAL_USER_FIRST_NAME) $(INITIAL_USER_LAST_NAME)" \
		-e DEFAULT_ADMIN_USERNAME=$(INITIAL_USER_USERNAME) \
		server npm run db:init
	@echo "✅ Database initialized successfully!"

clean: ## Stop services and remove volumes (WARNING: deletes all data)
	@echo "⚠️  WARNING: This will delete all data including databases!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose -f $(COMPOSE_FILE) down -v; \
		echo "✅ Cleanup complete. All volumes removed."; \
	else \
		echo "❌ Cleanup cancelled."; \
	fi

ps: ## Show status of all services
	docker-compose -f $(COMPOSE_FILE) ps

shell-server: ## Open a shell in the server container
	docker-compose -f $(COMPOSE_FILE) exec server sh

shell-keycloak: ## Open a shell in the Keycloak container
	docker-compose -f $(COMPOSE_FILE) exec keycloak /bin/bash

shell-postgres: ## Open a psql shell in the postgres container
	docker-compose -f $(COMPOSE_FILE) exec postgres psql -U user -d projets
