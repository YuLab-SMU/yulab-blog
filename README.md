# 源文件分支（docs）

这个分支只放**文章源文件和图片**。站点系统在 `main` 分支，渲染产物在 `gh-pages` 分支，本分支里的 Markdown 不会在这里被构建。

本文件不会被渲染成网页（构建时忽略 `**/README.md`）。

## 目录约定

```
index.md                    首页
about.md                    关于页
posts/                      文章
  <slug>.md                 一篇 = 一个文件，slug 就是 URL：/posts/<slug>
  _template.md              新文章模板（draft: true，不发布）
assets/<slug>/              这篇文章的图片，按文章 slug 分目录
  ...
```

- 一篇文章一个文件，文件名用英文小写加连字符（`rho-agent-workspace.md`），它会成为 URL。
- 图片放在 `assets/<同名 slug>/`，正文里用相对路径引用：`../assets/<slug>/xxx.png`。
- 图片文件名建议 ASCII 或中文都可以，**不要有空格**。

## 写一篇新文章

1. 复制 `posts/_template.md` 为 `posts/<slug>.md`。
2. 图片丢进 `assets/<slug>/`，正文里以 `../assets/<slug>/文件名` 引用。
3. 填 frontmatter：

   ```yaml
   ---
   title: 文章标题
   date: 2026-11-11          # 发布/写作日期，用于排序
   description: 一两句话摘要，会出现在列表和各种预览里
   tags: [Rho, Agent]        # 可选，会生成标签页
   draft: true               # 可选；写完删掉这一行才会发布
   ---
   ```

4. 正文用 Markdown。正文里**不要再写一级标题**（`#`）——文章标题由 frontmatter 的 `title` 渲染。
5. 提交并推送：

   ```bash
   git add -A && git commit -m "post: <slug>" && git push
   ```

   推送后站点会在当天凌晨自动重建；想立刻看到效果，去 Actions 里手动跑一次 `构建并发布博客`，或在 `main` 分支上 `make publish`。

## 注意

- 大文件（录屏 GIF、视频）会让页面很重：单张图片超过 2 MB 就想想能不能压一下或转成视频。
- 文章里的相对链接请指向真实存在的文件；构建不会帮你检查，图片挂了页面照样发布。