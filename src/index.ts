#!/usr/bin/env node

import "dotenv/config";
import { Command } from "commander";
import { select, confirm } from "@inquirer/prompts";
import { getStagedDiff, commit } from "./git.js";
import { generateCommitMessages } from "./ai.js";

const program = new Command();

program
  .name("commit-ai")
  .description("Generate commit messages from staged git changes using AI.")
  .version("0.1.0")
  .option("-c, --commit", "commit using the selected message")
  .action(async (options) => {
    try {
      const diff = await getStagedDiff();
      const messages = await generateCommitMessages(diff);

      const selected = await select({
        message: "Choose a commit message:",
        choices: messages.map((message) => ({
          name: message,
          value: message
        }))
      });

      const shouldCommit =
        options.commit ||
        (await confirm({
          message: "Commit with this message?",
          default: false
        }));

      if (shouldCommit) {
        await commit(selected);
      } else {
        console.log(`\n${selected}`);
      }
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();