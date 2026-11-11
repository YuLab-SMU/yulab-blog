# YuLab 课题组博客

南方医科大学 [YuLab 课题组](https://yulab-smu.top/) 的博客：**<https://yulab-smu.top/yulab-blog>**

用 [Quartz 4](https://quartz.jzhao.xyz/) 生成静态站点，托管在 GitHub Pages。

## 三个分支

| 分支 | 放什么 | 谁在用 |
| --- | --- | --- |
| `main` | 博客系统：Quartz 本体、配置、构建脚本、CI | 维护者 |
| `docs` | 文章源文件：Markdown 和图片 | 写文章的人 |
| `gh-pages` | 渲染好的 html 产物 | GitHub Pages 读取，不要手改 |

数据流：

```
docs 分支 ──make build──▶ public/ ──make publish / CI──▶ gh-pages 分支
                 ▲
            main 分支（Quartz 系统在此）
```

## 写文章

内容全部在 `docs` 分支，那边有一份 [README.md](https://github.com/YuLab-SMU/yulab-blog/blob/docs/README.md)（构建时忽略，不会变成网页）讲目录约定和 frontmatter 格式。要点：

- 一篇一个文件：`posts/<slug>.md`，`<slug>` 就是 URL。
- 图片放 `assets/<slug>/`，正文用 `../assets/<slug>/xxx.png` 引用。
- 标题写在 frontmatter 的 `title`，正文里不要再写 `#` 一级标题。
- 不想发布就写 `draft: true`。

## 本地构建

```bash
make install    # 首次：npm ci
make build      # 构建到 public/
make serve      # 本地预览（默认 http://localhost:8080，改内容会自动重建）
make publish    # 构建 + 提交 gh-pages 分支并推送
make publish PUSH=0   # 只更新本地 gh-pages，不推送
```

`make build` 会把 `docs` 分支检出到 `content/`（`git worktree`，已 gitignore），再渲染到 `public/`。

> ⚠️ **不要**在仓库根目录 `git switch docs`：`docs` 已经挂在 `content/` 这个 worktree 上，git 会拒绝。
> 写文章就在 `content/` 里改，然后 `git -C content add -A && git -C content commit -m ... && git -C content push`。

## 自动发布

`.github/workflows/deploy.yml`：

- **每天北京时间 01:00**（UTC 17:00）定时构建发布；
- `main` 分支有推送时构建；
- 也可以在 Actions 页面手动触发：`gh workflow run deploy.yml`。

CI 会把 `main` 检出到 `site/`、`docs` 检出到 `content/`，构建后把产物推到 `gh-pages`。

一次性设置：仓库 **Settings → Pages → Source** 选 `Deploy from a branch`，分支 `gh-pages`，目录 `/ (root)`。
（`gh-pages` 分支要等第一次发布之后才存在。）

## 配置在哪

| 文件 | 作用 |
| --- | --- |
| `quartz.config.ts` | 站点标题、地址 `baseUrl`、语言、配色、启用的插件 |
| `quartz.layout.ts` | 页面布局：侧栏、目录、页脚链接、首页「最新文章」 |
| `quartz/styles/custom.scss` | 中文字体栈、图片与图注样式 |
| `quartz/static/icon.png` | favicon / 站点图标 |
| `quartz/static/og-image.png` | 默认社交预览图 |

换域名（例如以后挂到 `blog.yulab-smu.top`）要改两处：`quartz.config.ts` 的 `baseUrl`，以及 Pages 里的自定义域名。