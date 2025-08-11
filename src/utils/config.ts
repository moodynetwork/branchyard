import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";

const CONFIG_PATH = path.join(process.env.HOME || "", ".branchyardrc");

const ConfigSchema = z.object({
  defaultEditor: z.string().optional(),
  workspaceTemplate: z.record(z.any()).optional()
});

export const editorCommands: Record<string, string> = {
  vscode: "code",
  cursor: "cursor",
  windsurf: "windsurf",
  trae: "trae",
  zed: "zed"
};

export function getConfig() {
  if (!existsSync(CONFIG_PATH)) return {};
  try {
    const parsed = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
    const result = ConfigSchema.safeParse(parsed);
    if (!result.success) {
      console.error("❌ Invalid config file. Please fix or delete ~/.branchyardrc");
      console.error(result.error.format());
      process.exit(1);
    }
    return result.data;
  } catch {
    console.error("❌ Failed to read config file. Please fix or delete ~/.branchyardrc");
    process.exit(1);
  }
}

export function saveConfig(config: Record<string, any>) {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}