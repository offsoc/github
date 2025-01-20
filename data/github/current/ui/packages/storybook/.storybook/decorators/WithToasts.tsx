import {Toasts} from '@github-ui/toast/Toasts'
import {ToastContextProvider} from '@github-ui/toast/ToastContext'
import type {StoryContext} from './types'

export const withToasts = (Story: React.FC<React.PropsWithChildren<StoryContext>>, context: StoryContext) => {
  return (
    <ToastContextProvider>
      <Toasts />
      {Story(context)}
    </ToastContextProvider>
  )
}
