import { WorkflowHandle } from "@temporalio/client";
import { Workflow } from "@temporalio/common";

export const queryState = async (
  gameHandle: WorkflowHandle<Workflow>,
  text: string
) => {
  try {
    return await gameHandle.query<string>('gamestate');
  } catch (e) {
    console.error(e);
    return "UNKNOWN GAME STATE";
  }
}
