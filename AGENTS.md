# AGENTS.md — yulab-blog（YuLab 课题组博客）

给在这个仓库里干活的 agent 看的约定。站点：<https://yulab-smu.top/yulab-blog>，用 Quartz 4 生成。

## 仓库形状：三个分支

| 分支 | 内容 | 注意 |
| --- | --- | --- |
| `main` | Quartz 系统 + 配置 + 脚本 + CI | 只有这里能构建 |
| `docs` | 文章源文件（md + assets） | **没有** Quartz 源码，在这里跑不了 `make build` |
| `gh-pages` | 渲染产物 | 生成物，不要手改；改动下次发布会丢 |

在 `main` 上，`docs` 分支检出在 `content/`（`git worktree`，已在 `.gitignore`）。所以：

- 写内容 → 改 `content/`，用 `git -C content …` 提交推到 `docs`。
- **不要**在仓库根目录 `git switch docs`（会因 worktree 占用而失败）。
- 构建产物在 `public/`（gitignore），发布时 rsync 进临时 worktree 提交到 `gh-pages`。

## 常用命令

```bash
make install      # npm ci（首次，网络慢时约 5–10 min）
make content      # 确保 content/ 是 docs 分支的 worktree（build 依赖它）
make build        # npx quartz build -d content -o public
make serve        # 本地预览 + 热重建
make publish      # 构建 + 提交 gh-pages（PUSH=0 只更新本地）
make publish PUSH=0
```

## 验证什么才算“做完了”

没有测试套件，验收看这几条：

```bash
make build                                     # 必须零报错
ls public/index.html public/posts/*.html       # 页面生成了
grep -o 'src="[^"]*"' public/posts/<slug>.html | grep assets   # 图片地址是相对路径
# 图片真实存在（逐条核对 md 里引用的 assets 路径）
grep -o '](\.\./assets/[^)]*)' content/posts/*.md | sed 's/.*](\.\.\///;s/)$//' \
  | while read p; do [ -f "content/$p" ] || echo "缺失: $p"; done
npm run check                                  # tsc --noEmit + prettier（可选，慢）
```

要肉眼确认就 `make serve` 打开 <http://localhost:8080/yulab-blog/>。

## Quartz 的坑（都踩过或读过源码）

- **输出目录会被整个清空**：`quartz/build.ts` 里先 `rm(output, {recursive:true})`。所以 `-o` 绝不能指向 git worktree（那里有 `.git` 文件，删了 worktree 就废了）。
- **`RemoveDrafts` 关掉 `ExplicitPublish`**：默认所有 md 都发布，只有 `draft: true` 不发布。别学 ygc-blog 那样要求 `publish: true`——忘写就静默不发布，很难查。
- **图片路径**：`CrawlLinks({markdownLinkResolution:"shortest"})` 会把相对图片地址重算成从当前页面出发的相对路径；`Assets` 按源文件路径原样拷贝。所以 md 里写 `../assets/<slug>/x.png`（相对 md 文件本身）即可，别写绝对路径。
- **`ignorePatterns`** 含 `**/README.md`：`docs` 分支的 README 不会变成网页。
- **不自带中文字体**：`CustomOgImages` 依赖 satori + Google 字体，中文标题会缺字形，所以**没启用**；`quartz/static/og-image.png` 是手做的静态兜底图。
- **中文正文**：字体栈在 `quartz/styles/custom.scss` 里补了 CJK fallback；主题字体只管拉丁字形。
- **`baseUrl`** 决定 `og:image`、sitemap、RSS 里的绝对地址；换域名要同步改 `quartz.config.ts`。
- **Quartz 版本**：4.5.2，从 YuLab-SMU/ygc-blog 复制而来，含少量定制（`quartz/` 与上游一致，改配置优先动 `quartz.config.ts` / `quartz.layout.ts` / `custom.scss`，别直接改 `quartz/` 内部除非确有必要）。

## 内容约定（docs 分支）

```
index.md                  首页
about.md                  关于
posts/<slug>.md           一篇文章，slug 即 URL
posts/_template.md        新文章模板（draft: true，不发布）
assets/<slug>/...         该文章的图片
```

- frontmatter 必填 `title`、`date`；可选 `description`、`tags`、`draft`。
- 正文不要再写 `#` 一级标题（标题来自 frontmatter）。
- 图片文件名不要带空格（`slugifyFilePath` 会把空格换成 `-`，但引用不会跟着变）。
- 大 GIF 很重（`assets/rho-agent-workspace/` 里有两张 8 MB 上下的录屏），新增素材超过 2–3 MB 时先考虑压缩或转 mp4。

## 发布链路

- 本地：`make publish`（构建 → 提交 `gh-pages` → push）。
- CI：`.github/workflows/deploy.yml`，**每天北京时间 01:00**（cron `0 17 * * *`，UTC）定时构建，另有 `push: main` 和 `workflow_dispatch`。
- CI 里 `main` → `site/`，`docs` → `content/`，`npx quartz build -d ../content -o ../out`，`peaceiris/actions-gh-pages@v4` 推到 `gh-pages`。
- 定时任务只认默认分支（`main`）上的 workflow 文件；推 `docs` 不会立刻触发，要等当晚的定时任务或手动 `gh workflow run deploy.yml`。