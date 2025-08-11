import { $ } from "bun";

export async function getExistingWorktrees() {
  try {
    const output = await $`git worktree list --porcelain`.quiet();
    const text = output.text();
    const worktrees = [];
    
    let current: any = {};
    for (const line of text.split("\n")) {
      if (line.startsWith("worktree ")) {
        if (current.path) worktrees.push(current);
        current = { path: line.substring(9) };
      } else if (line.startsWith("HEAD ")) {
        current.commit = line.substring(5);
      } else if (line.startsWith("branch ")) {
        current.branch = line.substring(7).replace("refs/heads/", "");
      }
    }
    if (current.path) worktrees.push(current);
    
    // Filter out the main worktree (current directory)
    return worktrees.filter(wt => !wt.path.endsWith(process.cwd()));
  } catch (e) {
    console.error("❌ Failed to get worktrees:", e);
    return [];
  }
}

export async function getExistingBranches() {
  try {
    const output = await $`git branch --list --format="%(refname:short)"`.quiet();
    return output.text().split("\n").map(b => b.trim()).filter(Boolean);
  } catch (e) {
    console.error("❌ Failed to get branches:", e);
    return [];
  }
}

export async function isGitRepo() {
  try {
    await $`git rev-parse --git-dir`.quiet();
    return true;
  } catch {
    return false;
  }
}

export async function getRepoRoot() {
  try {
    const output = await $`git rev-parse --show-toplevel`.quiet();
    return output.text().trim();
  } catch {
    return null;
  }
}

export async function getCurrentBranch() {
  try {
    const output = await $`git branch --show-current`.quiet();
    return output.text().trim();
  } catch {
    return "unknown";
  }
}