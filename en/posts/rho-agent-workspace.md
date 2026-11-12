---
title: "From \"AI does it for me\" to \"AI does it with me\": the new Agent analysis experience Rho brings"
date: 2026-11-11
author: 夏永和
description: "Introducing Rho: a tool that lets researchers and AI Agents collaborate in the same analysis workspace — it puts what the Agent did, what it produced, and which parts need your decision in concrete places."
tags:
  - Rho
  - Agent
  - 数据分析
lang: en
translated_from: e8d3b6b4722f5cac
---

**Online preview Demo:** [yulab-smu.top/Rho](https://yulab-smu.top/Rho)

> As the homepage says, *See what your Agent did.* The new version of Rho is responsible for showing and organizing, in real time, the actions, artifacts, and decisions of Agents and people within the workflow between users and Agents. The specific display of these different types of elements is handled by plugins, while the layout arrangement is maintained jointly by the Agent and the person.

---

## 1. Agent Can Already Help Us with Analysis

- For more and more people, the first step in doing analysis is to open an Agent.
- Agents are fast: writing code, running analyses, and producing plots can be done in minutes.
- Being fast does not mean we can use it, dare to use it, or can keep changing it.

![Information overload after the rise of Agents](/assets/rho-agent-workspace/01-信息过载.gif)

We have indeed been accelerated, and we even got the kind of treatment the protagonist in a Hongguo short drama gets—we had a system.
But an Agent is like a wild horse, and it often makes people feel unable to rein it in.

## 2. The Analysis Is Done, but I Can't Carry It Forward

- Have an Agent finish an analysis once, and you get scripts, result tables, and a few plots.
- Next, you want to understand a particular result or change a condition.
- But you have to dig through the conversation again, find files, and explain which version you mean.
- The project is mine, yet I have become a bystander.

![The project is mine, but I have become a bystander](/assets/rho-agent-workspace/02-旁观者.jpeg)

## 3. Where the Difficulty Lies

- Analysis tasks are complex to begin with, and Agents produce a large number of scripts, tables, and figures.
- In between, many decisions may need me to make, but front-loading decisions is not user-friendly; before you have even started, no decision feels quite safe.

![Biomni requires many decisions before the task begins](/assets/rho-agent-workspace/03-决策前置.png)

*Screenshot from an automated analysis Agent: Biomni requires many decisions before the task begins.*

- Facing these artifacts, what we really want to know is:
  - What question does this figure answer?
  - What data was used?
  - Why analyze it this way?
  - Which choices need my judgment?
  - After changing a condition, how do the results change?

![Biomni produces a large number of files and conclusions after the task ends](/assets/rho-agent-workspace/04-产物堆积.png)

*Screenshot from an automated analysis Agent: Biomni produces a large number of files and conclusions after the task ends.*

- Current state: code is crammed into the conversation window, and files are scattered everywhere. Scattered scripts, files, and long conversations make it laborious to sort out relationships and confirm what needs to be changed.

Overall, the conversation transcript, as a single carrier, bears too much: command lines, artifacts, and decisions—especially the decisions an Agent forces users to make before starting, and the decisions an Agent quietly makes for users after analysis begins. Everything is buried in one chat log.

## 4. I Want the Agent to Bring Me Along

What should ideal collaboration look like?

- **Help me understand:** what question each result answers, and which data and steps it comes from.
- **Prompt me to decide:** when a key choice comes up, the Agent explains the options and rationale and asks me to decide.
- **Let me continue making changes:** I point at a result and make a request, and the Agent can pick it up accurately.
- Division of labor in one sentence: **The Agent leads the way; the decisions are yours.**

## 5. What Rho Is

- Rho was built to solve these problems.
- Definition: **Rho is an analysis workspace where researchers and AI Agents work together. You can view data, edit code, run analyses, and continue discussing specific results around the same project.**
- Don't reinvent an Agent: use Rho directly in the Agent you already use—and, of course, you can also use your favorite Agent inside Rho.
- As shown in the screenshot of Rho's interface below:
  1. Code, data tables, and figures live in the same workspace, and execution records stay here too.
  2. The Agent can put content relevant to the current question in front of you and walk you through it.
  3. You can select a result to ask follow-up questions or request changes, and the Agent continues working with the corresponding context.

Rho has no fixed interface; it starts from a blank page.

![Rho starts from a blank page: step 1, state the task](/assets/rho-agent-workspace/05-白纸开局.png)

The Agent grows the interface as it works, and you can help arrange and operate these interfaces too.

![The Agent grows the interface as it works](/assets/rho-agent-workspace/06-界面生长.gif)

You can even rerun a piece of code yourself, edit a piece of text, or simply give an instruction about something; the timeline play button can also take you through the entire analysis again.

![Timeline replay of the whole analysis process](/assets/rho-agent-workspace/07-时间轴回放.gif)

The summary interface after a task ends.

![The summary interface after a task ends](/assets/rho-agent-workspace/08-总结界面.png)

## 6. What Rho Can Do

That line on the homepage, See what your Agent did, maps to three kinds of things in the interface: what the Agent and you **did**, what you **produced**, and what **needs your decision**. Below, I'll walk through Rho's features with a small project. The project uses the classic airway data: four airway smooth muscle cell lines, each with one dexamethasone-treated and one untreated sample.

![Opening a project: pages and sources on the left, the answer board in the middle, and the Agent panel on the right](/assets/rho-agent-workspace/09-界面一览.png)

### 1. What Was Done: Every Step Is Visible

- **Agent panel**: chat directly with Claude Code or Codex inside Rho. What it read, which commands it ran, and which files it changed are listed step by step, and you can stop it at any time. No matter which page you are viewing, the top bar shows what it is doing.

![The Agent panel lists every step, and the top bar shows what it is doing](/assets/rho-agent-workspace/10-Agent面板.png)

- **Console**: every command the Agent has run is here, with why it ran, how long it took, and which files it changed. You can run your own commands here too.

![Console: every command, why it ran, and which files it changed](/assets/rho-agent-workspace/11-Console.png)

- **Timeline**: both Graph and Studio have a timeline. You can replay the entire analysis at 1×, 2×, or 4×, or stop at any moment.

### 2. What Was Produced: Results, Provenance, and Every Version

- **Answer board**: each answer is laid out on a page. The question and answer are at the top, the main figures and tables come first, and the method scripts, commands run, and data read come afterward.

![Answer board: question, answer, and differential gene table](/assets/rho-agent-workspace/12-回答板.png)

- **Every version is kept**: every time a file changes, Rho keeps a version. After the volcano plot is changed, click the arrow to return to the previous version, and the whole workspace returns to that moment as well.

![Back to a previous version: time stops at 00:54, and the volcano plot is version 3 of 4](/assets/rho-agent-workspace/13-回到上一版.png)

- **Graph**: draw an analysis as a graph. Start from the question, connect to findings and choices, then to the result files they are based on, and finally to the scripts and commands that produced those files.

![Graph: which files support the conclusions, and how those files came to be](/assets/rho-agent-workspace/14-Graph.png)

- **Sources**: data, code, variables, results and figures, and notes are listed by type on the left. Click to open them, and use ← and → to flip through them one by one.

### 3. What Needs Your Decision: Placed in Concrete Places

- **Places that need your judgment**: I added the sentence “list separately the places that need my judgment” to the task, and the Agent listed five in its answer: thresholds, whether to pair samples, whether to shrink log2FC, which genes to label on the plot, and duplicate gene names. Unlike decisions forced on you before work begins, at this point you already have results to refer to.

![Places that need your judgment](/assets/rho-agent-workspace/15-需要你判断的地方.png)

- **Key choices and the alternative**: below the answer board, the Agent's key choices are listed, noting which approach was used and what the alternative would yield. For example, without pairing yields 878 differentially expressed genes, while pairing yields 999. Click “Use this instead…”, and Rho will draft a message for you; edit it and send it to the Agent.

![Key choices: which approach was used, and what the alternative would yield](/assets/rho-agent-workspace/16-关键选择与另一种做法.png)

- **Point at a result and speak**: every result has Ask, and you can also select a passage in an answer and Ask about this. The message carries the file and version you pointed at, so you no longer have to explain “which figure I mean”.

![Making a request on the volcano plot](/assets/rho-agent-workspace/17-指着结果提问.png)

- **Record the decision**: after reading an answer, click “Use this answer” or “Needs changes”. Rho records your decision and which file versions it corresponds to.

- **Keep the approach around**:

  - In the shared note project-notes.md, the Agent writes a section for each task: question, data and methods, key results, choices, and to-dos. You can edit it directly.
  - Skills records how this project does things. I asked the Agent to “record the labeling rules as a Skill for this project”, and 27 seconds later it appeared on the Skills page; from then on, every Agent working in this project will read it.

![Skills: this project's practices, which every Agent will read](/assets/rho-agent-workspace/18-Skills.png)

### 4. Work Together, Arrange Together

- **Share one R / Python session**: you can continue running code that the Agent ran in the Notebook in the same session. Each cell is marked with who ran it and why. Click Explore in R on a table, and the table is read into the session. Variables, figures, and Data flow (which file and which cell each value comes from) can be viewed side by side.

![Sharing an R session with the Agent: my own cell, Data flow, and figures](/assets/rho-agent-workspace/19-共用R会话.png)

- **Studio**: the Agent arranges the scripts, figures, tables, and commands used in a conversation by role. You can drag, split the screen, add views, or create your own workspace.

![Studio: the scripts, figures, tables, and commands from one conversation](/assets/rho-agent-workspace/20-Studio.png)

- **Plugins**: tables, figures, documents, Notebook, Console, and Skills—each of these views is provided by a plugin, and 12 are currently installed.

![Plugins](/assets/rho-agent-workspace/21-插件.png)

### 5. Use Your Own Agent

- Rho does not reinvent an Agent. What you use in Rho is your own Claude Code or Codex, and you choose the model on the Agent page.

- Or the other way around: click once on the Agent page to add Rho to your Claude Code or Codex in the terminal. It works as usual in the terminal, and what it does is shown in Rho.

![Connect Rho to your own Claude Code or Codex](/assets/rho-agent-workspace/22-接入你自己的Agent.png)

- The conversation list records the model, context usage, and cost for each conversation. You can continue chatting or export to Markdown.

## 7. How to Get Started

We have prepared a Rho Skill for Agents, which guides your Agent through installing Rho and using Rho in subsequent analyses.

Prompt:

```text
请阅读 https://yulab-smu.top/Rho/doc/setup.md 文档，按照步骤为我安装并配置 Rho。
```

## 8. Where Things Stand Now

- Scope of support: runs naturally in Agent workflows, and you can open the interactive workspace in a browser; you can perform desktop-style operations directly on artifacts, such as editing Markdown, and editing and running R and Python analyses produced by the Agent; the interactive workspace can also launch an Agent chat box.
- Project repository: [github.com/YuLab-SMU/Rho](https://github.com/YuLab-SMU/Rho)
- Online demo: [yulab-smu.top/Rho](https://yulab-smu.top/Rho/) (replays a real session on an example project; you can see the interface without installing)
- Feedback: [github.com/YuLab-SMU/Rho/issues](https://github.com/YuLab-SMU/Rho/issues)


![User group QR code](/assets/rho-agent-workspace/feishu-group.jpg)


## 9. Closing

- With Rho, you no longer have to scramble over the pile of things an Agent produces.
- After completing a round of analysis, you understand it better, and you can keep going, follow along, and repeat it.
- You can move from “AI does it for me” to “AI does it with me”.
