# Deploy the nonograms server.
#
# On the box:        cd ~/nonograms && make deploy
# From your laptop:  ssh exedev@nonograms 'cd nonograms && make deploy'
#
# systemctl restart also starts a stopped service, so this is safe either way.

SERVICE ?= nonograms
ENV_FILE ?= $(HOME)/.config/nonograms/server.env

# bun lives under $HOME and is missing from a non-interactive ssh PATH.
export PATH := $(HOME)/.bun/bin:$(PATH)

.PHONY: deploy
deploy:
	git pull --ff-only
	cd server && bun install --frozen-lockfile
	cd server && set -a && . $(ENV_FILE) && set +a && bun run build
	sudo systemctl restart $(SERVICE)
	@systemctl is-active $(SERVICE)
