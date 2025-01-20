import {type Repository, useCurrentRepository} from '@github-ui/current-repository'
import {tagPath} from '@github-ui/paths'
import {KebabHorizontalIcon, TagIcon} from '@primer/octicons-react'
import {ActionList, IconButton, Link, Octicon} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import {useCallback, useRef, useState} from 'react'

import type {BranchCommitState} from '../../hooks/use-load-branch-commits'

export interface CommitTagInfoProps {
  data: BranchCommitState
}

export function CommitTagInfo({data}: CommitTagInfoProps) {
  const repo = useCurrentRepository()

  if (data.tags.length === 0) {
    return null
  }

  const renderTagsInLine = data.tags.length > 2 && data.tags.length < 25
  const renderTagsInDialog = data.tags.length >= 25

  return (
    <div className="d-flex flex-items-center flex-wrap border-bottom p-3 gap-1">
      <Octicon className="mr-2" icon={TagIcon} />

      <Link href={tagPath({owner: repo.ownerLogin, repo: repo.name, tag: data.tags[0]!})} className="fgColor-default">
        {data.tags[0]}
      </Link>

      {renderTagsInLine ? <ExpandedTags tags={data.tags} repo={repo} /> : null}
      {renderTagsInDialog ? <CommitTagsDialog tags={data.tags} repo={repo} /> : null}

      {data.tags.length > 1 ? (
        <Link
          href={tagPath({owner: repo.ownerLogin, repo: repo.name, tag: data.tags[data.tags.length - 1]!})}
          className="fgColor-muted"
        >
          {data.tags[data.tags.length - 1]}
        </Link>
      ) : null}
    </div>
  )
}

function ExpandedTags({tags, repo}: {tags: string[]; repo: Repository}) {
  const [tagsExpanded, setTagsExpanded] = useState(false)
  const firstExpandedTagRef = useRef<HTMLAnchorElement>(null)

  const onExpand = useCallback(() => {
    setTagsExpanded(true)
    requestAnimationFrame(() => firstExpandedTagRef.current?.focus())
  }, [])

  return tagsExpanded ? (
    <>
      {tags.slice(1, tags.length - 1).map((tag, index) => {
        return (
          <Link
            ref={index === 0 ? firstExpandedTagRef : null}
            href={tagPath({owner: repo.ownerLogin, repo: repo.name, tag})}
            className="fgColor-muted mx-1"
            key={tag}
          >
            {tag}
          </Link>
        )
      })}
    </>
  ) : (
    // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
    <IconButton
      aria-label="Show more tags"
      unsafeDisableTooltip={true}
      icon={KebabHorizontalIcon}
      size="small"
      variant="invisible"
      onClick={onExpand}
    />
  )
}

function CommitTagsDialog({tags, repo}: {tags: string[]; repo: Repository}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const returnFocusRef = useRef(null)

  return (
    <>
      {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
      <IconButton
        aria-label="Show all tags"
        unsafeDisableTooltip={true}
        icon={KebabHorizontalIcon}
        size="small"
        variant="invisible"
        onClick={() => setDialogOpen(true)}
        ref={returnFocusRef}
      />
      {dialogOpen && (
        <Dialog
          title={`${tags.length} tags`}
          onClose={() => setDialogOpen(false)}
          returnFocusRef={returnFocusRef}
          width="medium"
          height={tags.length >= 12 ? 'small' : 'auto'}
          renderBody={() => {
            return (
              <ActionList className="overflow-y-auto py-2" data-testid="tag-dialog-list">
                {tags.map(tag => (
                  <ActionList.LinkItem key={tag} href={tagPath({owner: repo.ownerLogin, repo: repo.name, tag})}>
                    {tag}
                  </ActionList.LinkItem>
                ))}
              </ActionList>
            )
          }}
        />
      )}
    </>
  )
}
