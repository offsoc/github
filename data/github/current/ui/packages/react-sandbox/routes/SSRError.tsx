import {ShowPage} from './Show'

export function SSRErrorPage() {
  // Force a SSR error by calling document
  // eslint-disable-next-line ssr-friendly/no-dom-globals-in-react-fc
  document.createElement('div')

  return <ShowPage />
}
