#!/usr/bin/env bun

import { runCreate } from "./commands/create";
import { runRemove } from "./commands/remove";
import { runList } from "./commands/list";
import { runPrune } from "./commands/prune";
import { runInteractive } from "./commands/interactive";
import { runConfig } from "./commands/config";
import { getSession, saveSession, listSessions, deleteSession } from "./utils/sessions";
import { preflightCheck } from "./utils/preflight";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);

async function printHelp() {
  console.log(`
⚓ branchyard v1.2.0
Your shipyard for parallel development workflows.

USAGE:
  branchyard                                    Interactive mode
  branchyard <names...> [flags]                Create worktrees
  branchyard --remove <names...> [flags]       Remove worktrees
  branchyard list                              List worktrees
  branchyard prune [--auto] [--dry-run]        Prune orphaned worktrees
  branchyard save-session <name>               Save current session
  branchyard restore [name]                    Restore session
  branchyard sessions                          List sessions
  branchyard delete-session <name>             Delete session
  branchyard config                            Configure settings

FLAGS:
  --base <branch>    Base branch (default: main)
  --no-create        Skip worktree creation
  --open             Open in editor after setup
  --cwd <path>       Main repo path
  --dry-run          Preview changes
  --force            Overwrite existing folders
  --allow-subdir     Allow running from subdir
  --sequential       Run operations sequentially
  --fun              Trigger Easter egg
  --help             Show this help

EXAMPLES:
  branchyard feature-x bugfix-y --base develop --open
  branchyard --remove feature-x bugfix-y
  branchyard restore sprint-42
`);
}

async function main() {
  if (args.length === 0) {
    await runInteractive();
    return;
  }

  if (args.includes("--help") || args.includes("-h")) {
    await printHelp();
    return;
  }

  if (args.includes("--fun")) {
    const oprahPath = path.join(__dirname, "assets/oprah.txt");
    if (fs.existsSync(oprahPath)) {
      console.log(fs.readFileSync(oprahPath, "utf-8"));
    }
    console.log("🌳 YOU GET A TREE! YOU GET A TREE! EVERYBODY GETS A TREE!");
    return;
  }

  const [command] = args;

  switch (command) {
    case "list":
      await runList();
      break;

    case "prune":
      await runPrune(args.slice(1));
      break;

    case "config":
      await runConfig();
      break;

    case "save-session":
      if (!args[1]) {
        console.error("❌ Session name required.");
        process.exit(1);
      }
      await preflightCheck(false, false);
      const sessionData = {
        worktrees: [],
        baseBranch: "main",
        editor: "vscode"
      };
      saveSession(args[1], sessionData);
      console.log(`💾 Session '${args[1]}' saved.`);
      break;

    case "restore":
      const sessionName = args[1];
      const session = sessionName ? getSession(sessionName) : getLastSession();
      if (!session) {
        console.error(`❌ Session '${sessionName || "last"}' not found.`);
        process.exit(1);
      }
      console.log(`📂 Restoring session with ${session.worktrees.length} worktrees...`);
      await runCreate([
        ...session.worktrees,
        "--base", session.baseBranch,
        "--open"
      ]);
      break;

    case "sessions":
      const sessions = listSessions();
      if (Object.keys(sessions).length === 0) {
        console.log("No saved sessions.");
      } else {
        console.log("📁 Saved sessions:");
        for (const [name, data] of Object.entries(sessions)) {
          console.log(`  - ${name} (${(data as any).worktrees?.length || 0} worktrees)`);
        }
      }
      break;

    case "delete-session":
      if (!args[1]) {
        console.error("❌ Session name required.");
        process.exit(1);
      }
      deleteSession(args[1]);
      console.log(`🗑 Session '${args[1]}' deleted.`);
      break;

    default:
      if (args.includes("--remove")) {
        await runRemove(args);
      } else {
        await runCreate(args);
      }
  }
}

main().catch(console.error);