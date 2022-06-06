import express from "express";

import { getEnv, settings } from "../../settings";
import { GetStatus, HandleText } from "../types";

interface SlackMessageBody {
  text: string;
}

export const createSlackExpressServer = async (handleText: HandleText, getStatus: GetStatus) => {
  console.log("in createSlackExpressServer")
  const app = express().use(express.urlencoded({ extended: true }));

  app.get("/", async (_, response) => {
    const message = await getStatus("UNUSED_PARAM");
    response.status(200).send(message).end();
  });

  app.post("/", async (request, response) => {
    const { text } = request.body as SlackMessageBody;
    console.log("Received Slack POST with text:", text);

    const message = await handleText(text);
    console.log("Sending back Slack message:", message);

    response.status(200).send(message).end();
  });
  console.log("app.listen")
  const environment = getEnv()
  const server = app.listen(environment.PORT);

  return () => {
    server.close();
  };
};
