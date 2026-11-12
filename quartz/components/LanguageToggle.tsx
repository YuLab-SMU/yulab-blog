import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { FullSlug, resolveRelative } from "../util/path"

interface Options {
  /** 译文镜像目录，与 docs 分支里的目录名一致 */
  dir: string
  /** 从英文页切回中文时显示的文字 */
  zhLabel: string
  /** 从中文页切到英文时显示的文字 */
  enLabel: string
}

const defaultOptions: Options = {
  dir: "en",
  zhLabel: "中文",
  enLabel: "English",
}

/**
 * 中英文切换按钮。
 *
 * 约定：中文源文件在 content/<slug>.md，英文译文在 content/en/<slug>.md。
 * 只有对应的译文真的存在时才渲染按钮，避免出现死链。
 */
export default ((userOpts?: Partial<Options>) => {
  const opts: Options = { ...defaultOptions, ...userOpts }

  const LanguageToggle: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    const slug = fileData.slug as FullSlug | undefined
    if (!slug) return null

    const prefix = `${opts.dir}/`
    const isEn = slug === opts.dir || slug.startsWith(prefix)
    const target = isEn ? slug.slice(prefix.length) || "index" : `${prefix}${slug}`

    // 目录列表页（posts/index）不是源文件，allFiles 里没有它，但 FolderPage 一定会
    // 为镜像目录生成对应的列表页。所以再检查一次「目标目录下有没有内容」。
    const dirPrefix = target.replace(/\/index$/, "")
    const exists =
      allFiles.some((f) => f.slug === target) ||
      allFiles.some((f) => f.slug?.startsWith(`${dirPrefix}/`))
    if (!exists) return null

    let href = resolveRelative(slug, target as FullSlug)
    // 列表页用带斜杠的目录地址，避免服务器再做一次 301
    if (target.endsWith("/index") && !href.endsWith("/")) {
      href = `${href}/` as typeof href
    }

    return (
      <div class={classNames(displayClass, "language-toggle")}>
        <a
          href={href}
          class="internal"
          hreflang={isEn ? "zh-CN" : "en"}
          lang={isEn ? "zh-CN" : "en"}
        >
          {isEn ? opts.zhLabel : opts.enLabel}
        </a>
      </div>
    )
  }

  LanguageToggle.css = `
.language-toggle {
  text-align: right;
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
}
.language-toggle > a {
  display: inline-block;
  padding: 0.1rem 0.7rem;
  border: 1px solid var(--lightgray);
  border-radius: 999px;
  color: var(--secondary);
  text-decoration: none;
}
.language-toggle > a:hover {
  border-color: var(--tertiary);
  color: var(--tertiary);
}
`

  return LanguageToggle
}) satisfies QuartzComponentConstructor
