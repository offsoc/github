// eslint-disable-next-line no-restricted-imports
import {reactAppFactories} from './register-app.server'
// eslint-disable-next-line no-restricted-imports
import {reactPartials} from './register-partial.server'

import {ServerEntry} from './ServerEntry'
import {PartialEntry} from './PartialEntry'
import type {EmbeddedData, EmbeddedPartialData} from './embedded-data-types'
import {type ColorModeOptions, setColorModeOptions} from './use-color-modes'
import {renderToString} from 'react-dom/server'
import {ServerStyleSheet} from 'styled-components'
import {setLocation} from '@github-ui/ssr-utils'
import {type ClientEnvironment, setClientEnvForSsr} from '@github-ui/client-env'
import {createMemoryHistory} from '@remix-run/router'

interface BaseRequest {
  name: string
  url: string
  clientEnv: ClientEnvironment | null
  colorModes: ColorModeOptions
}

export interface AppRenderRequest extends BaseRequest {
  path: string
  data: EmbeddedData
}

export interface PartialRenderRequest extends BaseRequest {
  data: EmbeddedPartialData
}

async function getAppEntry({name, path, data}: AppRenderRequest) {
  const factory = reactAppFactories.get(name)
  if (!factory) {
    throw new Error(`Unknown app ${name}`)
  }

  const {App, routes} = factory()

  // Initial path is set by ruby. Fragments are not sent to the server.
  const {pathname, search, hash} = new URL(path, 'https://github.com')
  const history = createMemoryHistory({initialEntries: [{pathname, search, hash}], v5Compat: true})
  const {key, state} = history.location
  const initialLocation = {
    pathname,
    search,
    hash,
    key,
    state,
  }

  return (
    <ServerEntry
      appName={name}
      embeddedData={data}
      routes={routes}
      App={App}
      initialLocation={initialLocation}
      history={history}
    />
  )
}

function getPartialEntry({name, data}: PartialRenderRequest) {
  const partial = reactPartials.get(name)

  if (!partial) {
    throw new Error(`Unknown partial ${name}`)
  }

  const {Component} = partial
  return <PartialEntry partialName={name} embeddedData={data} Component={Component} wasServerRendered={true} />
}

export async function handleRequest(request: AppRenderRequest | PartialRenderRequest) {
  // Ensure the correct color mode options are applied
  const {colorModes, url} = request
  setColorModeOptions(colorModes)
  setLocation(url)
  setClientEnvForSsr(request.clientEnv || undefined)

  // Get the entry node, based on the request type
  const entry = 'path' in request ? await getAppEntry(request) : getPartialEntry(request)

  // Render the entry node with stylesheets
  const sheet = new ServerStyleSheet()
  const markup = renderToString(sheet.collectStyles(entry))

  // Return the rendered markup with stylesheets
  return `${sheet.getStyleTags()}${markup}`
}

declare global {
  function handleRequest(request: AppRenderRequest | PartialRenderRequest): Promise<string>
}

globalThis.handleRequest = async (request: AppRenderRequest | PartialRenderRequest) => {
  return handleRequest(request)
}
