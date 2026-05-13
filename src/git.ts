import { execa } from "execa";

export async function getStagedDiff(): Promise<string>{
  const { stdout } = await execa("git", ["diff", "--staged"]);

  if(!stdout.trim()){
    throw new Error("No staged changes found. Please stage your changes first.");
  }

  return stdout;
}

export async function commit(message: string): Promise<void>{
  await execa("git", ["commit", "-m", message], {
    stdio: "inherit"
  });
}