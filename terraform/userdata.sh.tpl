#!/bin/bash
set -euo pipefail

# Wait for apt to be available
while fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1; do sleep 2; done

apt-get update -y
apt-get install -y gcc python3 make git curl jq

# Docker Engine
curl -fsSL https://get.docker.com | sh
usermod -aG docker ubuntu
systemctl enable docker
systemctl start docker

# Node.js 22 via nvm (installed for the ubuntu user)
su - ubuntu -c '
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  source "$NVM_DIR/nvm.sh"
  nvm install 22
  nvm use 22
  nvm alias default 22
  corepack enable
'

# Clone NanoClaw
su - ubuntu -c '
  git clone https://github.com/qwibitai/nanoclaw.git /home/ubuntu/nanoclaw
'

# Mark setup complete
echo "${project_name} userdata complete at $(date)" > /home/ubuntu/setup-complete.txt
chown ubuntu:ubuntu /home/ubuntu/setup-complete.txt
