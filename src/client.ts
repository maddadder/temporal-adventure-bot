import { Connection, WorkflowClient } from "@temporalio/client";

import { receiveCommandText } from "./api/force";
import { platformFactory } from "./platforms/factory";
import { settings } from "./settings";
import { instructions, runGame } from "./workflows";

const executionOptions = {
  taskQueue: settings.taskQueue,
  workflowId: settings.workflowId,
};

async function run() {
  console.log("1. Create a connection to the Temporal service and a workflow client against it")
  const connection = new Connection({
    // // Connect to localhost with default ConnectionOptions.
    // // In production, pass options to the Connection constructor to configure TLS and other settings:
     address: 'temporaltest-frontend-headless', // as provisioned
    // tls: {} // as provisioned
  });
  const client = new WorkflowClient(connection.service);

  console.log("1.1. Retrieve a handle to the client workflow so admin commands can signal to it")
  const gameHandle = client.getHandle(executionOptions.workflowId);

  console.log("1.2. Start an HTTP server to receive /force commands")
  const { createServer } = platformFactory();
  const closeServer = await createServer(
    async (text) => await receiveCommandText(gameHandle, text)
  );

  console.log("2. Log and pin channel-wide instructions just once")
  await client.execute(instructions, executionOptions);

  console.log("3. Start the workflow that checks once a day for choice consensus")
  const runningGame = client.execute(runGame, {
    args: [
      {
        entry: "begin",
      },
    ],
    ...executionOptions,
  });

  console.log("6. Wait for the result of finishing the game, then close the server")
  await runningGame;
  closeServer();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
