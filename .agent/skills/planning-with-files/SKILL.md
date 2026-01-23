---
name: planning-with-files
description: Structured planning for complex tasks using persistent markdown files (task_plan.md, findings.md, progress.md).
---

# Planning with Files

This skill implements a persistent "working memory" on disk using Markdown files. It ensures that goals, research, and progress are tracked across long sessions and not lost in the AI context window.

## Core Protocol

### 1. Auto-Activation
Trigger this skill for:
- Complex tasks or multi-step projects.
- Research-intensive tasks.
- Projects requiring >5 steps.

### 2. The Three Files
When activated, create/update these files in the project root:
- `task_plan.md`: Phases, current status, and architectural decisions.
- `findings.md`: Research notes, code snippets, and discoveries. Saved every 2 search/view actions.
- `progress.md`: Step-by-step log of actions, test results, and checkpoints.

### 3. Read Before Decide
Before any major implementation or architectural decision, re-read `task_plan.md` to ensure alignment with original goals.

### 4. 3-Strike Error Protocol
1. **Diagnosis:** Understand the root cause.
2. **Alternative:** Try a different approach if the first fix fails.
3. **Rethink:** Step back and re-evaluate the strategy.
4. **Escalate:** Ask the user if 3 attempts fail.

## Templates

### task_plan.md
```markdown
# Task Plan: [Task Name]

## 🎯 Goal
[Brief description of the end goal]

## 🏗️ Architecture & Decisions
- [Decision 1]
- [Decision 2]

## 🗓️ Phases
- [ ] Phase 1: Research & Discovery
- [ ] Phase 2: Implementation
- [ ] Phase 3: Testing & Verification
- [ ] Phase 4: Polish & Documentation

## 🚩 Current Status
- Current Phase: [Phase X]
- Next Action: [Action Y]
```

### findings.md
```markdown
# Findings & Research

## 🔍 Discoveries
- [Discovery 1]
- [Discovery 2]

## 💡 Code Snippets / Insights
[Code or insights]
```

### progress.md
```markdown
# Progress Log

## 📝 Session Log
- [Timestamp] Started task.
- [Timestamp] Created planning files.
```
