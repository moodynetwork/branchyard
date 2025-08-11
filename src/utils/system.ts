import { $ } from "bun";

export async function commandExists(command: string): Promise<boolean> {
  try {
    if (process.platform === "win32") {
      await $`where ${command}`.quiet();
    } else {
      await $`which ${command}`.quiet();
    }
    return true;
  } catch {
    return false;
  }
}