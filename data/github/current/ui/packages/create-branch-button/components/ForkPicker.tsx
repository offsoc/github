import {type Dispatch, Fragment, type SetStateAction} from 'react'
import {AnchoredOverlay, Button, Box, ActionList, Text} from '@primer/react'
import {TriangleDownIcon, RepoIcon} from '@primer/octicons-react'
import type {Repo} from '../types'

function repoNameWithOwner(repo: Repo) {
  return `${repo.ownerLogin}/${repo.name}`
}

export function ForkPicker({
  isForkSourceOpen,
  setForkSourceOpen,
  repoSource,
  setRepoSource,
  repository,
  repositoryParent,
  setDefaultBranch,
  setBranchSource,
}: {
  isForkSourceOpen: boolean
  setForkSourceOpen: Dispatch<SetStateAction<boolean>>
  repoSource: Repo
  setRepoSource: Dispatch<SetStateAction<Repo>>
  repository: Repo
  repositoryParent: Repo
  setDefaultBranch: Dispatch<SetStateAction<string>>
  setBranchSource: Dispatch<SetStateAction<string>>
}) {
  return (
    <Fragment>
      <span className="note text-small mt-0">Choose from this fork or its upstream repository.</span>
      <AnchoredOverlay
        open={isForkSourceOpen}
        overlayProps={{role: 'dialog', width: 'medium'}}
        onOpen={() => setForkSourceOpen(true)}
        onClose={() => setForkSourceOpen(false)}
        renderAnchor={anchorProps => (
          <>
            <Button
              {...anchorProps}
              trailingVisual={TriangleDownIcon}
              aria-label={repoNameWithOwner(repoSource)}
              data-testid="anchor-button"
            >
              <Box sx={{display: 'flex'}}>
                <Box sx={{mr: 1, color: 'fg.muted'}}>
                  <RepoIcon size="small" />
                </Box>
                <Box
                  sx={{
                    fontSize: 1,
                    maxWidth: 125,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Text sx={{minWidth: 0}}>&nbsp;{`${repoNameWithOwner(repoSource)}`}</Text>
                </Box>
              </Box>
            </Button>
          </>
        )}
        focusZoneSettings={{disabled: true}}
      >
        <div data-testid="overlay-content" id="selectPanel">
          <ActionList selectionVariant="single">
            <ActionList.Item
              selected={repoSource.id === repositoryParent.id}
              onSelect={() => {
                setRepoSource(repositoryParent)
                setDefaultBranch(repositoryParent.defaultBranch)
                setBranchSource(repositoryParent.defaultBranch)
                setForkSourceOpen(false)
              }}
            >{`${repositoryParent.ownerLogin}/${repositoryParent.name}`}</ActionList.Item>
            <ActionList.Item
              selected={repoSource.id === repository.id}
              onSelect={() => {
                setRepoSource(repository)
                setDefaultBranch(repository.defaultBranch)
                setBranchSource(repository.defaultBranch)
                setForkSourceOpen(false)
              }}
            >{`${repository.ownerLogin}/${repository.name}`}</ActionList.Item>
          </ActionList>
        </div>
      </AnchoredOverlay>
    </Fragment>
  )
}
