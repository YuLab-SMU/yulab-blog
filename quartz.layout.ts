import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// ---------- 小工具 ----------
const isIndexPage = (page: { fileData: { slug?: string } }) => page.fileData.slug === "index"
const isPost = (f: { slug?: string }) => (f.slug ?? "").startsWith("posts/")

// 所有页面共用的部分
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      "课题组主页": "https://yulab-smu.top/",
      GitHub: "https://github.com/YuLab-SMU",
      "公众号 Y叔 余光创": "https://yulab-smu.top/images/biobabble.jpg",
    },
  }),
}

// 单篇文章页
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs({ rootName: "首页" }),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ConditionalRender({
      component: Component.ContentMeta(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
  // 首页正文下方列出最新文章
  afterBody: [
    Component.ConditionalRender({
      component: Component.RecentNotes({
        title: "最新文章",
        limit: 5,
        linkToMore: "posts",
        showTags: true,
        filter: isPost,
      }),
      condition: isIndexPage,
    }),
  ],
}

// 列表页（目录、标签）
export const defaultListPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs({ rootName: "首页" }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [],
}