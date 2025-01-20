import type {PropsWithChildren} from 'react'
import {ThemeProvider} from '@primer/react'

export const App = ({children}: PropsWithChildren) => {
  /*
    hardcoded to light theme for stafftools, as it is opted out of color modes
    https://github.com/github/github/blob/17f169a6659c0df85d6557d5941413cd8145b4b6/app/controllers/stafftools_controller.rb#L22
  */
  return (
    <ThemeProvider colorMode="day">
      <div data-color-mode="light">{children}</div>
    </ThemeProvider>
  )
}
