#!/usr/bin/env bash
# 确保 content/ 是 docs 分支的检出（git worktree）。
# 幂等：已经挂好就什么都不做；远端有新提交时顺带快进。
set -euo pipefail
cd "$(dirname "$0")/.."

branch_of_content() {
  git -C content rev-parse --abbrev-ref HEAD 2>/dev/null || true
}

if [ -d content ] && [ "$(branch_of_content)" = "docs" ]; then
  echo "content/ 已是 docs 分支的检出"
  # 顺带同步远端；离线或没有远端时不致命
  git -C content pull --ff-only --quiet 2>/dev/null && echo "已同步 origin/docs" || \
    echo "（未同步远端，继续用本地 docs 分支）"
  exit 0
fi

if [ -d content ] && [ -n "$(ls -A content 2>/dev/null)" ]; then
  echo "错误：content/ 已存在，但不是 docs 分支的 worktree。" >&2
  echo "      确认里面没有要保留的东西后：rm -rf content 再重试。" >&2
  exit 1
fi
[ -d content ] && rmdir content 2>/dev/null || true

# 本地没有 docs 分支：从 origin 建一个跟踪分支
if ! git rev-parse --verify -q refs/heads/docs >/dev/null; then
  if git remote get-url origin >/dev/null 2>&1; then
    git fetch origin docs
    git branch --track docs origin/docs
  else
    echo "错误：本地没有 docs 分支，也没有 origin 远端。" >&2
    exit 1
  fi
fi

git worktree add content docs
echo "已挂载：content/ ← docs 分支"