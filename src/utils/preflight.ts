import { $ } from "bun";
import { isGitRepo, getRepoRoot, getCurrentBranch } from "./git";
import { commandExists } from "./system";
import { colorette } from "colorette";

export async function preflightCheck(showInfo: boolean = true, allowSubdir: boolean = false) {
  // Check for Bun (already running if we got here)
  
  // Check for Git
  if (!(await commandExists("git"))) {
    console.error("❌ Git is not installed or not in PATH.");
    console.error("Please install Git: https://git-scm.com/");
    process.exit(1);
  }

  // Check if in a git repository
  if (!(await isGitRepo())) {
    console.error("❌ Not in a Git repository.");
    console.error("Please run branchyard from inside a Git repository.");
    process.exit(1);
  }

  if (showInfo) {
    const cwd = process.cwd();
    const repoRoot = await getRepoRoot();
    const branch = await getCurrentBranch();

    console.log("🔍 Pre-flight check:");
    console.log(`   Current directory: ${cwd}`);
    console.log(`   Repository root: ${repoRoot}`);
    console.log(`   Current branch: ${branch}`);

    if (cwd !== repoRoot && !allowSubdir) {
      console.warn("\n⚠️  Warning: Not in repository root!");
      console.warn("   This may cause unexpected behavior.");
      console.warn("   Use --allow-subdir to suppress this warning.");
      console.warn("");
    }
  }
}