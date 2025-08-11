# ⚓ branchyard
>
> Your shipyard for parallel development workflows. AI-era ready.

A developer’s repo is their yard and their pride.
Everyone keeps their yards manicured.

**branchyard** gives you the tools to maintain your **digital yard** —
keeping your branches clean, your workflow productive,
and your development environment perfectly organized.

---

<p align="center">
  <img src="https://github.com/SivaramPg/branchyard/blob/abd7fe45ccd6601551ae61c0cf1cc0117a36eb08/assets/oprah-meme.png?raw=true" alt="You get a tree! You get a tree! Everybody gets a tree!" width="500" />
</p>

<p align="center"><em>You get a tree! You get a tree! Everybody gets a tree! 🌳</em></p>

---

## ❓ Why branchyard?

Parallel development is powerful but messy with raw `git worktree`:

- Switching branches constantly breaks focus
- Running multiple features in parallel is error-prone
- Managing worktrees manually is tedious and risky

**branchyard** solves this by:

- Automating safe worktree creation/removal
- Managing multiple editors and sessions
- Adding safety checks, dry-run mode, and fun touches
- Keeping *everything* in one place — no hidden docs, no guesswork

---

## 🌱 Project Philosophy

*branchyard* is built on three principles:

1. **Be Playful**
   We believe tools should have personality.
   From ASCII Oprah to the yard pride story, *branchyard* reflects the people who build it.

2. **Be Clear**
   Every feature, every flag, every capability is documented here in the README.
   No hidden features, no buried docs — everything you need is in one place.

3. **Empower the User**
   Whether *branchyard* is right for you or not, you’ll know after reading this README.
   Our goal is to give you the best possible shot at making the right choice for your workflow.

---

## 🖥 System Requirements

*branchyard* works on **Windows**, **macOS**, and **Linux**.

### Required

- **[Bun](https://bun.sh/)** — JavaScript runtime (v1.0+)
  If Bun is missing, *branchyard* will exit with a clear error.
- **[Git](https://git-scm.com/)** — must be installed and available in your system `PATH`
  If Git is missing, *branchyard* will exit with a clear error.

### Optional (for `--open` flag)

- **Editor CLI command** installed and available in `PATH`:
  - VS Code → `code`
  - Cursor → `cursor`
  - Windsurf → `windsurf`
  - Trae → `trae`
  - Zed → `zed`
  If the selected editor CLI is missing, *branchyard* will exit with a clear error.

### Notes

- On **Windows**, you can use *branchyard* from:
  - PowerShell
  - Command Prompt
  - Git Bash
- On **macOS/Linux**, any modern terminal will work.
- ASCII art Easter eggs (like Oprah) require a UTF-8 capable terminal (most modern terminals support this by default).

---

## ✨ Features

### Worktree Management

- Create multiple worktrees from any base branch
- Remove worktrees safely (with dry-run mode)
- Bulk remove multiple worktrees at once
- List active worktrees with branch, path, last commit, and age

### Safety First

- **Pre-flight checks**:
  - Git installed
  - Inside a Git repo
  - Show current directory, repo root, and branch
  - Warn if not in repo root (with `--allow-subdir` for monorepos)
- Dry-run mode (`--dry-run`) to preview changes
- Double-confirm force mode (`--force`) to prevent overwrites
- Triple checks before creating worktrees

### Interactive Mode

- Guided prompts for creating, removing, listing, and restoring
- Branch auto-suggestions
- Multi-select worktree removal
- Editor selection (VS Code, Cursor, Windsurf, Trae, Zed)
- Auto-prompt to save setup as a **named session**

### Multi-Editor Support

- Open worktrees in your preferred editor
- Save default editor in `~/.branchyardrc`
- Easily extendable for future editors

### Named Sessions

- Save a setup with `branchyard save-session <name>`
- Restore with `branchyard restore [name]` (auto-recreates missing worktrees)
- List sessions with `branchyard sessions`
- Delete sessions with `branchyard delete-session <name>`

### Workspace Automation

- Generates `.code-workspace` with all worktrees
- Merges with a **custom template** from `~/.branchyardrc`
- Supports settings, extensions, and more

---

## 📦 Installation

### Using Bun (recommended)

```bash
bun install -g branchyard
```

### From source

```bash
git clone https://github.com/YOUR_USERNAME/branchyard.git
cd branchyard
bun link
```

---

## 🚀 Usage

### Interactive Mode

```bash
branchyard
```

Guided prompts for creating, removing, listing, and restoring worktrees.
**Pre-flight check** runs first to show:

- Current directory
- Repo root
- Current branch
- Warn if not in repo root

---

### Create Worktrees

```bash
branchyard agent-factory upgrades-marketplace --base develop --open
```

- Creates `agent-factory` and `upgrades-marketplace` from `develop`
- Opens them in your default editor

---

### Remove Worktrees

```bash
branchyard --remove agent-factory upgrades-marketplace
```

With dry-run:

```bash
branchyard --remove agent-factory --dry-run
```

---

### List Worktrees

```bash
branchyard list
```

Shows all active worktrees with branch, commit, and age.

---

### Save a Session

```bash
branchyard save-session sprint-42
```

---

### Restore a Session

```bash
branchyard restore sprint-42
```

If no name is given:

```bash
branchyard restore
```

Restores the last saved session.

---

### List Sessions

```bash
branchyard sessions
```

---

### Delete a Session

```bash
branchyard delete-session sprint-42
```

---

## 🏷 Flags Reference

| Flag             | Description |
|------------------|-------------|
| `--base <branch>`| Base branch to create worktrees from (default: main) |
| `--no-create`    | Skip creating worktrees, only regenerate workspace/tasks |
| `--open`         | Open in default editor after setup |
| `--cwd <path>`   | Path to main repo (default: current directory) |
| `--dry-run`      | Show what would happen without making changes |
| `--force`        | Overwrite existing folders (requires double confirmation) |
| `--allow-subdir` | Allow running from a subfolder in a monorepo without warning |
| `--fun`          | Trigger Easter egg output |
| `--sequential`   | Run operations sequentially instead of in parallel |

---

## 🔍 Comparison: Raw `git worktree` vs branchyard

| Task | Raw `git worktree` | branchyard |
|------|--------------------|------------|
| Create 2 worktrees | `git worktree add ../foo foo && git worktree add ../bar bar` | `branchyard foo bar` |
| Remove worktree | `git worktree remove ../foo` | `branchyard --remove foo` |
| List worktrees | `git worktree list` | `branchyard list` (with branch, commit, age) |
| Restore session | *(manual)* | `branchyard restore my-session` |

---

## 🎉 Fun Features

We take productivity seriously… but we also believe your tools should make you smile.

- **Easter Eggs**: Create more than one worktree at a time and… well, you’ll see. 😉
- **On-Demand Fun**: Run `branchyard --fun` to instantly trigger one of our Easter eggs.
- **CLI Personality**: *branchyard* isn’t just functional — it’s got character.
- **Shareable Moments**: Some outputs are just begging to be screenshotted and shared.

> 💡 Tip: Keep an eye out for special surprises when you’re working in parallel.

---

## 🛠 Troubleshooting

**Error: Git not found**

- Install Git: <https://git-scm.com/>

**Error: Bun not found**

- Install Bun: <https://bun.sh/>

**Error: Editor CLI not found**

- Enable your editor's CLI in PATH (e.g., VS Code → `code` command)

---

## 🛣 Roadmap

### ✅ Shipped in v1.2.0

- **Worktree pruning (auto mode + dry-run)** — `branchyard prune --auto` with safe preview before deletion.
- **Git hook integration** — Auto-prune orphaned worktrees on branch delete (see README for hook setup).
- **Parallel operations** — Bulk create/remove with `Promise.all()` and progress indicators.
- **Config validation** — Zod schema validation for config and sessions to prevent corruption.
- **Workspace generation enhancements** — Merge custom `workspaceTemplate` from `~/.branchyardrc` into `.code-workspace`.

### 🚀 Next Up (v1.3.0)

- **Interactive session restore** — Pick from list instead of typing name.
- **Manual prune mode** — Interactive pruning with selection.

### 🔮 Future Releases

- **Named session switching** — `branchyard switch <name>` to close current session and open another.
- **Session metadata** — Store and optionally re-run last commands for a session.
- **Editor profiles per session** — Different sessions can have different default editors.
- **Remote sync for sessions** — Cloud/Gist backup.
- **Dual distribution** — Standalone binaries for Windows/macOS/Linux.
- **Enhanced progress bars** — Real-time progress visualization.

---

## 🧩 Workspace Template Example

You can customize the generated `.code-workspace` by adding a `workspaceTemplate` to your `~/.branchyardrc`:

```json
{
  "workspaceTemplate": {
    "settings": {
      "editor.formatOnSave": true,
      "typescript.tsdk": "node_modules/typescript/lib"
    },
    "extensions": {
      "recommendations": ["dbaeumer.vscode-eslint"]
    }
  }
}
```

This template will be merged with the generated `folders` array for your worktrees.

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Open a PR

---

## 📜 License

MIT License — feel free to use, modify, and share.

---

## 💡 Inspiration

A developer’s repo is their yard and their pride.
**branchyard** helps you keep your digital yard manicured —
clean branches, productive workflows, AI-era ready.
