import express from "express";

import { settings } from "../../settings";
import { HandleText } from "../types";

interface SlackMessageBody {
  text: string;
}

export const createSlackExpressServer = async (handleText: HandleText) => {
  console.log("in createSlackExpressServer")
  const app = express().use(express.urlencoded({ extended: true }));

  app.get("/", (_, response) => {
    response.status(200).send().end();
  });

  app.post("/", async (request, response) => {
    const { text } = request.body as SlackMessageBody;
    console.log("Received Slack POST with text:", text);

    const message = await handleText(text);
    console.log("Sending back Slack message:", message);

    response.status(200).send(message).end();
  });
  console.log("app.listen")
  const server = app.listen(settings.port);

  return () => {
    server.close();
  };
};
