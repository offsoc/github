import {debounce} from '@github/mini-throttle'
import {SafeHTMLBox} from '@github-ui/safe-html'
import {FileIcon} from '@primer/octicons-react'
import {ActionList, Box, Flash, Spinner, Text, useFocusZone} from '@primer/react'
import {positions} from 'fzy.js'
import {useCallback, useEffect, useRef, useState} from 'react'

import {useFilter} from '../utils/copilot-chat-hooks'
import type {
  BlackbirdSuggestion,
  BlackbirdSymbol,
  CopilotChatReference,
  CopilotChatRepo,
  Docset,
} from '../utils/copilot-chat-types'
import {useChatManager} from '../utils/CopilotChatManagerContext'

const MAX_DISPLAY_SIZE = 40

interface Props {
  query: string
  repo: CopilotChatRepo
  onSelect: (ref: string | BlackbirdSuggestion | Docset) => void
  workerPath: string | undefined
  currentReferences: CopilotChatReference[]
}

export function ReferenceSearchResults({refType, ...props}: Props & {refType: 'file' | 'symbol' | 'docset'}) {
  switch (refType) {
    case 'file':
      return <FileReferenceSearchResults {...props} />
    case 'symbol':
      return <SymbolReferenceSearchResults {...props} />
    case 'docset':
      return <DocsetReferenceSearchResults {...props} />
  }
}

function FileReferenceSearchResults(props: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [workerQuery, setWorkerQuery] = useState('')
  const debouncedSetWorkerQueryRef = useRef(debounce((q: string) => setWorkerQuery(q), 250))
  const [refFullList, setRefFullList] = useState<string[]>([])
  const refType = 'file'
  const manager = useChatManager()

  const [matchingRefs, isSearching, clearMatches] = useFilter(refFullList, workerQuery, props.workerPath)

  const {onSelect, repo, query} = props

  const sourceList = workerQuery ? matchingRefs : refFullList
  const isReady = !isLoading && !isError && !isSearching

  const handleSelect = useCallback(
    (ref: string) => {
      onSelect(ref)
      clearMatches()
    },
    [clearMatches, onSelect],
  )

  const fetchFiles = useCallback(async () => {
    setIsLoading(true)

    const res = await manager.service.listRepoFiles(repo)
    if (res.ok) {
      setRefFullList(res.payload)
    } else {
      setIsError(true)
    }

    setIsLoading(false)
  }, [manager.service, repo])

  useEffect(() => {
    void fetchFiles()
  }, [refType, fetchFiles])

  useEffect(() => {
    debouncedSetWorkerQueryRef.current(query.replaceAll(' ', ''))
  }, [query, refType])

  const currentSelections = props.currentReferences
    .map(ref => ref.type === 'file' && ref.path)
    .filter(Boolean) as string[]

  return (
    <ReferenceSearchResultsList
      currentSelections={currentSelections}
      handleSelect={handleSelect}
      isError={isError}
      isLoading={isLoading || isSearching}
      isReady={isReady}
      query={workerQuery}
      refType={refType}
      sourceList={sourceList}
    />
  )
}

function SymbolReferenceSearchResults(props: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [refFullList, setRefFullList] = useState<string[]>([])
  const symbolListRef = useRef<BlackbirdSuggestion[]>([])
  const refType = 'symbol'
  // destructuring so they can be listed as dependencies
  const {onSelect, repo, query} = props

  const isReady = !isLoading && !isError
  const manager = useChatManager()

  const handleSelect = useCallback(
    (ref: string, index: number) => {
      onSelect(symbolListRef.current[index]!)
    },
    [onSelect],
  )

  const fetchSymbols = useCallback(async () => {
    if (query) {
      setIsLoading(true)

      const res = await manager.service.querySymbols(repo, query)
      if (res.ok) {
        symbolListRef.current = res.payload
        setRefFullList(
          res.payload
            .map(suggestion => suggestion.symbol)
            .filter((symbol): symbol is BlackbirdSymbol => !!symbol)
            .map(s => s.fully_qualified_name),
        )
      } else {
        setIsError(true)
      }

      setIsLoading(false)
    } else {
      setRefFullList([])
    }
  }, [manager.service, query, repo])

  useEffect(() => {
    void fetchSymbols()
  }, [fetchSymbols])

  const currentSelections = props.currentReferences
    .map(ref => ref.type === 'symbol' && ref.name)
    .filter(Boolean) as string[]

  return (
    <ReferenceSearchResultsList
      currentSelections={currentSelections}
      handleSelect={handleSelect}
      isError={isError}
      isLoading={isLoading}
      isReady={isReady}
      query={query}
      refType={refType}
      sourceList={refFullList}
    />
  )
}

function DocsetReferenceSearchResults(props: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [refFullList, setRefFullList] = useState<Docset[]>([])

  const docsetListRef = useRef<Docset[]>([])

  const refType = 'docset'
  const {onSelect, query} = props

  const isReady = !isLoading && !isError

  const manager = useChatManager()

  const handleSelect = useCallback(
    (ref: Docset, index: number) => {
      onSelect(refFullList[index]!)
    },
    [onSelect, refFullList],
  )

  const fetchDocsets = useCallback(async () => {
    setIsLoading(true)
    const res = await manager.fetchKnowledgeBases()
    if (res.ok) {
      docsetListRef.current = res.payload
      setRefFullList(res.payload)
    } else {
      setIsError(true)
    }
    setIsLoading(false)
  }, [manager])

  useEffect(() => {
    void fetchDocsets()
  }, [fetchDocsets])

  useEffect(() => {
    const lowerQuery = query.toLowerCase()
    setRefFullList(docsetListRef.current.filter(d => d.name.toLowerCase().includes(lowerQuery)))
  }, [query])

  const docsetReferences = props.currentReferences.filter(ref => ref.type === 'docset')
  const currentSelections = docsetReferences
    .map(d => refFullList.find(r => r.name === d.name && r.scopingQuery === d.scopingQuery))
    .filter(Boolean) as Docset[]

  return (
    <ReferenceSearchResultsList<Docset>
      currentSelections={currentSelections}
      handleSelect={handleSelect}
      isError={isError}
      isLoading={isLoading}
      isReady={isReady}
      query={query}
      refType={refType}
      sourceList={refFullList}
    />
  )
}

function ReferenceSearchResultsList<T extends string | {name: string; iconHtml?: string}>({
  currentSelections,
  handleSelect,
  isError,
  isLoading,
  isReady,
  query,
  refType,
  sourceList,
}: {
  currentSelections: T[]
  handleSelect: (ref: T, index: number) => void
  isError: boolean
  isLoading: boolean
  isReady: boolean
  query: string
  refType: 'file' | 'symbol' | 'docset'
  sourceList: T[]
}) {
  const containerRef = useRef<HTMLUListElement>(null)
  const matchesToDisplay = sourceList.slice(0, MAX_DISPLAY_SIZE)
  const matchesFound = matchesToDisplay.length > 0
  const isTruncated = sourceList.length > matchesToDisplay.length
  useFocusZone({containerRef}, [])

  return (
    <>
      <ActionList
        ref={containerRef}
        sx={{maxHeight: '45dvh', overflowY: 'auto', overflowX: 'hidden', overscrollBehavior: 'contain'}}
      >
        {isReady && matchesFound ? (
          <ActionList.Group>
            <ActionList.GroupHeading>Matches</ActionList.GroupHeading>
            {matchesToDisplay.map((item, index) => {
              const selected = currentSelections.includes(item)
              const itemName = typeof item === 'string' ? item : item.name
              return (
                <ActionList.Item
                  active={selected}
                  disabled={selected}
                  onSelect={() => handleSelect(item, index)}
                  key={itemName}
                  sx={{
                    ':focus .cc-add-ref-trailing-text': {
                      display: 'flex',
                    },
                    wordWrap: 'break-word',
                    wordBreak: 'break-all',
                    color: 'fg.muted',
                  }}
                >
                  <ActionList.LeadingVisual>
                    {typeof item === 'string' || !item.iconHtml ? (
                      <FileIcon className="mr-2" />
                    ) : (
                      <SafeHTMLBox sx={{marginRight: 2, width: '16px'}} unverifiedHTML={item.iconHtml} />
                    )}
                  </ActionList.LeadingVisual>
                  <HighlightMatch query={query} text={itemName} />
                  <ActionList.TrailingVisual
                    className="cc-add-ref-trailing-text"
                    sx={{
                      display: 'none',
                    }}
                  >
                    Add {refType}
                  </ActionList.TrailingVisual>
                </ActionList.Item>
              )
            })}
          </ActionList.Group>
        ) : null}
      </ActionList>

      <Box className={isReady && matchesFound ? 'sr-only' : ''} sx={{m: 3, textAlign: 'center'}}>
        <span role="status" aria-label={isLoading ? 'Loading' : 'Search status'}>
          {isLoading ? (
            <Spinner size="large" />
          ) : isError ? (
            <Flash variant="danger" sx={{m: 3}}>
              Failed to search
            </Flash>
          ) : !matchesFound ? (
            'No matches found'
          ) : isTruncated ? (
            `First ${matchesToDisplay.length} ${refType}s shown.`
          ) : (
            `Showing ${matchesToDisplay.length} ${refType}s.`
          )}
        </span>
      </Box>
    </>
  )
}

function HighlightMatch({query, text}: {query: string; text: string}) {
  if (!query) return <>{text}</>

  const positionsList = positions(query, text)
  const parts = []
  let lastPosition = 0
  for (const i of positionsList) {
    if (Number(i) !== i || i < lastPosition || i > text.length) continue

    const slice = text.slice(lastPosition, i)
    if (slice) parts.push(slice)

    lastPosition = i + 1

    parts.push(
      <Text as="mark" key={i} sx={{fontWeight: 'bold', background: 'none', color: 'fg.default'}}>
        {text[i]}
      </Text>,
    )
  }

  parts.push(text.slice(lastPosition))

  return <>{parts}</>
}
