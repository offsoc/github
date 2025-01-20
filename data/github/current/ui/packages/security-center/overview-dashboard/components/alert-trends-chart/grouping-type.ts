export const groupingValues = ['severity', 'age', 'tool'] as const
export type GroupingType = (typeof groupingValues)[number]
