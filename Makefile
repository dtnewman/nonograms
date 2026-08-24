# Deploy the nonograms server to a single Linux box (exe.dev, or any VM).
#
# The server is a stateful Next.js process backed by a local SQLite file, so it
# lives on exactly one machine with a persistent disk. Everything here runs from
# your laptop over SSH and is safe to re-run.
#
# One-time setup: see "make bootstrap-help".

# --- configuration (override on the command line or in the environment) ------
# ssh alias or user@host for the box
HOST ?= nonograms
# git checkout on the box (repo root, not server/)
APP_DIR ?= /srv/nonograms
# systemd unit name
SERVICE ?= nonograms
# branch to deploy
BRANCH ?= main
# port next listens on (must match the systemd unit)
PORT ?= 3000
# env file on the box, read by systemd and by the production build
ENV_FILE ?= /etc/nonograms.env
# local copy of that env file, kept outside the repo so it is never committed
LOCAL_ENV ?= $(HOME)/.config/nonograms/server.env
# where the sqlite database lives on the box (outside the checkout)
DB_PATH ?= /var/lib/nonograms/nonograms.db

SSH := ssh $(HOST)
SSH_TTY := ssh -t $(HOST)
# bun/node are often installed under $HOME on these boxes and a non-interactive
# ssh shell will not have them on PATH.
REMOTE_PATH := export PATH="$$HOME/.bun/bin:$$HOME/.local/bin:/usr/local/bin:$$PATH";

.DEFAULT_GOAL := help
.PHONY: help deploy build restart start stop status logs health ssh env-push db-backup bootstrap-help

help: ## Show this help
	@echo "Nonograms server deploy — HOST=$(HOST) APP_DIR=$(APP_DIR) SERVICE=$(SERVICE)"
	@echo
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
	  | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'
	@echo
	@echo "Override anything: make deploy HOST=me@1.2.3.4 BRANCH=some-branch"

deploy: ## Pull $(BRANCH), install, build, restart, health-check
	@echo "==> deploying $(BRANCH) to $(HOST):$(APP_DIR)"
	@$(SSH) 'set -eu; $(REMOTE_PATH) \
	  cd $(APP_DIR); \
	  git fetch --prune origin; \
	  git checkout $(BRANCH); \
	  git reset --hard origin/$(BRANCH); \
	  cd server; \
	  bun install --frozen-lockfile; \
	  set -a; . $(ENV_FILE); set +a; \
	  bun run build'
	@$(MAKE) --no-print-directory restart
	@$(MAKE) --no-print-directory health

build: ## Rebuild on the box without pulling (after editing env or files in place)
	@$(SSH) 'set -eu; $(REMOTE_PATH) \
	  cd $(APP_DIR)/server; \
	  set -a; . $(ENV_FILE); set +a; \
	  bun run build'

restart: ## Restart the service
	@$(SSH) 'sudo systemctl restart $(SERVICE)'
	@echo "==> restarted $(SERVICE)"

start: ## Start the service
	@$(SSH) 'sudo systemctl start $(SERVICE)'

stop: ## Stop the service
	@$(SSH) 'sudo systemctl stop $(SERVICE)'

status: ## systemctl status
	@$(SSH) 'systemctl status $(SERVICE) --no-pager -l' || true

logs: ## Follow the last 100 lines of logs
	@$(SSH_TTY) 'sudo journalctl -u $(SERVICE) -n 100 -f'

health: ## Wait for the API to answer on the box
	@$(SSH) 'set -eu; \
	  for i in $$(seq 1 30); do \
	    if curl -fsS -o /dev/null http://127.0.0.1:$(PORT)/api/puzzles; then \
	      echo "==> healthy on 127.0.0.1:$(PORT)"; exit 0; \
	    fi; \
	    sleep 1; \
	  done; \
	  echo "!! no response on 127.0.0.1:$(PORT) after 30s — check: make logs"; exit 1'

ssh: ## Open a shell in the app directory
	@$(SSH_TTY) 'cd $(APP_DIR) && exec $$SHELL -l'

env-push: ## Copy $(LOCAL_ENV) to $(ENV_FILE) on the box (then: make deploy)
	@test -f "$(LOCAL_ENV)" || { echo "missing $(LOCAL_ENV) — see 'make bootstrap-help'"; exit 1; }
	@scp -q "$(LOCAL_ENV)" $(HOST):/tmp/nonograms.env.new
	@$(SSH) 'set -eu; sudo install -m 600 -o $$(id -un) -g $$(id -gn) /tmp/nonograms.env.new $(ENV_FILE); rm -f /tmp/nonograms.env.new'
	@echo "==> wrote $(ENV_FILE) (NEXT_PUBLIC_* is baked in at build time — run 'make deploy')"

db-backup: ## Download a consistent snapshot of the sqlite database
	@mkdir -p backups
	@$(SSH) 'set -eu; sqlite3 $(DB_PATH) ".backup /tmp/nonograms-backup.db"'
	@scp -q $(HOST):/tmp/nonograms-backup.db backups/nonograms-$$(date +%Y%m%d-%H%M%S).db
	@$(SSH) 'rm -f /tmp/nonograms-backup.db'
	@ls -lh backups | tail -1

bootstrap-help: ## Print the one-time setup steps for a fresh box
	@echo "One-time setup on $(HOST):"
	@echo "  1. sudo mkdir -p $(APP_DIR) && sudo chown \$$(id -un): $(APP_DIR)"
	@echo "     git clone https://github.com/dtnewman/nonograms.git $(APP_DIR)"
	@echo "  2. curl -fsSL https://bun.sh/install | bash     # if bun is missing"
	@echo "     node --version                              # needs node 20+"
	@echo "  3. mkdir -p \$$(dirname $(LOCAL_ENV)) && cp server/deploy/env.example $(LOCAL_ENV)"
	@echo "     \$$EDITOR $(LOCAL_ENV) && make env-push"
	@echo "  4. sudo mkdir -p \$$(dirname $(DB_PATH)) && sudo chown \$$(id -un): \$$(dirname $(DB_PATH))"
	@echo "  5. sed 's/REPLACE_USER/'\$$(id -un)'/' server/deploy/nonograms.service \\"
	@echo "       | sudo tee /etc/systemd/system/$(SERVICE).service >/dev/null"
	@echo "     sudo systemctl daemon-reload && sudo systemctl enable $(SERVICE)"
	@echo "  6. make deploy"
