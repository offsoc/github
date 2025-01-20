import {controller} from '@github/catalyst'
import {ClientEntry} from './ClientEntry'
import {getReactApp} from './react-app-registry'
import type {EmbeddedData} from './embedded-data-types'
import {ReactBaseElement} from './ReactBaseElement'
import {createBrowserHistory} from './create-browser-history'

// What is this silliness? Is it react or a web component?!
// It's a web component we use to bootstrap react apps within the monolith.
@controller
export class ReactAppElement extends ReactBaseElement<EmbeddedData> {
  nameAttribute = 'app-name'

  async getReactNode(embeddedData: EmbeddedData) {
    const appName = this.name
    const initialPath = this.getAttribute('initial-path') as string
    const {App, routes} = await getReactApp(appName)

    if (this.isLazy) {
      const request = await fetch(initialPath, {
        mode: 'no-cors',
        cache: 'no-cache',
        credentials: 'include',
      })
      const {payload} = await request.json()

      embeddedData.payload = payload
    }

    const window = globalThis.window as Window | undefined

    // Initial path is set by ruby. Anchors are not sent to the server.
    // Therefore anchors must be set explicitly by the client.
    const {pathname, search, hash} = new URL(
      `${initialPath}${window?.location.hash ?? ''}`,
      window?.location.href ?? 'https://github.com',
    )

    const history = createBrowserHistory({window, v5Compat: true})
    const {key, state} = history.location
    const initialLocation = {
      pathname,
      search,
      hash,
      key,
      state,
    }

    return (
      <ClientEntry
        appName={appName}
        initialLocation={initialLocation}
        history={history}
        embeddedData={embeddedData}
        routes={routes}
        App={App}
        wasServerRendered={this.hasSSRContent}
        ssrError={this.ssrError}
      />
    )
  }

  get isLazy() {
    return this.getAttribute('data-lazy') === 'true'
  }
}
