import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { SimpleSlug } from "./quartz/util/path"

// ---------- 小工具 ----------
const isZhIndex = (page: { fileData: { slug?: string } }) => page.fileData.slug === "index"
const isEnIndex = (page: { fileData: { slug?: string } }) => page.fileData.slug === "en/index"
const isHome = (page: { fileData: { slug?: string } }) => isZhIndex(page) || isEnIndex(page)
const isPost = (f: { slug?: string }) => (f.slug ?? "").startsWith("posts/")
const isEnPost = (f: { slug?: string }) => (f.slug ?? "").startsWith("en/posts/")

// 所有页面共用的部分
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  // 两个首页各列自己语言的最新文章
  afterBody: [
    Component.ConditionalRender({
      component: Component.RecentNotes({
        title: "最新文章",
        limit: 5,
        linkToMore: "posts" as SimpleSlug,
        showTags: true,
        filter: isPost,
      }),
      condition: isZhIndex,
    }),
    Component.ConditionalRender({
      component: Component.RecentNotes({
        title: "Recent posts",
        limit: 5,
        linkToMore: "en/posts" as SimpleSlug,
        showTags: false,
        filter: isEnPost,
      }),
      condition: isEnIndex,
    }),
  ],
  footer: Component.Footer({
    links: {
      课题组主页: "https://yulab-smu.top/",
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
      condition: (page) => !isHome(page),
    }),
    Component.ArticleTitle(),
    Component.LanguageToggle(),
    Component.Author(),
    Component.ConditionalRender({
      component: Component.ContentMeta(),
      condition: (page) => !isHome(page),
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
    Component.Explorer({
      filterFn: (node) => node.slugSegment !== "tags" && node.slugSegment !== "en",
    }),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// 列表页（目录、标签）。注意：Quartz 的 ContentPage 会跳过所有 */index，
// 所以英文首页 en/index.html 也是走这个布局（由 FolderPage 渲染），首页不该有面包屑和日期。
export const defaultListPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs({ rootName: "首页" }),
      condition: (page) => !isHome(page),
    }),
    Component.ArticleTitle(),
    Component.LanguageToggle(),
    Component.ConditionalRender({
      component: Component.ContentMeta(),
      condition: (page) => !isHome(page),
    }),
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
    Component.Explorer({
      filterFn: (node) => node.slugSegment !== "tags" && node.slugSegment !== "en",
    }),
  ],
  right: [],
}
