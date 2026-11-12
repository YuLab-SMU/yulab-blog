#!/usr/bin/env python3
"""把 content/ 里的中文 Markdown 预译成英文，写到 content/en/ 镜像目录。

设计：译文是**静态文件**，提交进 docs 分支，CI 只负责渲染。这样页面上点一下
「English」就能切换，不需要在浏览器里调任何翻译 API，也不用把密钥放进前端。

增量：译文 frontmatter 里记 `translated_from`（源文件的短 hash），源没变就跳过。
要重翻就加 --force。

用法：
    python3 scripts/translate.py                     # 只翻新增/改动的
    python3 scripts/translate.py --force             # 全部重翻
    python3 scripts/translate.py --dry-run           # 只列出会翻哪些
    python3 scripts/translate.py --file posts/foo.md  # 只翻一篇

凭据读 ~/.dsh/.credentials.yaml 的 refs.DEEPSEEK_API_KEY，不写进仓库。
只用 Python 标准库，不联网装依赖。
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
EN_DIR = CONTENT / "en"
API_URL = "https://api.deepseek.com/v1/chat/completions"
MODEL = "deepseek-flash"

# 不翻译的专有名词，写进 system prompt 让各段保持一致
GLOSSARY = (
    "Rho, Agent, Claude Code, Codex, Skills, Graph, Studio, Console, Notebook, "
    "Ask about this, Use this answer, Needs changes, Biomni, R, Python, airway, "
    "log2FC, Markdown, GitHub, YuLab, SMU, clusterProfiler, ggtree, treeio, "
    "Y叔 余光创 (the WeChat account name, keep it verbatim)"
)

SYS_BODY = f"""You translate a Chinese technical blog post into English for an international audience of bioinformaticians.

Rules:
- Translate ONLY the natural-language prose. Keep all Markdown syntax exactly as it is: heading markers (#, ##, ###), list markers and their indentation, bold/italic markers, blockquote markers (>), horizontal rules (---), fenced code blocks and EVERYTHING inside them, tables, and HTML tags.
- Keep URLs, file paths, image paths, command names, and inline code spans unchanged.
- Keep these names in their original English form, never translate or transliterate them: {GLOSSARY}.
- Preserve every paragraph break and every blank line exactly.
- Do NOT add, remove, reorder, or summarize anything. Do NOT explain your work.
- Output ONLY the translated Markdown, with no preface and no enclosing code fences."""

SYS_META = f"""You translate the title and the one-sentence description of a Chinese technical blog post into English.
Keep these names untranslated: {GLOSSARY}.
Be faithful and concise; do not add claims that are not in the original.
Return a JSON object with exactly two keys: "title" and "description"."""


def api_key() -> str:
    """从 dsh 的凭据文件里取 key；也允许用环境变量覆盖（CI 里用）。"""
    env = os.environ.get("DEEPSEEK_API_KEY")
    if env:
        return env
    cred = Path.home() / ".dsh" / ".credentials.yaml"
    try:
        # 只需要 refs.DEEPSEEK_API_KEY 一行，手写提取以免依赖 PyYAML
        m = re.search(
            r'^\s*DEEPSEEK_API_KEY:\s*["\']?([^"\'\s#]+)["\']?',
            cred.read_text(encoding="utf-8"),
            re.M,
        )
        if not m:
            raise ValueError("文件里没有 DEEPSEEK_API_KEY 行")
        return m.group(1)
    except Exception as e:
        raise SystemExit(
            f"拿不到 DEEPSEEK_API_KEY（{cred} 或环境变量 DEEPSEEK_API_KEY）：{e}"
        ) from e


def call_llm(system: str, user: str, max_tokens: int, key: str, json_mode: bool = False) -> str:
    payload: dict = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "max_tokens": max_tokens,
        "stream": False,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    req = urllib.request.Request(
        API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}"},
    )
    last_err: Exception | None = None
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=180) as resp:
                data = json.load(resp)
            choice = data["choices"][0]
            if choice.get("finish_reason") == "length":
                raise RuntimeError("输出被 max_tokens 截断，请把文章拆短或调大上限")
            return str(choice["message"]["content"]).strip()
        except (urllib.error.URLError, TimeoutError, KeyError, RuntimeError) as e:
            last_err = e
            print(f"  LLM 调用失败（第 {attempt + 1} 次）：{e}", file=sys.stderr)
    raise SystemExit(f"LLM 连续 3 次失败，放弃：{last_err}")


def split_frontmatter(text: str) -> tuple[list[str], str]:
    """把 '---' 块切成 (frontmatter 行列表, 正文)。"""
    lines = text.split("\n")
    if not lines or lines[0].strip() != "---":
        return [], text
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            return lines[1:i], "\n".join(lines[i + 1 :]).lstrip("\n")
    return [], text


def fm_value(fm: list[str], key: str) -> str:
    for line in fm:
        m = re.match(rf"^{re.escape(key)}:\s*(.*)$", line)
        if m:
            return m.group(1).strip().strip('"').strip("'")
    return ""


def yaml_str(value: str) -> str:
    """JSON 字符串是合法的 YAML 双引号标量，能安全地包住冒号、# 和引号。"""
    return json.dumps(value, ensure_ascii=False)


def rebuild_frontmatter(fm: list[str], title: str, description: str) -> list[str]:
    """只替换 title / description，其余行（date、author、tags…）原样保留，末尾标记语言。"""
    out: list[str] = []
    has_title = has_desc = False
    for line in fm:
        if re.match(r"^title:\s*", line):
            out.append(f"title: {yaml_str(title)}")
            has_title = True
        elif re.match(r"^description:\s*", line):
            out.append(f"description: {yaml_str(description)}")
            has_desc = True
        elif re.match(r"^(lang|translated_from):\s*", line):
            continue  # 由脚本重新生成
        else:
            out.append(line)
    if not has_title:
        out.insert(0, f"title: {yaml_str(title)}")
    if not has_desc:
        out.append(f"description: {yaml_str(description)}")
    out.append("lang: en")
    return out


def source_hash(fm: list[str], body: str) -> str:
    """只对真正影响译文的内容做 hash：标题、摘要、正文。"""
    payload = fm_value(fm, "title") + "\n" + fm_value(fm, "description") + "\n" + body
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:16]


def translate_one(src: Path, key: str, force: bool, dry_run: bool) -> str:
    rel = src.relative_to(CONTENT)
    dst = EN_DIR / rel
    text = src.read_text(encoding="utf-8")
    fm, body = split_frontmatter(text)

    if "draft: true" in "\n".join(fm) or "draft: \"true\"" in "\n".join(fm):
        return "skip (draft)"

    digest = source_hash(fm, body)
    if dst.exists() and not force:
        old_fm, _ = split_frontmatter(dst.read_text(encoding="utf-8"))
        if fm_value(old_fm, "translated_from") == digest:
            return "skip (unchanged)"

    if dry_run:
        return "would translate"

    title = fm_value(fm, "title")
    desc = fm_value(fm, "description")

    print(f"  翻译 {rel} …", file=sys.stderr)
    meta_raw = call_llm(
        SYS_META,
        f"title: {title}\ndescription: {desc}",
        max_tokens=800,
        key=key,
        json_mode=True,
    )
    try:
        meta = json.loads(meta_raw)
        title_en, desc_en = str(meta["title"]).strip(), str(meta["description"]).strip()
    except (json.JSONDecodeError, KeyError) as e:
        raise SystemExit(f"{rel} 的元数据没有返回合法 JSON：{meta_raw[:200]} ({e})") from e

    body_en = call_llm(SYS_BODY, body, max_tokens=16000, key=key)
    # 译文在 en/ 镜像目录里，图片用「站点根相对」路径；Quartz 会按页面深度
    # 自动补 ../，得到正确的相对地址。不要写成 ../../assets/ —— 那样会和
    # Quartz 自己的 pathToRoot 叠加，多跳一层，英文页图片会 404。
    body_en = re.sub(r"(\]\()\.\./assets/", r"\1/assets/", body_en)
    body_en = body_en.strip()

    new_fm = rebuild_frontmatter(fm, title_en, desc_en)
    new_fm.append(f"translated_from: {digest}")
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text("---\n" + "\n".join(new_fm) + "\n---\n\n" + body_en + "\n", encoding="utf-8")
    return "translated"


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--force", action="store_true", help="忽略增量缓存，全部重翻")
    ap.add_argument("--dry-run", action="store_true", help="只列出会翻哪些文件，不调用 LLM")
    ap.add_argument("--file", help="只处理指定的一个文件（相对 content/）")
    args = ap.parse_args()

    if not CONTENT.is_dir():
        raise SystemExit(f"找不到 content/：{CONTENT}（先跑 make content）")

    sources = sorted(
        p
        for p in CONTENT.rglob("*.md")
        if EN_DIR not in p.parents
        and p.name != "README.md"
        and not p.name.startswith("_")
    )
    if args.file:
        sources = [p for p in sources if str(p.relative_to(CONTENT)) == args.file]
        if not sources:
            raise SystemExit(f"--file 没匹配到：{args.file}")

    key = "" if args.dry_run else api_key()
    counts: dict[str, int] = {}
    for src in sources:
        result = translate_one(src, key, args.force, args.dry_run)
        counts[result] = counts.get(result, 0) + 1
        print(f"{result:>17}  {src.relative_to(CONTENT)}")
    print("\n".join(f"{k}: {v}" for k, v in sorted(counts.items())))


if __name__ == "__main__":
    main()