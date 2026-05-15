import { execa } from "execa";

export async function getStagedDiff(): Promise<string>{
  try {
    const { stdout } = await execa("git", ["diff", "--staged"]);

    if(!stdout.trim()){
      throw new Error("No staged changes found. Please stage your changes first.");
    }

    return stdout;
  }
  catch (error) {
    if (error instanceof Error && error.message.includes("not a git repository")) {
      throw new Error("Not a git repository. Run this tool from inside a git project.");
    }
    throw error;
  }
}

export async function commit(message: string): Promise<void>{
  await execa("git", ["commit", "-m", message], {
    stdio: "inherit"
  });
}