export async function ask(question: string): Promise<string> {
  // Use Bun's built-in prompt which handles cleanup automatically
  const answer = prompt(question);
  return answer || "";
}

export async function choose(question: string, options: string[]): Promise<string> {
  console.log(question);
  options.forEach((opt, i) => console.log(`  ${i + 1}. ${opt}`));
  
  while (true) {
    const answer = await ask("Enter choice (number): ");
    const num = parseInt(answer);
    if (num >= 1 && num <= options.length) {
      return options[num - 1]!;
    }
    console.log("Invalid choice. Please try again.");
  }
}

export async function multiSelect(question: string, options: string[]): Promise<string[]> {
  console.log(question);
  console.log("(Enter numbers separated by spaces, or 'all' for all)");
  options.forEach((opt, i) => console.log(`  ${i + 1}. ${opt}`));
  
  const answer = await ask("Enter choices: ");
  
  if (answer.toLowerCase() === "all") {
    return options;
  }
  
  const selected: string[] = [];
  const nums = answer.split(" ").map(s => parseInt(s.trim()));
  
  for (const num of nums) {
    if (num >= 1 && num <= options.length) {
      selected.push(options[num - 1]!);
    }
  }
  
  return selected;
}

export function closePrompts() {
  // Ensure stdin is closed to prevent hanging
  if (process.stdin.isTTY) {
    process.stdin.pause();
  }
}