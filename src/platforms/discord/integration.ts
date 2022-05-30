import * as discord from "discord.js";
import { Game, GameEntry } from "../../types";
import { connectToDatabase } from "../../utils/couchbase";

import {
  emojiNameToIndex,
  emojiNameToSymbol,
  emojiSymbolToName,
  indexToEmojiName,
} from "../../utils/entries";
import { chunk } from "../../utils/helpers";
import {
  CreatePollOptions,
  Integration,
  MessageId,
  PostMessageOptions,
} from "../types";
import { getDiscordClient } from "./client";

export class DiscordIntegration implements Integration {
  #channel: discord.TextBasedChannel;
  MAX_MESSAGE_SIZE = 1500;
  private constructor(channel: discord.TextBasedChannel) {
    this.#channel = channel;
  }

  async createPoll(options: CreatePollOptions) 
  {
    let message = undefined;
    let messageChunks = chunk(options.prompt,this.MAX_MESSAGE_SIZE);
    for(let i=0;i<messageChunks.length;i++){
      message = await this.#channel.send(messageChunks[i]);
    }
    if(message != undefined){
      for (let i = 0; i < options.choices.length; i += 1) {
        await message.react(emojiNameToSymbol[indexToEmojiName[i]]);
      }
      return message.id;
    }
    else{
      throw new Error("Could not create poll because the message was blank");
    }
  }

  async getReactions(messageId: MessageId) {
    const message = await this.#channel.messages.fetch(messageId);
    const reactions = Array.from(message.reactions.cache.values());

    return reactions.map((reaction) => ({
      // We reduce count by 1 since this bot gives 1 vote to every option
      count: reaction.count - 1,
      index: emojiNameToIndex[emojiSymbolToName[reaction.emoji.name!]],
    }));
  }

  async pinMessage(messageId: MessageId) {
    const message = await this.#channel.messages.fetch(messageId);

    await message.pin();
  }

  async postMessage({ notify, text }: PostMessageOptions) {
    let message = undefined;
    let messageChunks = chunk(text,this.MAX_MESSAGE_SIZE);
    for(let i=0;i<messageChunks.length;i++){
      message = await this.#channel.send(
        notify ? `${this.#channel} ${messageChunks[i]}` : messageChunks[i]
      );
    }
    
    if(message != undefined){
      return message.id;
    }
    else
    {
      throw new Error("Could not post message because the message was blank");
    }
  }
  async getGame(name: string) {
    const { bucket } = await connectToDatabase();
    var query = "SELECT p.* FROM `default`.`_default`.`_default` p WHERE __T = 'ge' ORDER BY p.modified ASC LIMIT 100 OFFSET 0";
    // Perform a N1QL Query
    const queryResult = await bucket
    .scope('_default')
    .query(query)
    console.log(query)
    const game: Game = { gameEntries:[] };
    queryResult.rows.forEach((row:GameEntry) => {
      game.gameEntries.push(row);
    })
    return game;
  }
  static create = async () => {
    const client = await getDiscordClient();
    const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL);

    if (!channel?.isText()) {
      throw new Error("Channel is not text.");
    }

    return new DiscordIntegration(channel);
  };
}
