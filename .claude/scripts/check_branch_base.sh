#!/bin/bash
# PRに無関係なコミットが混入するのを防ぐため、
# git push 前にブランチのコミットが他ブランチ由来でないか検証する。
#
# 検出ロジック: origin/main..HEAD のコミットが、自ブランチ・main 以外の
# リモートブランチにも存在する場合、別ブランチから分岐した可能性がある。

set -euo pipefail

BRANCH=$(git branch --show-current 2>/dev/null || true)

# main ブランチ自体への push は検証不要
if [ "$BRANCH" = "main" ]; then
  exit 0
fi

# origin/main を参照（このリポジトリに develop は無い）
BASE_REF="origin/main"
if ! git rev-parse --verify "$BASE_REF" >/dev/null 2>&1; then
  exit 0
fi

# origin/main に無い（= このブランチ独自の）コミット一覧
COMMITS=$(git rev-list "$BASE_REF"..HEAD 2>/dev/null || true)
if [ -z "$COMMITS" ]; then
  exit 0
fi

FOREIGN_FOUND=0
FOREIGN_DETAILS=""

for COMMIT in $COMMITS; do
  # このコミットを含むリモートブランチ（自ブランチと main を除外）
  OTHER_BRANCHES=$(git branch -r --contains "$COMMIT" 2>/dev/null \
    | grep -v "origin/$BRANCH" \
    | grep -v "origin/main" \
    | grep -v "HEAD" \
    | sed 's/^[[:space:]]*//' \
    || true)

  if [ -n "$OTHER_BRANCHES" ]; then
    FOREIGN_FOUND=1
    SHORT=$(git log --oneline -1 "$COMMIT")
    FOREIGN_DETAILS="${FOREIGN_DETAILS}  ${SHORT}  ← ${OTHER_BRANCHES}\n"
  fi
done

if [ "$FOREIGN_FOUND" -eq 1 ]; then
  echo "BLOCKED: ブランチ '$BRANCH' に他ブランチ由来のコミットが含まれています。"
  echo ""
  echo "該当コミット:"
  echo -e "$FOREIGN_DETAILS"
  echo "PRに無関係な変更が混入する可能性があります。"
  echo "対処法: git rebase --onto main <分岐元コミット> $BRANCH"
  exit 2
fi
