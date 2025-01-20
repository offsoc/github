export const Direction = {
  Up: 'up',
  Down: 'down',
} as const
export type Direction = ObjectValues<typeof Direction>
