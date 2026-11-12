# YuLab 课题组博客

南方医科大学 [YuLab 课题组](https://yulab-smu.top/) 的博客：**<https://yulab-smu.top/yulab-blog>**

用 [Quartz 4](https://quartz.jzhao.xyz/) 生成静态站点，托管在 GitHub Pages。

## 三个分支

| 分支       | 放什么                                    | 谁在用                      |
| ---------- | ----------------------------------------- | --------------------------- |
| `main`     | 博客系统：Quartz 本体、配置、构建脚本、CI | 维护者                      |
| `docs`     | 文章源文件：Markdown 和图片               | 写文章的人                  |
| `gh-pages` | 渲染好的 html 产物                        | GitHub Pages 读取，不要手改 |

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
- 署名写 `author: 名字`（多人用 `authors: [甲, 乙]`），会显示在标题下方。
- 不想发布就写 `draft: true`。

## 中英文

每篇中文文章都有一个英文镜像页面，右上角点 **English** 就切过去（Quartz 开了 SPA，切换不刷新页面），英文页点 **中文** 切回来。首页、关于页、文章列表页也都有这个按钮。

译文不是浏览器里实时机翻，而是**构建前预生成**、提交在 `docs` 分支的 `en/` 镜像目录里：

```
docs/
├── index.md          posts/foo.md          ← 中文原文（你写这个）
└── en/
    ├── index.md      posts/foo.md          ← 英文译文（脚本生成，可人工校对）
```

新文章流程：

```bash
make translate     # 增量：只翻新增或改动过的文章，写进 content/en/
git -C content add -A && git -C content commit -m "content: 英文版" && git -C content push
```

- 用 `deepseek-flash` 翻译，key 取自 `~/.dsh/.credentials.yaml`（或环境变量 `DEEPSEEK_API_KEY`），**不进仓库**；CI 只渲染已有译文，不需要配 secret。
- 译文 frontmatter 里记了源文件的短 hash（`translated_from`），源文没改就不会重翻，也不会覆盖你手工校对过的译文；要强制重翻用 `python3 scripts/translate.py --force`（`--file posts/foo.md` 只翻一篇）。
- 不翻译的专有名词列在 `scripts/translate.py` 的 `GLOSSARY`，加术语改那里。
- ⚠️ 英文译文里的图片路径必须写 `/assets/...`（站点根相对），**不要**写 `../../assets/`——后者会和 Quartz 自己的 `pathToRoot` 叠加多跳一层，图片 404。脚本已经自动做这个转换。

故意没做的两件事：不在前端调翻译 API（会暴露密钥、国内访问不稳），不用 Google 翻译小部件（国内打不开、样式不可控）。代价是新文章要多跑一次 `make translate`。

## 本地构建

```bash
make install    # 首次：npm ci
make build      # 构建到 public/
make serve      # 本地预览 http://localhost:8090（改内容会自动重建）
make publish    # 构建 + 提交 gh-pages 分支并推送
make publish PUSH=0   # 只更新本地 gh-pages，不推送
```

- 端口：本机 8080 常被别的服务占着，所以默认用 8090；要换用 `make serve PORT=8080`。
- 装依赖慢或报 `ECONNRESET` 时走镜像：`npm ci --registry=https://registry.npmmirror.com`（本机实测从十几分钟降到几秒）。

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

| 文件                         | 作用                                             |
| ---------------------------- | ------------------------------------------------ |
| `quartz.config.ts`           | 站点标题、地址 `baseUrl`、语言、配色、启用的插件 |
| `quartz.layout.ts`           | 页面布局：侧栏、目录、页脚链接、首页「最新文章」 |
| `quartz/styles/custom.scss`  | 中文字体栈、图片与图注样式                       |
| `quartz/static/icon.png`     | favicon / 站点图标                               |
| `quartz/static/og-image.png` | 默认社交预览图                                   |

换域名（例如以后挂到 `blog.yulab-smu.top`）要改两处：`quartz.config.ts` 的 `baseUrl`，以及 Pages 里的自定义域名。
