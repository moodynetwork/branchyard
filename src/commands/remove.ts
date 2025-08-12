import { $ } from "bun";
import { ask, multiSelect, closePrompts } from "../utils/prompts";
import { getExistingWorktrees } from "../utils/git";
import { preflightCheck } from "../utils/preflight";

export async function runRemove(args: string[]) {
  await preflightCheck(false, args.includes("--allow-subdir"));

  const dryRun = args.includes("--dry-run");
  const force = args.includes("--force");
  const sequential = args.includes("--sequential");
  let deleteBranch = args.includes("--delete-branch");
  
  const worktreesToRemove = args.filter(
    (a) => !a.startsWith("--")
  );

  if (worktreesToRemove.length === 0) {
    const existing = await getExistingWorktrees();
    if (existing.length === 0) {
      console.log("No worktrees to remove.");
      closePrompts();
      return;
    }

    const selected = await multiSelect(
      "Select worktrees to remove:",
      existing.map((wt: any) => wt.branch)
    );
    worktreesToRemove.push(...selected);
  }

  if (worktreesToRemove.length === 0) {
    console.log("No worktrees selected.");
    closePrompts();
    return;
  }

  // Ask about branch deletion if not already specified
  if (!deleteBranch && !dryRun) {
    const answer = await ask("Also delete the git branches? (y/N): ");
    deleteBranch = answer.toLowerCase() === 'y';
  }

  if (force) {
    const confirm1 = await ask("⚠️ Force removal will delete uncommitted changes. Continue? (y/n): ");
    if (confirm1.toLowerCase() !== "y") {
      console.log("Aborted.");
      closePrompts();
      return;
    }

    const confirm2 = await ask("⚠️ Are you absolutely sure? Type 'yes' to confirm: ");
    if (confirm2.toLowerCase() !== "yes") {
      console.log("Aborted.");
      closePrompts();
      return;
    }
  }

  async function removeWorktree(name: string) {
    const existing = await getExistingWorktrees();
    const worktree = existing.find((wt: any) => wt.branch === name);
    
    if (!worktree) {
      console.log(`⚠️ Worktree '${name}' not found.`);
      return;
    }

    if (dryRun) {
      console.log(`[DRY-RUN] Would remove worktree: ${name} at ${worktree.path}`);
      if (deleteBranch) {
        console.log(`[DRY-RUN] Would delete branch: ${name}`);
      }
    } else {
      console.log(`🗑 Removing worktree: ${name}`);
      const forceFlag = force ? "--force" : "";
      await $`git worktree remove ${forceFlag} ${worktree.path}`;
      
      if (deleteBranch) {
        console.log(`🗑 Deleting branch: ${name}`);
        try {
          await $`git branch -D ${name}`;
        } catch (error) {
          console.log(`⚠️ Could not delete branch '${name}'. It might be checked out elsewhere or protected.`);
        }
      }
    }
  }

  if (!sequential && worktreesToRemove.length > 1) {
    console.log(`⏳ Removing ${worktreesToRemove.length} worktrees in parallel...`);
  }

  if (sequential) {
    for (const name of worktreesToRemove) {
      await removeWorktree(name);
    }
  } else {
    await Promise.all(worktreesToRemove.map(name => removeWorktree(name)));
  }

  if (dryRun) {
    console.log("✅ Dry run complete!");
  } else {
    console.log(deleteBranch ? "✅ Worktrees and branches removed!" : "✅ Worktrees removed!");
  }
  closePrompts();
}