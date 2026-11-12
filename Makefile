# YuLab 课题组博客 —— 三分支工作流
#
#   main      博客系统（本目录）        ← 你在这里
#   docs      源文件：md + assets       ← 检出到 content/
#   gh-pages  渲染好的 html 产物        ← 由 public/ 发布上去
#
# 常用：
#   make install     安装依赖（首次）
#   make build       构建到 public/
#   make serve       本地预览（带热更新）
#   make publish     构建 + 提交 gh-pages 分支
#   make content     只确保 content/ 是 docs 分支的检出
#   make translate    把新文章预译成英文，写回 content/en/

SHELL := /bin/bash
CONTENT := content
OUT := public
PORT := 8090          # 本机 8080 已被别的服务占用；换端口用 make serve PORT=8080

.PHONY: help install content build serve translate publish clean

help:
	@sed -n '1,13p' Makefile | sed 's/^# \{0,1\}//'

install:
	npm ci

content:
	@scripts/ensure-content.sh

build: content
	npx quartz build -d $(CONTENT) -o $(OUT)

serve: content
	npx quartz build -d $(CONTENT) -o $(OUT) --serve --port $(PORT)

# 预生成英文译文（增量；需要本机 ~/.dsh/.credentials.yaml 里的 DeepSeek key）
translate: content
	python3 scripts/translate.py

publish: build
	@scripts/publish.sh

clean:
	rm -rf $(OUT) .quartz-cache