export interface GameOptions {
  entry: string;
}

export interface Game {
  gameEntries: GameEntry[];
}

export interface GameEntry {
  name: string;
  description: string[];
  options?: GameOption[];
}

export type GameEntryWithOptions = Required<GameEntry>;

export interface GameOption {
  description: string;
  next: string;
}

export type ForceInput = "random" | number;

export interface NextChoice {
  choice: string;
  forced?: ForceInput;
}
