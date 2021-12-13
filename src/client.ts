import { Connection, WorkflowClient, WorkflowHandle } from "@temporalio/client";
import { Workflow } from "@temporalio/common";

import { receiveCommandText } from "./api/force";
import { platformFactory } from "./platforms/factory";
import { settings } from "./settings";
import { delay } from "./utils/time";
import { instructions, runGame } from "./workflows";
import { startGame } from "./workflows/startGame";

const executionOptions = {
  taskQueue: settings.taskQueue,
  workflowId: settings.workflowId,
};

async function run() {
  // 1. Create a connection to the Temporal service and a workflow client against it
  const connection = new Connection();
  const client = new WorkflowClient(connection.service);

  // 2. While the game workflow is running, this variable will be populated
  let gameHandle: WorkflowHandle<Workflow> | undefined;

  // 3. Start an HTTP server to receive /force commands
  const { createServer } = platformFactory();
  await createServer(
    async (text) => await receiveCommandText(gameHandle, text)
  );

  // 4. Log and pin channel-wide instructions just once,
  // then wait a half second to avoid triggering Slack API rate limits
  await client.execute(instructions, executionOptions);
  await delay("0.5 seconds");

  // 5. Start the game loop of announcing the current game entry,
  // again waiting a half second to avoid triggering Slack API rate limits
  await client.execute(startGame, executionOptions);
  await delay("0.5 seconds");

  // 6. Start the workflow that checks once a day for choice consensus
  const runningGame = client.execute(runGame, {
    args: [
      {
        entry: "begin",
      },
    ],
    ...executionOptions,
  });

  // 7. Store that workflow handle during the game in case of admin /force
  gameHandle = client.getHandle(executionOptions.workflowId);
  await runningGame;
  gameHandle = undefined;
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
