#!/bin/bash
set -e

# =========================
# LOCAL CONFIG
# =========================
LOCAL_DIR="/Users/macbook/Myprojects/telko-vas/frontend/"

EXCLUDE_STRING="--exclude=node_modules/ --exclude=.env --exclude=.next/ --exclude=.git/ --exclude=.gitignore --exclude=.DS_Store"


# =========================
# REMOTE CONFIG
# =========================
REMOTE_DIR="/opt/vendi-core/frontend"

SERVER1_USER="davp1srvr"
SERVER1_HOST="10.218.76.90"

SERVER2_USER="davp2srvr"
SERVER2_HOST="10.218.76.92"


# =========================
# DEPLOY TO SERVER 1
# =========================
echo "🚀 Syncing files to server 1 (${SERVER1_HOST})..."

# Deploy to server 1 
echo "Deploying to $REMOTE_HOST1..." 
rsync -avz --delete $EXCLUDE_STRING $LOCAL_DIR $SERVER1_USER@$SERVER1_HOST:$REMOTE_DIR

ssh $SERVER1_USER@$SERVER1_HOST << EOF
  set -e
  cd $REMOTE_DIR

  docker compose down
  echo "🐳 Building Docker images..."
  docker compose build

  echo "🔁 Restarting containers..."
  docker compose up -d --remove-orphans

  echo "✅ Server 1 deployment complete"
EOF

# =========================
# DEPLOY TO SERVER 2
# =========================
echo "🚀 Syncing files to server 2 (${SERVER2_HOST})..."

rsync -avz --delete $EXCLUDE_STRING $LOCAL_DIR $SERVER2_USER@$SERVER2_HOST:$REMOTE_DIR

ssh $SERVER2_USER@$SERVER2_HOST << EOF
  set -e
  cd $REMOTE_DIR

  docker compose down
  echo "🐳 Building Docker images..."
  docker compose build

  echo "🔁 Restarting containers..."
  docker compose up -d --remove-orphans

  echo "✅ Server 2 deployment complete"
EOF

echo "🎉 DEPLOYMENT FINISHED SUCCESSFULLY"

