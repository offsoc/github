import {BaseStyles, ThemeProvider, type ThemeProviderProps, useTheme} from '@primer/react'
import {StrictMode, useCallback} from 'react'
import {createRoot} from 'react-dom/client'

import {AlertDialog, type AlertDialogProps} from '../components/alert-dialog'

export type ConfirmOptions = Omit<AlertDialogProps, 'onClose'> & {content: React.ReactNode}

function alert(themeProps: ThemeProviderProps, {content, ...confirmationDialogProps}: ConfirmOptions) {
  return new Promise(resolve => {
    /**
     * This element is never attached to the DOM, but it is
     * rendered to in memory
     *
     * The `AlertDialog` component rendered to this node
     * renders a portal.
     *
     * that portal renders to the dom. This is based on a similiar
     * pattern prc uses {@link https://github.com/primer/react/blob/985120a61b62c1bbd1872d9a11e34fab407a4096/src/Dialog/ConfirmationDialog.tsx#L146}
     * to render the dialog _outside_ of the current react render tree,
     * which also stops events from the element rendered herein from
     * bubbling up the react tree, like it would if _just_ portaling to the
     * element directly, instead of rendering to an in memory node
     */
    const hostElement = document.createElement('div')

    const root = createRoot(hostElement)

    const onClose: AlertDialogProps['onClose'] = gesture => {
      root.unmount()
      resolve(gesture === 'confirm')
    }

    root.render(
      <StrictMode>
        <ThemeProvider {...themeProps}>
          <BaseStyles display="contents">
            <AlertDialog {...confirmationDialogProps} onClose={onClose}>
              {content}
            </AlertDialog>
          </BaseStyles>
        </ThemeProvider>
      </StrictMode>,
    )
  })
}

/**
 * This hook takes no parameters and returns a function, `alert`. When `alert`
 * is called, it shows a dialog. When the dialog is dismissed, a promise is
 * resolved with `true` or `false` depending on whether or not the confirm button was used.
 */
export const useAlert = () => {
  const {theme, colorMode, dayScheme, nightScheme} = useTheme()

  return useCallback(
    (options: ConfirmOptions) => {
      const themeProps: ThemeProviderProps = {theme, colorMode, dayScheme, nightScheme}
      return alert(themeProps, options)
    },
    [theme, colorMode, dayScheme, nightScheme],
  )
}
