import { Integration } from "../platforms/types";

export async function getGame(
  integration: Integration,
  name: string
) {
  return await integration.getGame(name);
}
