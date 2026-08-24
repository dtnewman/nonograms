# Deploy the nonograms server.
#
# On the box:        cd ~/nonograms && make deploy
# From your laptop:  ssh exedev@nonograms 'cd nonograms && make deploy'
#
# systemctl restart also starts a stopped service, so this is safe either way.

SERVICE ?= nonograms
# Runtime config is read by systemd (EnvironmentFile). The build only needs
# NEXT_PUBLIC_SITE_URL, which Next inlines at compile time.
ENV_FILE ?= $(HOME)/.config/nonograms/server.env

# bun lives under $HOME and is missing from a non-interactive ssh PATH.
export PATH := $(HOME)/.bun/bin:$(PATH)

.PHONY: deploy
deploy:
	git pull --ff-only
	cd server && bun install --frozen-lockfile
	@test -f $(ENV_FILE) || { echo "missing $(ENV_FILE)"; exit 1; }
	cd server && NEXT_PUBLIC_SITE_URL="$$(sed -n 's/^NEXT_PUBLIC_SITE_URL=//p' $(ENV_FILE))" bun run build
	sudo systemctl restart $(SERVICE)
	@systemctl is-active $(SERVICE)
