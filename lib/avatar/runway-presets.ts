export const runwayPresets = [
  { id: "game-character", name: "Game character" },
  { id: "music-superstar", name: "Music superstar" },
  { id: "game-character-man", name: "Game character (male)" },
  { id: "cat-character", name: "Cat character" },
  { id: "influencer", name: "Influencer" },
  { id: "tennis-coach", name: "Tennis coach" },
  { id: "human-resource", name: "Human resources" },
  { id: "fashion-designer", name: "Fashion designer" },
  { id: "cooking-teacher", name: "Cooking teacher" },
] as const;

export type RunwayPresetId = (typeof runwayPresets)[number]["id"];

const runwayPresetIdSet = new Set<string>(runwayPresets.map(({ id }) => id));

export function isRunwayPresetId(value: string): value is RunwayPresetId {
  return runwayPresetIdSet.has(value);
}
