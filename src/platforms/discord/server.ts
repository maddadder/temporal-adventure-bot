import express from "express";

import { getEnv } from "../../settings";
import { HandleText } from "../types";
import { getDiscordClient } from "./client";

export const createDiscordExpressServer = async (handleText: HandleText) => {

  const client = await getDiscordClient();

  client.on("ready", async () => {
    await client.application.commands.create({
      description: "Force an adventure choice",
      name: "force",
      options: [
        {
          description: "'random' or a number for an option.",
          required: true,
          name: "choice",
          type: "STRING",
        },
      ],
    });
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand() || interaction.commandName !== "force") {
      return;
    }

    const text = interaction.options.get("choice")?.value;
    if (!text || typeof text !== "string") {
      await interaction.reply(`Uhh, what is ${text ? `'${text}'` : "this"}?`);
      return;
    }

    await interaction.reply({
      content: await handleText(text),
      ephemeral: true,
    });
  });

  const app = express().use(express.urlencoded({ extended: true }));

  app.get("/", (_, response) => {
    response
      .status(200)
      .send("Discord added! You may close this window. 💯")
      .end();
  });
  const environment = getEnv()
  const server = app.listen(environment.PORT);

  return () => {
    server.close();
  };
};
