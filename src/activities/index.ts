import { Integration } from "../platforms/types";
import { createPoll } from "./createPoll";
import { getReactions } from "./getReactions";
import { pinMessage } from "./pinMessage";
import { postMessage } from "./postMessage";
import { getGame } from "./getGame";

export const createActivities = (integration: Integration) => ({
  createPoll: createPoll.bind(null, integration),
  getReactions: getReactions.bind(null, integration),
  pinMessage: pinMessage.bind(null, integration),
  postMessage: postMessage.bind(null, integration),
  getGame: getGame.bind(null, integration)
});
