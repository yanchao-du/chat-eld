#!/bin/bash
# sync-knowledge.sh
# -----------------
# Copies the compiled wiki source pages into the webapp's knowledge directory
# so the web chat widget uses the same up-to-date content as the NanoClaw agent.
#
# Usage:
#   bash scripts/sync-knowledge.sh
#
# Expects to be run from the nanoclaw root (where knowledge/wiki/sources/ lives),
# with WEBAPP_DIR pointing at the chat-eld webapp directory.
#
# Defaults (same EC2, standard paths):
#   WIKI_SOURCES_DIR  = ./knowledge/wiki/sources
#   WEBAPP_DIR        = /home/ubuntu/chat-eld/webapp
#
# Override via env vars:
#   WIKI_SOURCES_DIR=/custom/path WEBAPP_DIR=/other/path bash sync-knowledge.sh

set -euo pipefail

WIKI_SOURCES_DIR="${WIKI_SOURCES_DIR:-$(pwd)/knowledge/wiki/sources}"
WEBAPP_KNOWLEDGE_DIR="${WEBAPP_DIR:-/home/ubuntu/chat-eld/webapp}/knowledge"

echo "=== sync-knowledge: started at $(date) ==="
echo "  Source : $WIKI_SOURCES_DIR"
echo "  Target : $WEBAPP_KNOWLEDGE_DIR"

if [ ! -d "$WIKI_SOURCES_DIR" ]; then
  echo "ERROR: wiki sources dir not found: $WIKI_SOURCES_DIR"
  echo "       Run wiki-compile.js first."
  exit 1
fi

SOURCE_COUNT=$(find "$WIKI_SOURCES_DIR" -maxdepth 1 -name '*.md' | wc -l)
if [ "$SOURCE_COUNT" -eq 0 ]; then
  echo "ERROR: no .md files found in $WIKI_SOURCES_DIR"
  echo "       Run wiki-compile.js first."
  exit 1
fi

mkdir -p "$WEBAPP_KNOWLEDGE_DIR"
find "$WEBAPP_KNOWLEDGE_DIR" -maxdepth 1 -name '*.md' -delete
cp "$WIKI_SOURCES_DIR"/*.md "$WEBAPP_KNOWLEDGE_DIR/"

COPIED=$(find "$WEBAPP_KNOWLEDGE_DIR" -maxdepth 1 -name '*.md' | wc -l)
echo "  Copied : $COPIED pages"
echo "=== sync-knowledge: done at $(date) ==="
