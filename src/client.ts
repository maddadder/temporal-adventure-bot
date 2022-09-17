import { Connection, WorkflowClient } from "@temporalio/client";
import { WorkflowExecutionAlreadyStartedError } from '@temporalio/common';
import { receiveCommandText } from "./api/force";
import { queryState } from "./api/query";
import { platformFactory } from "./platforms/factory";
import { getEnv, settings } from "./settings";
import { instructions, runGame } from "./workflows";

async function run() {
  console.log("getEnv");
  const environment = getEnv()
  const executionOptions = {
    taskQueue: environment.TASK_QUEUE,
    workflowId: environment.WORKFLOW_ID,
  };
  console.log("1. Create a connection to the Temporal service and a workflow client against it")
  const connection = new Connection({
    // // Connect to localhost with default ConnectionOptions.
    // // In production, pass options to the Connection constructor to configure TLS and other settings:
     address: 'temporaltest-frontend-headless', // as provisioned
    // tls: {} // as provisioned
  });
  const client = new WorkflowClient(connection.service);

  console.log("2. Retrieve a handle to the client workflow so admin commands can signal to it")
  const gameHandle = client.getHandle(executionOptions.workflowId);

  console.log("3. Start an HTTP server to receive /force commands")
  const { createServer } = platformFactory();
  const closeServer = await createServer(
    /*handleText:*/ async (text) => await receiveCommandText(gameHandle, text),
    /*getStatus: */ async (text) => await queryState(gameHandle, text)
  );

  console.log("4. Log and pin channel-wide instructions just once")
  try {
    await client.execute(instructions, executionOptions);
  } catch (e: any) {
    if (e instanceof WorkflowExecutionAlreadyStartedError) {
      console.log('Already started workflow ' + executionOptions.workflowId);
    }
  }
  

  console.log("5. Start the workflow that checks once a day for choice consensus")
  const runningGame = client.execute(runGame, {
    args: [
      {
        entry: "begin",
      },
    ],
    ...executionOptions,
  });

  console.log("6. Wait for the result of finishing the game, then close the server")
  try {
    await runningGame;
  } catch (e: any) {
    if (e instanceof WorkflowExecutionAlreadyStartedError) {
      console.log('Already started workflow ' + executionOptions.workflowId);
      await gameHandle.result();
    }
  }
  console.log("7. Closing Server")
  closeServer();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
