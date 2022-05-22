declare namespace NodeJS {
  interface ProcessEnv {
    DISCORD_BOT_TOKEN: string;
    DISCORD_CHANNEL: string;
    SLACK_BOT_TOKEN: string;
    SLACK_CHANNEL: string;
    SLACK_SIGNING_SECRET: string;
    PORT: string;
    TASK_QUEUE: string;
    WORKFLOW_ID: string;
  }
}
