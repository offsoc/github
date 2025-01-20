// we don't import StoryContext from storybook because of exports that conflict
// with primer/react more: https://github.com/primer/react/runs/6129115026?check_suite_focus=true
export type StoryContext = Record<string, unknown> & {
  globals: {colorScheme: string; theme: string; showSurroundingElements?: boolean}
  parameters: Record<string, unknown>
}
