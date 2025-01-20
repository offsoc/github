import {PersonIcon, TriangleDownIcon} from '@primer/octicons-react'
import {ActionList, Button} from '@primer/react'
import type React from 'react'
import {useCallback, useMemo} from 'react'
import {getTokensByType, replaceAllFiltersByTypeInSearchQuery, searchUrl} from '../../../utils/urls'
import type {FilterBarPickerProps} from './ListItemsHeaderWithoutBulkActions'
import {useQueryContext} from '../../../contexts/QueryContext'
import type {AssigneePickerAssignee$data} from '@github-ui/item-picker/AssigneePicker.graphql'
import {AssigneeRepositoryPicker} from '@github-ui/item-picker/AssigneePicker'
import {LABELS} from '../../../constants/labels'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import type {AppPayload} from '../../../types/app-payload'

export function ListAuthorFilter({repo: scopedRepo, applySectionFilter, nested}: FilterBarPickerProps) {
  const {name: repo, owner} = scopedRepo
  const {activeSearchQuery, currentViewId} = useQueryContext()
  const {current_user_settings} = useAppPayload<AppPayload>()

  const currentAuthorTokens = useMemo(() => getTokensByType(activeSearchQuery, 'author'), [activeSearchQuery])

  const onSelectionChanged = useCallback(
    (selectedAuthors: AssigneePickerAssignee$data[]) => {
      const authors = selectedAuthors.map(author => author.login)
      const newQuery = replaceAllFiltersByTypeInSearchQuery(activeSearchQuery, authors, 'author')
      const url = searchUrl({viewId: currentViewId, query: newQuery})
      applySectionFilter(newQuery, url)
    },
    [activeSearchQuery, applySectionFilter, currentViewId],
  )

  return (
    <AssigneeRepositoryPicker
      readonly={false}
      title={LABELS.filters.authorLabel}
      selectionVariant="single"
      assigneeTokens={currentAuthorTokens}
      assignees={[]}
      repo={repo}
      owner={owner}
      onSelectionChange={onSelectionChanged}
      shortcutEnabled={current_user_settings?.use_single_key_shortcut || false}
      anchorElement={nested ? NestedAuthorsAnchor : AuthorsAnchor}
      name="author"
      showNoMatchItem={true}
    />
  )
}

function NestedAuthorsAnchor(props: React.HTMLAttributes<HTMLElement>) {
  return (
    <ActionList.Item {...props} aria-label={LABELS.filters.authorLabel} role="menuitem">
      <ActionList.LeadingVisual>
        <PersonIcon />
      </ActionList.LeadingVisual>
      {LABELS.filters.author}...
    </ActionList.Item>
  )
}

function AuthorsAnchor(props: React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      variant="invisible"
      sx={{
        color: 'fg.muted',
        width: 'fit-content',
      }}
      data-testid="authors-anchor-button"
      trailingVisual={TriangleDownIcon}
      aria-label={LABELS.filters.authorLabel}
      {...props}
    >
      {LABELS.filters.author}
    </Button>
  )
}
