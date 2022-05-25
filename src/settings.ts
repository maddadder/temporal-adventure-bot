export const settings = {
  /**
   * How frequently to post and check for choice consensus.
   */
  interval: "1 day",

} as const;

export function getEnv(): NodeJS.ProcessEnv {
  return {
    DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
    DISCORD_CHANNEL: process.env.DISCORD_CHANNEL,
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
    SLACK_CHANNEL: process.env.SLACK_CHANNEL,
    SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET,
    PORT: process.env.PORT,
    TASK_QUEUE: process.env.TASK_QUEUE,
    WORKFLOW_ID: process.env.WORKFLOW_ID,
    COUCHBASE_BUCKET: process.env.COUCHBASE_BUCKET,
    COUCHBASE_ENDPOINT: process.env.COUCHBASE_ENDPOINT,
    COUCHBASE_USER: process.env.COUCHBASE_USER,
    COUCHBASE_PASSWORD: process.env.COUCHBASE_PASSWORD,
    IS_CAPELLA: process.env.IS_CAPELLA,
  };
}