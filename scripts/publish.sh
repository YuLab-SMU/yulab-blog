#!/usr/bin/env bash
# 把 public/ 的构建产物提交到 gh-pages 分支（可选推送到 origin）。
#
#   make publish          构建 + 提交 + 推送
#   make publish PUSH=0   只更新本地 gh-pages，不推送
#
# 做法：在临时目录挂一个 gh-pages 的 worktree，rsync 覆盖后提交。
# 不碰主工作区，也不需要人工 checkout 到 gh-pages。
set -euo pipefail
cd "$(dirname "$0")/.."

OUT=${OUT:-public}
PUSH=${PUSH:-1}

[ -f "$OUT/index.html" ] || { echo "错误：$OUT/ 里没有构建产物，先跑 make build。" >&2; exit 1; }

# GitHub Pages 不需要 Jekyll 处理，放个 .nojekyll 关掉它
touch "$OUT/.nojekyll"

tmp=$(mktemp -d)
cleanup() {
  git worktree remove --force "$tmp" >/dev/null 2>&1 || rm -rf "$tmp"
}
trap cleanup EXIT

if git rev-parse --verify -q refs/heads/gh-pages >/dev/null; then
  start=refs/heads/gh-pages
else
  # 首次发布：用一个空树的孤儿提交作为 gh-pages 的起点
  empty_tree=$(git hash-object -t tree /dev/null)
  git update-ref refs/heads/gh-pages \
    "$(git commit-tree "$empty_tree" -m "chore: 初始化 gh-pages 分支")"
  start=refs/heads/gh-pages
  echo "已创建 gh-pages 分支"
fi

git worktree add -q -B gh-pages "$tmp" "$start"
rsync -a --delete --exclude '.git' "$OUT/" "$tmp/"

git -C "$tmp" add -A
if git -C "$tmp" diff --cached --quiet; then
  echo "gh-pages：内容无变化，不产生新提交"
else
  git -C "$tmp" commit -q -m "deploy: 站点构建 $(date '+%Y-%m-%d %H:%M:%S')"
  echo "gh-pages：已提交 $(git -C "$tmp" rev-parse --short HEAD)"
fi

if [ "$PUSH" = "1" ] && git remote get-url origin >/dev/null 2>&1; then
  git -C "$tmp" push -q origin gh-pages
  echo "已推送到 origin/gh-pages"
else
  echo "未推送（PUSH=$PUSH）：gh-pages 分支只在本地更新"
fi