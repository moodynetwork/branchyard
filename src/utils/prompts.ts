const decoder = new TextDecoder();

export async function ask(question: string): Promise<string> {
  process.stdout.write(question);
  const buf = new Uint8Array(1024);
  const n = await Bun.stdin.stream().reader.read(buf);
  return decoder.decode(buf.subarray(0, n.value || 0)).trim();
}

export async function choose(question: string, options: string[]): Promise<string> {
  console.log(question);
  options.forEach((opt, i) => console.log(`  ${i + 1}. ${opt}`));
  
  while (true) {
    const answer = await ask("Enter choice (number): ");
    const num = parseInt(answer);
    if (num >= 1 && num <= options.length) {
      return options[num - 1];
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
  
  const selected = [];
  const nums = answer.split(" ").map(s => parseInt(s.trim()));
  
  for (const num of nums) {
    if (num >= 1 && num <= options.length) {
      selected.push(options[num - 1]);
    }
  }
  
  return selected;
}

export function closePrompts() {
  // Placeholder for any cleanup needed
}