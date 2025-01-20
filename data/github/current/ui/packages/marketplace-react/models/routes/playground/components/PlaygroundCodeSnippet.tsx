import {CopyToClipboardButton} from '@github-ui/copy-to-clipboard'
import {usePlaygroundState} from '../../../utils/playground-manager'
import type {PlaygroundRequestParameters} from '../../../utils/model-client'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import type {Model} from '../../../../types'
import React, {lazy} from 'react'
import type {GettingStartedPayload} from './GettingStartedDialog/types'

const CodeMirror = lazy(() => import('@github-ui/code-mirror'))

function replaceKeywords(template: string, values: PlaygroundRequestParameters) {
  const regex = /\{(\w+)\}/g
  return template.replace(regex, (match, key) => values[key] ?? match)
}

function getLanguageExt(lang: 'rest' | 'python' | 'js' | string): string {
  const extensionMap: {[key in 'rest' | 'python' | 'js']: string} = {
    rest: 'sh',
    python: 'py',
    js: 'js',
  }

  return lang in extensionMap ? extensionMap[lang as keyof typeof extensionMap] : 'txt'
}

export function PlaygroundCodeSnippet({model}: {model: Model}) {
  const playgroundState = usePlaygroundState()
  const {playgroundUrl, gettingStarted} = useRoutePayload<GettingStartedPayload>()

  const {systemPrompt, parameters} = playgroundState

  // Note: Never directly modify state
  const enrichedParameters = Object.assign({}, parameters)

  enrichedParameters['system_message'] = systemPrompt || ''
  enrichedParameters['model_name'] = model.name
  enrichedParameters['model_endpoint'] = playgroundUrl
  const {selectedSDK, selectedLanguage} = usePlaygroundState()
  const snippet = gettingStarted[selectedLanguage]

  const extension = getLanguageExt(selectedLanguage)

  if (!snippet) {
    return null
  }

  const hasCodeSample = snippet.sdks[selectedSDK]

  let content = 'Code snippet not available'
  if (hasCodeSample) {
    if (hasCodeSample.codeSamples.length > 0) {
      content = hasCodeSample.codeSamples
    }
  } else {
    const defaultSDK = Object.values(snippet.sdks)[0]
    if (defaultSDK) {
      content = defaultSDK.codeSamples
    }
  }

  content = replaceKeywords(content, enrichedParameters)

  return (
    <div className="d-flex position-relative flex-column overflow-auto" style={{flex: 1}}>
      <CopyToClipboardButton
        className="position-absolute"
        sx={{right: '8px', top: '8px', zIndex: 10}}
        textToCopy={content}
        ariaLabel={'Copy to clipboard'}
      />

      <React.Suspense fallback={<></>}>
        <CodeMirror
          fileName={`document.${extension}`}
          value={content}
          ariaLabelledBy={''}
          height="100%"
          spacing={{
            indentUnit: 2,
            indentWithTabs: false,
            lineWrapping: false,
          }}
          hideHelpUntilFocus={true}
          onChange={() => {}}
          isReadOnly
        />
      </React.Suspense>
    </div>
  )
}
