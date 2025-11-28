.PHONY: db-up db-down db-reset

# Start the PostgreSQL service defined in docker-compose.yml
db-up:
	docker compose up -d postgres

# Stop the PostgreSQL container but keep the volume
db-down:
	docker compose stop postgres

# Remove all Compose-managed containers & volumes (database included)
db-reset:
	docker compose down -v
