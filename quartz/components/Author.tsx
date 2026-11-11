import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import style from "./styles/contentMeta.scss"

interface Options {
  /**
   * frontmatter 里取作者的字段名，按顺序找第一个非空的
   */
  fields: string[]
  /**
   * 显示前缀
   */
  prefix: string
}

const defaultOptions: Options = {
  fields: ["author", "authors"],
  prefix: "作者：",
}

/**
 * 文章作者（来自 frontmatter 的 `author` 或 `authors`）。
 * 没有作者时什么都不渲染，所以可以直接放进所有内容页的布局里。
 */
export default ((userOpts?: Partial<Options>) => {
  const opts: Options = { ...defaultOptions, ...userOpts }

  const Author: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
    const frontmatter = (fileData.frontmatter ?? {}) as Record<string, unknown>
    const raw = opts.fields.map((field) => frontmatter[field]).find((value) => value != null)

    const names = Array.isArray(raw) ? raw.map((name) => String(name)) : raw ? [String(raw)] : []
    if (names.length === 0) {
      return null
    }

    return (
      <p class={classNames(displayClass, "content-meta", "author")}>
        {`${opts.prefix}${names.join("、")}`}
      </p>
    )
  }

  Author.css = style

  return Author
}) satisfies QuartzComponentConstructor
