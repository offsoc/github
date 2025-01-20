import type {StoryContext} from './types'

export const withAriaLive = (Story: React.FC<React.PropsWithChildren<StoryContext>>, context: StoryContext) => {
  return (
    <div>
     <div id="js-global-screen-reader-notice" data-testid="sr-polite" className="sr-only" aria-live="polite" />
     <div id="js-global-screen-reader-notice-assertive" data-testid="sr-assertive" className="sr-only" aria-live="assertive" />
      {Story(context)}
    </div>
  )
}
