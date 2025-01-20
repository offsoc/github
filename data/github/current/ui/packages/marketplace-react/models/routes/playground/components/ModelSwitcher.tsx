import {useEffect, useState, useRef} from 'react'
import {Box, ActionList} from '@primer/react'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {ChevronDownIcon} from '@primer/octicons-react'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {SelectPanel} from '@primer/react/drafts'
import {useSafeAsyncCallback} from '@github-ui/use-safe-async-callback'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'

import {useNavigate} from '@github-ui/use-navigate'
import type {Model} from '../../../../types'
import {normalizeModelPublisher} from '../../../../utilities/normalize-model-strings'
import {ModelUrlHelper} from '../../../utils/model-url-helper'

export default function ModelSwitcher({model}: {model: Model}) {
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [models, setModels] = useState<Model[] | null>(null)
  const [showPanel, setShowPanel] = useState(false)
  const anchorRef = useRef<HTMLButtonElement>(null)

  const loadModels = useSafeAsyncCallback(async () => {
    if (isLoadingModels) return
    if (models) return

    setIsLoadingModels(true)
    const res = await verifiedFetchJSON('/marketplace/models')
    if (res.ok) {
      setModels((await res.json()) as Model[])
    }
    setIsLoadingModels(false)
  })

  const [filter, setFilter] = useState('')

  useEffect(() => {
    loadModels()
  }, [filter, loadModels])

  const modelsOrEmpty = models || []

  const navigate = useNavigate()
  const _models = modelsOrEmpty
  const selectedModelElement = useRef<HTMLLIElement | null>(null)

  useEffect(() => {
    if (showPanel) {
      selectedModelElement.current?.scrollIntoView()
    }
  }, [showPanel])

  const filteredModels = _models.filter(
    m =>
      m.task === 'chat-completion' &&
      (m.friendly_name.toLowerCase().includes(filter.toLowerCase()) ||
        normalizeModelPublisher(m.publisher).toLowerCase().includes(filter.toLowerCase())),
  )

  return (
    <Box
      sx={{
        display: 'flex',
        maxWidth: '100%',
        minWidth: 0,
        alignItems: 'center',
      }}
    >
      <Box
        as="button"
        ref={anchorRef}
        onClick={() => setShowPanel(true)}
        aria-label="Switch model"
        sx={{
          display: 'flex',
          flex: 1,
          height: 32,
          bg: 'canvas.default',
          alignItems: 'center',
          minWidth: 0,
          maxWidth: '100%',
          borderColor: 'border.default',
          borderWidth: 1,
          borderStyle: 'solid',
          borderRadius: 2,
          boxShadow: 'var(--shadow-resting-small,var(--color-shadow-small))',
          transition: 'background-color 0.2s',
          ':hover': {
            bg: 'canvas.inset',
          },
        }}
      >
        <Box sx={{flexShrink: 0, mr: 2, display: 'flex'}}>
          <GitHubAvatar square size={18} src={model.logo_url} />
        </Box>
        <Box sx={{fontWeight: 'semibold', color: 'fg.muted', mr: 1}}>Model:</Box>
        <Box
          sx={{
            whiteSpace: 'nowrap',
            fontWeight: 'semibold',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: 'fg.default',
          }}
        >
          {model.friendly_name}
        </Box>
        <Box sx={{color: 'fg.muted', ml: 1}}>
          <ChevronDownIcon />
        </Box>
      </Box>
      <SelectPanel
        open={showPanel}
        anchorRef={anchorRef}
        onSubmit={() => setShowPanel(false)}
        onCancel={() => setShowPanel(false)}
        title="Switch model"
        selectionVariant="instant"
      >
        <SelectPanel.Header>
          <SelectPanel.SearchInput value={filter} onChange={e => setFilter(e.target.value)} />
        </SelectPanel.Header>

        {isLoadingModels ? (
          // As of shipping, we have 16 models so we show 19 loading skeletons to avoid layout shift
          Array.from({length: 16}).map((_, i) => (
            <ActionList.Item key={i} disabled={true}>
              <ActionList.LeadingVisual>
                <LoadingSkeleton width="20px" variant="rounded" />
              </ActionList.LeadingVisual>
              <LoadingSkeleton variant="rounded" />
            </ActionList.Item>
          ))
        ) : (
          <ActionList>
            {filteredModels.map(m => (
              <ActionList.Item
                key={m.id}
                onSelect={() => {
                  const currentUrl = new URL('', window.location.href)
                  const newUrl = currentUrl.pathname.endsWith(ModelUrlHelper.codeSuffix)
                    ? ModelUrlHelper.playgroundCodeUrl
                    : ModelUrlHelper.playgroundUrl
                  navigate(newUrl(m))
                }}
                ref={m.id === model.id ? selectedModelElement : null}
                selected={m.id === model.id}
              >
                <ActionList.LeadingVisual>
                  <GitHubAvatar size={20} square src={m.logo_url} />
                </ActionList.LeadingVisual>
                {m.friendly_name}
              </ActionList.Item>
            ))}
          </ActionList>
        )}

        <SelectPanel.Footer>
          <SelectPanel.SecondaryAction variant="link" href="/marketplace/models">
            View all models
          </SelectPanel.SecondaryAction>
        </SelectPanel.Footer>
      </SelectPanel>
    </Box>
  )
}
