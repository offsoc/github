import {useRootElement} from './use-root-element'

/**
 * Return the offset top position of the memex root element
 */
export const useRootOffsetY = () => {
  const rootElement = useRootElement()

  const appTopPosition = rootElement ? rootElement?.getBoundingClientRect().top : 0

  return appTopPosition
}
