import { Worker, NativeConnection } from '@temporalio/worker';

import { createActivities } from "./activities";
import { platformFactory } from "./platforms/factory";
import { settings } from "./settings";

async function run() {
  console.log("platformFactory");
  const { createIntegration } = platformFactory();
  console.log("createIntegration");
  const integration = await createIntegration();
  console.log("Worker.create");
  const connection = await NativeConnection.create({
    address: 'temporaltest-frontend-headless', // defaults port to 7233 if not specified
  });
  const worker = await Worker.create({
    connection,
    workflowsPath: require.resolve("./workflows"),
    activities: createActivities(integration),
    sinks: {
      logger: {
        info: {
          fn(workflowInfo, message, data?) {
            console.log(
              "workflow: ",
              workflowInfo.runId,
              "message: ",
              message,
              ...(data ? [JSON.stringify(data)] : [])
            );
          },
        },
      },
    },
    taskQueue: settings.taskQueue,
  });
  console.log("worker.run");
  await worker.run();
}

run().catch((err) => {
  console.error("Oh no:", err);
  process.exit(1);
});
