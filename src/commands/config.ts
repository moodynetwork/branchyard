import { choose, ask, closePrompts } from "../utils/prompts";
import { getConfig, saveConfig, editorCommands } from "../utils/config";

export async function runConfig() {
  const config = getConfig();
  
  const action = await choose("Configure branchyard:", [
    "Set default editor",
    "Configure workspace template",
    "View current config",
    "Reset config",
    "Exit"
  ]);

  switch (action) {
    case "Set default editor": {
      const editor = await choose("Select default editor:", Object.keys(editorCommands));
      config.defaultEditor = editor;
      saveConfig(config);
      console.log(`✅ Default editor set to: ${editor}`);
      break;
    }

    case "Configure workspace template": {
      console.log("📝 Enter workspace template JSON (or press Enter to skip):");
      console.log("Example: {\"settings\": {\"editor.formatOnSave\": true}}");
      const template = await ask("");
      
      if (template) {
        try {
          const parsed = JSON.parse(template);
          config.workspaceTemplate = parsed;
          saveConfig(config);
          console.log("✅ Workspace template saved!");
        } catch (e) {
          console.error("❌ Invalid JSON. Template not saved.");
        }
      }
      break;
    }

    case "View current config": {
      console.log("📋 Current configuration:");
      console.log(JSON.stringify(config, null, 2));
      break;
    }

    case "Reset config": {
      const confirm = await ask("⚠️ Reset all configuration? (y/n): ");
      if (confirm.toLowerCase() === "y") {
        saveConfig({});
        console.log("✅ Configuration reset!");
      }
      break;
    }

    case "Exit": {
      break;
    }
  }

  closePrompts();
}