import { $ } from "bun";
import { getExistingWorktrees } from "../utils/git";

export async function runPrune(args: string[]) {
  const auto = args.includes("--auto");
  const dryRun = args.includes("--dry-run");
  const worktrees = await getExistingWorktrees();

  if (auto) {
    const branches = (await $`git branch --list --format="%(refname:short)"`.quiet())
      .text()
      .split("\n")
      .map(b => b.trim())
      .filter(Boolean);

    let pruned = 0;
    for (const wt of worktrees) {
      if (!branches.includes(wt.branch)) {
        if (dryRun) {
          console.log(`[DRY-RUN] Would remove orphaned worktree: ${wt.branch}`);
          pruned++;
        } else {
          console.log(`🗑 Removing orphaned worktree: ${wt.branch}`);
          await $`git worktree remove --force ${wt.path}`;
          pruned++;
        }
      }
    }

    if (pruned === 0) {
      console.log("✅ No orphaned worktrees found.");
    } else if (dryRun) {
      console.log(`\n✅ Dry run complete! Would prune ${pruned} worktree(s).`);
    } else {
      console.log(`\n✅ Pruned ${pruned} orphaned worktree(s).`);
    }
    return;
  }

  console.log("Manual prune not yet implemented. Use --auto flag for automatic pruning.");
}