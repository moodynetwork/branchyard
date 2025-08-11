import { choose, ask, multiSelect, closePrompts } from "../utils/prompts";
import { runCreate } from "./create";
import { runRemove } from "./remove";
import { runList } from "./list";
import { getSession, listSessions } from "../utils/sessions";
import { preflightCheck } from "../utils/preflight";

export async function runInteractive() {
  await preflightCheck(false, false);

  const action = await choose("What would you like to do?", [
    "Create worktrees",
    "Remove worktrees",
    "List worktrees",
    "Restore session",
    "Exit"
  ]);

  switch (action) {
    case "Create worktrees": {
      const names = await ask("Enter worktree names (space-separated): ");
      const base = await ask("Base branch (default: main): ") || "main";
      const open = await ask("Open in editor? (y/n): ");
      
      const args = names.split(" ").filter(Boolean);
      args.push("--base", base);
      if (open.toLowerCase() === "y") args.push("--open");
      
      await runCreate(args);
      break;
    }

    case "Remove worktrees": {
      await runRemove([]);
      break;
    }

    case "List worktrees": {
      await runList();
      break;
    }

    case "Restore session": {
      const sessions = listSessions();
      const sessionNames = Object.keys(sessions);
      
      if (sessionNames.length === 0) {
        console.log("No saved sessions.");
        break;
      }

      const sessionName = await choose("Select session:", sessionNames);
      const session = getSession(sessionName);
      
      if (!session) {
        console.error(`❌ Session '${sessionName}' not found.`);
        break;
      }

      console.log(`📂 Restoring session with ${session.worktrees.length} worktrees...`);
      await runCreate([
        ...session.worktrees,
        "--base", session.baseBranch,
        "--open"
      ]);
      break;
    }

    case "Exit": {
      console.log("👋 Goodbye!");
      break;
    }
  }

  closePrompts();
}