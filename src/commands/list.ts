import { $ } from "bun";
import { getExistingWorktrees } from "../utils/git";

export async function runList() {
  const worktrees = await getExistingWorktrees();

  if (worktrees.length === 0) {
    console.log("No active worktrees.");
    return;
  }

  console.log("🌳 Active worktrees:");
  console.log("─".repeat(60));

  for (const wt of worktrees) {
    const branch = wt.branch;
    const path = wt.path;
    const commit = wt.commit;
    
    // Get age of last commit
    let age = "unknown";
    try {
      const result = await $`git -C ${path} log -1 --format="%cr"`.quiet();
      age = result.text().trim();
    } catch {}

    console.log(`📁 ${branch}`);
    console.log(`   Path: ${path}`);
    console.log(`   Commit: ${commit}`);
    console.log(`   Last activity: ${age}`);
    console.log("─".repeat(60));
  }
}