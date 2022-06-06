import { continueAsNew } from "@temporalio/workflow";

import { getForcedChoice, printForced } from "../api/force";
import { logger } from "../logger";
import { settings } from "../settings";
import { formatEntryData } from "../utils/entries";
import { checkRepeatedly } from "../utils/repeats";
import { collectConsensus } from "../utils/voting";
import { activities } from "./activities";
import * as wf from "@temporalio/workflow";

export interface RunGameOptions {
  entry: string;
}

export const stateQuery = wf.defineQuery<string>('gamestate');

export async function runGame({ entry }: RunGameOptions) {
  logger.info("Running game at", entry);
  wf.setHandler(stateQuery, () => entry);
  const game = await activities.getGame("UNUSED_GAME_NAME");
  const gameEntries = game.gameEntries.filter((x) => x.name == entry);
  if(gameEntries.length == 0){
    logger.info("No choice: the game is over.");
    await activities.postMessage({
      notify: true,
      text: `
      ...and, that is the end of the game. Thanks for playing everyone! :end:
      `.trim(),
    });
    return;
  }

  const gameEntry = gameEntries[0]
  const { options } = gameEntry;

  // 1. If the entry has no options, the game is over
  if (!options || options.length == 0) {
    logger.info("No choice: the game is over.");
    await activities.postMessage({
      notify: true,
      text: `
${gameEntry.description.join("\n")}
...and, that's the end of the game. Thanks for playing everyone! :end:
`.trim(),
    });
    return;
  }

  // 2. ensure there is at least one description, even if it is an empty message
  if(gameEntry.description.length == 0){
    gameEntry.description.push("");
  }

  // 3. Post the current entry as a poll with the remaining content
  const announcement = await activities.createPoll({
    choices: options.map((option) => option.description),
    prompt: `${formatEntryData(gameEntry)}`,
  });
  logger.info(`Posted poll with message ID ${announcement}.`);

  // 4. Check and remind people to vote once a day until either...
  // * ...a choice is made by consensus
  // * ...an admin forces a choice
  const { choice, forced } = await Promise.race([
    checkRepeatedly(settings.interval, async () => {
      const reactions = await activities.getReactions({
        messageId: announcement,
      });

      const consensus = collectConsensus(options, reactions);

      switch (consensus) {
        case "none":
          await activities.postMessage({
            notify: true,
            text: `Well, nobody posted, so... waiting another ${settings.interval}!`,
          });
          return undefined;

        case "tie":
          await activities.postMessage({
            notify: true,
            text: `Looks like there's a tie! Waiting another ${settings.interval} for you make up your minds.`,
          });
          return undefined;

        default:
          return consensus;
      }
    }),
    getForcedChoice(options),
  ]);

  // 5. If the choice was forced by an admin, mention that
  if (forced !== undefined) {
    logger.info("Forcing choice from:", forced);
    await activities.postMessage({
      text: printForced(forced),
    });
  }

  // 6. Continue with that chosen next step in the game
  logger.info("Received choice to continue:", choice);
  await continueAsNew({ entry: choice });
}
