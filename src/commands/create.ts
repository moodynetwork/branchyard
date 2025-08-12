import { $ } from "bun";
import path from "node:path";
import fs, { existsSync, writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ask, choose, closePrompts } from "../utils/prompts";
import { getExistingWorktrees, getExistingBranches } from "../utils/git";
import { getConfig, saveConfig, editorCommands } from "../utils/config";
import { saveSession, getLastSession, getSession } from "../utils/sessions";
import { preflightCheck } from "../utils/preflight";
import { commandExists } from "../utils/system";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runCreate(args: string[]) {
  await preflightCheck(true, args.includes("--allow-subdir"));

  const baseBranch =
    args.includes("--base") && args[args.indexOf("--base") + 1]
      ? args[args.indexOf("--base") + 1]
      : "main";

  const noCreate = args.includes("--no-create");
  const openEditor = args.includes("--open");
  const dryRun = args.includes("--dry-run");
  const sequential = args.includes("--sequential");

  const cwd =
    args.includes("--cwd") && args[args.indexOf("--cwd") + 1]
      ? args[args.indexOf("--cwd") + 1]!
      : process.cwd();

  const worktrees = args.filter(
    (a) =>
      !a.startsWith("--") &&
      a !== baseBranch &&
      a !== cwd &&
      a !== "main" &&
      a !== "develop"
  );

  if (worktrees.length === 0) {
    console.error("❌ No worktree names provided.");
    process.exit(1);
  }

  process.chdir(cwd);

  const existingWorktrees = await getExistingWorktrees();
  const existingBranches = await getExistingBranches();

  // Check for worktrees in old location (parent directory)
  const oldLocationWorktrees = worktrees.filter(name => existsSync(`../${name}`));
  if (oldLocationWorktrees.length > 0) {
    console.log(`\n⚠️  Found worktrees in old location (parent directory):`);
    oldLocationWorktrees.forEach(name => console.log(`   ../${name}`));
    console.log(`\n💡 These should be removed with 'git worktree remove' or branchyard v1.2.x`);
    console.log(`   The new location will be: .worktrees/${oldLocationWorktrees.join(', ')}\n`);
    
    const proceed = await ask("Continue with creating worktrees in new location? (y/n): ");
    if (proceed.toLowerCase() !== 'y') {
      console.log("Aborted.");
      closePrompts();
      return;
    }
  }

  // Ensure .worktrees directory exists
  if (!dryRun && !existsSync('.worktrees')) {
    await $`mkdir -p .worktrees`;
  }

  async function createWorktree(name: string) {
    const dir = `.worktrees/${name}`;

    if (existingWorktrees.some((wt: any) => wt.branch === name)) {
      console.log(`❌ Branch '${name}' is already checked out in another worktree. Skipping.`);
      return;
    }

    if (existingBranches.includes(name)) {
      const reuse = await ask(
        `⚠️ Branch '${name}' already exists. Reuse it in a new worktree? (y/n): `
      );
      if (reuse.toLowerCase() !== "y") {
        console.log(`⏩ Skipping '${name}'`);
        return;
      }
    }

    if (existsSync(dir)) {
      console.log(`⚠️ Folder '${dir}' already exists. Skipping creation.`);
      return;
    }

    if (dryRun) {
      console.log(`[DRY-RUN] Would create worktree: ${name} from ${baseBranch}`);
    } else {
      console.log(`📂 Creating worktree: ${name} from ${baseBranch}`);
      await $`git worktree add ${dir} -b ${name} ${baseBranch}`;
    }
  }

  if (!noCreate) {
    if (!sequential && worktrees.length > 1) {
      console.log(`⏳ Creating ${worktrees.length} worktrees in parallel...`);
    }
    if (sequential) {
      for (const name of worktrees) {
        await createWorktree(name);
      }
    } else {
      await Promise.all(worktrees.map(name => createWorktree(name)));
    }
  }

  // Oprah Easter egg
  if (worktrees.length > 1) {
    const oprahPath = path.join(__dirname, "../assets/oprah.txt");
    if (fs.existsSync(oprahPath)) {
      console.log(fs.readFileSync(oprahPath, "utf-8"));
    }
    console.log("🌳 YOU GET A TREE! YOU GET A TREE! EVERYBODY GETS A TREE!");
  }

  let config = getConfig();
  let editor: string = config.defaultEditor || "";
  if (!editor) {
    editor = await choose("Select editor:", Object.keys(editorCommands));
    const remember = await ask("Set this as default editor? (y/n): ");
    if (remember.toLowerCase() === "y") {
      config.defaultEditor = editor;
      saveConfig(config);
    }
  }

  // Workspace generation with template merge
  const workspace = {
    folders: worktrees.map(w => ({ path: `.worktrees/${w}` })),
    ...(config.workspaceTemplate || {})
  };
  
  // Check if workspace file exists and might have old paths
  if (existsSync("parallel-dev.code-workspace")) {
    const existingWorkspace = JSON.parse(readFileSync("parallel-dev.code-workspace", "utf-8"));
    const hasOldPaths = existingWorkspace.folders?.some((f: any) => f.path?.startsWith('../'));
    if (hasOldPaths) {
      console.log(`📝 Updating workspace file with new paths (was using ../worktree, now .worktrees/worktree)`);
    }
  }
  
  writeFileSync("parallel-dev.code-workspace", JSON.stringify(workspace, null, 2));
  console.log(`📝 Created workspace file: parallel-dev.code-workspace`);

  // Ask to open workspace if not in dry-run mode and not already specified
  let shouldOpen = openEditor;
  if (!dryRun && !openEditor) {
    const openNow = await ask("Open workspace in editor now? (Y/n): ");
    shouldOpen = openNow.toLowerCase() !== 'n';
  }

  if (shouldOpen && !dryRun) {
    const editorCommand = editorCommands[editor];
    if (!editorCommand) {
      console.error(`❌ Unknown editor: ${editor}`);
      process.exit(1);
    }
    if (!(await commandExists(editorCommand))) {
      console.error(`❌ The editor CLI '${editorCommand}' is not installed or not in your PATH.`);
      process.exit(1);
    }
    console.log(`🚀 Opening workspace in ${editor}...`);
    await $`${editorCommand} parallel-dev.code-workspace`;
  } else if (!dryRun) {
    console.log(`\n💡 To open your workspace later, run:`);
    console.log(`   ${editorCommands[editor] || 'code'} parallel-dev.code-workspace`);
  }

  const save = await ask("Do you want to save this setup as a named session? (y/n): ");
  if (save.toLowerCase() === "y") {
    const sessionName = await ask("Enter session name: ");
    
    // Check if session already exists
    const existingSession = getSession(sessionName);
    if (existingSession) {
      const overwrite = await ask(`⚠️  Session '${sessionName}' already exists. Overwrite? (y/n): `);
      if (overwrite.toLowerCase() !== 'y') {
        console.log("Session not saved.");
      } else {
        saveSession(sessionName, {
          worktrees,
          baseBranch,
          editor
        });
        console.log(`💾 Session '${sessionName}' updated.`);
      }
    } else {
      saveSession(sessionName, {
        worktrees,
        baseBranch,
        editor
      });
      console.log(`💾 Session '${sessionName}' saved.`);
    }
  }

  if (dryRun) {
    console.log("✅ Dry run complete!");
  } else {
    console.log("\n✅ Setup complete!");
    console.log(`📁 Worktrees created in: .worktrees/`);
    console.log(`📝 Workspace file: parallel-dev.code-workspace`);
    if (!shouldOpen) {
      console.log(`\n💡 To start working, open the workspace:`);
      console.log(`   ${editorCommands[editor] || 'code'} parallel-dev.code-workspace`);
    }
  }
  closePrompts();
}