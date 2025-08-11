import { $, writeFileSync, existsSync } from "bun";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { ask, choose, closePrompts } from "../utils/prompts";
import { getExistingWorktrees, getExistingBranches } from "../utils/git";
import { getConfig, saveConfig, editorCommands } from "../utils/config";
import { saveSession, getLastSession } from "../utils/sessions";
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
      ? args[args.indexOf("--cwd") + 1]
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

  async function createWorktree(name: string) {
    const dir = `../${name}`;

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
  let editor = config.defaultEditor;
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
    folders: worktrees.map(w => ({ path: `../${w}` })),
    ...(config.workspaceTemplate || {})
  };
  writeFileSync("parallel-dev.code-workspace", JSON.stringify(workspace, null, 2));

  if (openEditor && !dryRun) {
    if (!(await commandExists(editorCommands[editor]))) {
      console.error(`❌ The editor CLI '${editorCommands[editor]}' is not installed or not in your PATH.`);
      process.exit(1);
    }
    await $`${editorCommands[editor]} parallel-dev.code-workspace`;
  }

  const save = await ask("Do you want to save this setup as a named session? (y/n): ");
  if (save.toLowerCase() === "y") {
    const sessionName = await ask("Enter session name: ");
    saveSession(sessionName, {
      worktrees,
      baseBranch,
      editor
    });
    console.log(`💾 Session '${sessionName}' saved.`);
  }

  console.log(dryRun ? "✅ Dry run complete!" : "✅ Setup complete!");
  closePrompts();
}