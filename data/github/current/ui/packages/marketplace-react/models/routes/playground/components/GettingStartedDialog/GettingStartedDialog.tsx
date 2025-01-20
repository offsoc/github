/* eslint eslint-comments/no-use: off */
/* eslint-disable primer-react/no-system-props */

// The above line is needed to keep alignContent="start" from being removed by autoformatters

import {useEffect, useRef, useState} from 'react'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import type {
  GettingStartedPayload,
  LanguageTocItem,
  ShowModelGettingStartedPayloadLanguageEntry,
  ShowModelGettingStartedPayloadSDKEntry,
} from './types'

import {Box, Text, ActionList, ActionMenu} from '@primer/react'
import {Dialog} from '@primer/react/drafts'

import CodespacesSuggestion from './CodespacesSuggestion'
import MarkdownContent from './MarkdownContent'
import type {SafeHTMLString} from '@github-ui/safe-html'

import {usePlaygroundManager, usePlaygroundState} from '../../../../utils/playground-manager'
import {ModelLegalTerms} from './ModelLegalTerms'
interface GettingStartedDialogProps {
  onClose: () => void
  openInCodespaceUrl: string
  playgroundEnabled: boolean
}

export default function GettingStartedDialog({
  onClose,
  openInCodespaceUrl,
  playgroundEnabled,
}: GettingStartedDialogProps) {
  return (
    <Dialog
      title="Get started"
      position={{narrow: 'fullscreen', regular: 'center'}}
      onClose={onClose}
      sx={{maxWidth: 965, width: '100%', p: 0}}
      renderBody={() => {
        return <CodeContainer openInCodespaceUrl={openInCodespaceUrl} playgroundEnabled={playgroundEnabled} />
      }}
    />
  )
}

function CodeContainer({
  openInCodespaceUrl,
  playgroundEnabled,
}: {
  openInCodespaceUrl: string
  playgroundEnabled: boolean
}) {
  const manager = usePlaygroundManager()
  const {gettingStarted} = useRoutePayload<GettingStartedPayload>()

  const {selectedLanguage: defaultLanguage, selectedSDK: defaultSDK} = usePlaygroundState()

  const selectedIndex = Object.keys(gettingStarted).findIndex(key => key === defaultLanguage)

  const firstLanguageEntry =
    Object.entries(gettingStarted)[selectedIndex]?.[1] ?? (Object.entries(gettingStarted)[0]?.[1] || null)

  let firstSDK: ShowModelGettingStartedPayloadSDKEntry | null = null
  if (firstLanguageEntry) {
    if (defaultSDK) {
      firstSDK = firstLanguageEntry.sdks[defaultSDK]
        ? firstLanguageEntry.sdks[defaultSDK]
        : Object.entries(firstLanguageEntry.sdks)[0]?.[1] || null
    } else {
      firstSDK = Object.entries(firstLanguageEntry.sdks)[0]?.[1] || null
    }
  }

  const [selectedLanguage, setSelectedLanguage] = useState<ShowModelGettingStartedPayloadLanguageEntry | null>(
    firstLanguageEntry,
  )
  const [selectedSDK, setSelectedSDK] = useState<ShowModelGettingStartedPayloadSDKEntry | null>(firstSDK)
  const [currentHeading, setCurrentHeading] = useState<string | null>(null)

  const contentRef = useRef<HTMLDivElement>(null)
  const contentWrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrapperElement = contentWrapperRef.current
    if (!wrapperElement || !selectedSDK) return

    const anchors = selectedSDK.tocHeadings.filter(heading => heading.level === 2).map(heading => heading.anchor)
    const options = {root: wrapperElement, rootMargin: '0px', threshold: 0.5}
    const callback = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        const id = entry.target.id
        if (entry.isIntersecting) {
          setCurrentHeading(id)
        }
      }
    }
    const observer = new IntersectionObserver(callback, options)

    for (const anchor of anchors) {
      const el = wrapperElement.querySelector(`#user-content-${anchor}`)
      if (el) observer.observe(el)
    }

    return () => {
      for (const anchor of anchors) {
        const el = wrapperElement?.querySelector(`#user-content-${anchor}`)
        if (el) {
          observer.unobserve(el)
        }
      }
    }
  }, [selectedSDK])

  if (!selectedSDK || !selectedLanguage) {
    return <p>Error</p>
  }

  const {tocHeadings, content} = selectedSDK

  // Construct a language options dropdown that includes the current SDK in the link, if possible
  const languageToc = Object.entries(gettingStarted).map(([key, language]) => {
    return {key, active: language.name === selectedLanguage.name, name: language.name} as LanguageTocItem
  })

  const levelTwoTitles = tocHeadings.filter(heading => heading.level === 2)

  const scrollToAnchor = (anchor: string) => {
    if (contentRef.current === null) return
    const element = contentRef.current.querySelector(`#user-content-${anchor}`)
    element?.scrollIntoView({block: 'start', behavior: 'smooth'})
  }

  const selectLanguage = (key: string) => {
    const language = gettingStarted[key] || null
    if (language) {
      setSelectedLanguage(language)
      // Reset SDK selection
      const _firstSDK = language.sdks[defaultSDK]
        ? language.sdks[defaultSDK]
        : Object.entries(language.sdks)[0]?.[1] || null
      if (_firstSDK) setSelectedSDK(_firstSDK)
      if (manager.setSelectedLanguage) {
        // manager only exists in the playground view
        manager.setSelectedLanguage(key, defaultSDK)
      }
    }
  }

  const handleSelectedSDK = (sdk: string) => {
    if (manager.setSelectedSDK) {
      manager.setSelectedSDK(sdk)
    }
    const SDK = selectedLanguage.sdks[sdk] || null
    if (SDK) setSelectedSDK(SDK)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        flexDirection: ['column', 'column', 'row'],
        maxHeight: ['100%', '100%', 600],
        height: '100%',
      }}
    >
      <Box
        sx={{
          width: ['100%', '100%', 300],
          borderRightColor: 'border.default',
          borderRightStyle: 'solid',
          borderRightWidth: [0, 0, 1],
          display: 'flex',
          flexDirection: 'column',
          p: 3,
          px: [0, 4, 2],
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            px: [2, 0, 2],
            flexDirection: 'column',
            borderBottomColor: 'border.default',
            borderBottomStyle: 'solid',
            borderBottomWidth: [1, 1, 0],
            pb: [3, 4, 0],
          }}
        >
          <ActionMenu>
            <ActionMenu.Button alignContent="start" block>
              <Text sx={{color: 'fg.muted'}}>Language: </Text>
              {selectedLanguage.name}
            </ActionMenu.Button>
            <ActionMenu.Overlay width="small">
              <ActionList selectionVariant="single">
                {languageToc.map(({key, name}) => (
                  <ActionList.Item
                    key={key}
                    selected={name === selectedLanguage.name}
                    onSelect={() => selectLanguage(key)}
                  >
                    {name}
                  </ActionList.Item>
                ))}
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
          <ActionMenu>
            <ActionMenu.Button block alignContent="start">
              <Text sx={{color: 'fg.muted'}}>SDK: </Text>
              {selectedSDK.name}
            </ActionMenu.Button>
            <ActionMenu.Overlay width="small">
              <ActionList selectionVariant="single">
                {Object.entries(selectedLanguage.sdks).map(([key, sdk]) => (
                  <ActionList.Item
                    key={key}
                    selected={sdk.name === selectedSDK.name}
                    onSelect={() => handleSelectedSDK(key)}
                  >
                    {sdk.name}
                  </ActionList.Item>
                ))}
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </Box>
        <Box sx={{px: 2, py: 3, display: ['none', 'none', 'block']}}>
          <Text
            sx={{
              fontSize: 0,
              px: 3,
              fontWeight: 'bold',
              color: 'fg.muted',
            }}
          >
            Chapters
          </Text>
          <ActionList>
            {levelTwoTitles.map(heading => (
              <ActionList.Item
                key={heading.anchor}
                onSelect={() => scrollToAnchor(heading.anchor)}
                active={currentHeading === `user-content-${heading.anchor}`}
              >
                {heading.text}
              </ActionList.Item>
            ))}
          </ActionList>
        </Box>
        <Box
          sx={{
            px: [3, 1, 0],
            flexGrow: [0, 0, 1],
            display: 'flex',
            flexDirection: 'column',
            justifyContent: ['flex-start', 'flex-start', 'flex-end'],
          }}
        >
          {playgroundEnabled && <CodespacesSuggestion openInCodespaceUrl={openInCodespaceUrl} />}
        </Box>
      </Box>
      <Box
        sx={{
          flex: 1,
          px: [3, 5, 5],
          pt: [2, 0, 3],
          pb: 3,
          display: 'flex',
          flexDirection: 'column',
          overflowX: ['visible', 'visible', 'hidden'],
          overflowY: ['visible', 'visible', 'scroll'],
        }}
        ref={contentWrapperRef}
      >
        <MarkdownContent payload={content as SafeHTMLString} ref={contentRef} />
        <ModelLegalTerms />
      </Box>
    </Box>
  )
}
