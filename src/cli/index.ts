#!/usr/bin/env node

import "dotenv/config";
import { Command } from "commander";
import { select, confirm } from "@inquirer/prompts";
import { getStagedDiff, commit } from "./git";
import { generateCommitMessages } from "./ai";

const program = new Command();

program
  .name("commit-ai")
  .description("Generate commit messages from staged git changes using AI.")
  .version("0.1.0")
  .option("-c, --commit", "commit using the selected message")
  .action(async (options) => {
    try {
      const diff = await getStagedDiff();
      let messages = await generateCommitMessages(diff);

      while (true) {
        const REROLL = "___reroll___";

        const selected = await select({
          message: "Choose a commit message:",
          choices: [
            ...messages.map((message) => ({
              name: message,
              value: message,
            })),
            { name: "Re-roll suggestions", value: REROLL },
          ],
        });

        if (selected === REROLL) {
          messages = await generateCommitMessages(diff);
          continue;
        }

        const shouldCommit =
          options.commit ||
          (await confirm({
            message: "Commit with this message?",
            default: false,
          }));

        if (shouldCommit) {
          await commit(selected);
        } else {
          console.log(`\n${selected}`);
        }

        break;
      }
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();