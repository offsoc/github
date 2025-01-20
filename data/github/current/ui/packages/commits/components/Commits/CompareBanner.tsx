import {useCurrentRepository} from '@github-ui/current-repository'
import {comparePath} from '@github-ui/paths'
import {Link} from '@github-ui/react-core/link'
import {ArrowLeftIcon, GitCompareIcon, XIcon} from '@primer/octicons-react'
import type {ButtonProps} from '@primer/react'
import {BranchName, Button, IconButton, Octicon} from '@primer/react'
import {Tooltip} from '@primer/react/next'

import {useCommitCompare} from '../../contexts/CommitCompareContext'
import {shortSha} from '../../utils/short-sha'
import {Panel} from '../Panel'

function ViewDiffButton() {
  const {selectedCommits, getBaseAndCompare} = useCommitCompare()
  const repo = useCurrentRepository()

  const isDisabled = selectedCommits.length < 2

  const getDisabledProps = (disabled: boolean) => {
    const ariaDisabledProps: Pick<ButtonProps, 'className' | 'onClick' | 'aria-disabled'> = disabled
      ? {className: 'btn', 'aria-disabled': true, onClick: e => e.preventDefault()}
      : {}

    return ariaDisabledProps
  }

  let url = ''

  if (selectedCommits.length === 2) {
    const {base: baseFullSha, compare: headFullSha} = getBaseAndCompare()

    const base = shortSha(baseFullSha)
    const head = shortSha(headFullSha)

    url = comparePath({repo, base, head})
  }

  return (
    <Tooltip
      direction="sw"
      text={isDisabled ? 'You need two commits to compare. Select another commit and try again. ' : 'Compare'}
    >
      <Button
        leadingVisual={GitCompareIcon}
        as={Link}
        variant="primary"
        to={url}
        {...getDisabledProps(isDisabled)}
        tabIndex={0}
      >
        Compare
      </Button>
    </Tooltip>
  )
}

function SHAButton({sha, label}: {sha: string; label: string}) {
  const {removeFromCompare} = useCommitCompare()

  return (
    <div className="d-flex flex-align-center gap-2">
      <span>{label}: </span>
      {sha && (
        <BranchName className="d-flex flex-align-center gap-2 fgColor-muted" as="span">
          <span className="text-mono">{shortSha(sha)}</span>
          {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
          <IconButton
            unsafeDisableTooltip={true}
            icon={XIcon}
            size="small"
            variant="invisible"
            className="p-0"
            sx={{height: '24px', width: '16px'}}
            aria-label={`Remove ${shortSha(sha)} from compare`}
            onClick={() => {
              removeFromCompare(sha)
            }}
          />
        </BranchName>
      )}

      {!sha && (
        <>
          <span className="border borderColor-muted rounded-2 p-1 fgColor-muted">None Selected</span>
        </>
      )}
    </div>
  )
}

export function CompareBanner() {
  const {selectedCommits, clearSelectedCommits, getBaseAndCompare} = useCommitCompare()

  if (selectedCommits.length === 0) return null

  const {base: baseSha, compare: compareSha} = getBaseAndCompare()

  return (
    <Panel className="flex-column flex-sm-row flex-justify-between p-2 mb-2 gap-2">
      <div className="d-flex flex-justify-between flex-items-center gap-2">
        <SHAButton sha={baseSha} label="Base" />
        <div className="d-flex flex-column flex-items-center">
          <Octicon className="fgColor-muted" icon={ArrowLeftIcon} />
          <span className="mt-n2">...</span>
        </div>
        <SHAButton sha={compareSha} label="Compare" />
      </div>

      <div className="d-flex flex-column flex-sm-row gap-2 flex-items-center flex-justify-between">
        <span className="fgColor-muted">Choose a commit to compare</span>
        <div className="d-flex gap-2">
          <Button onClick={() => clearSelectedCommits()}>Cancel</Button>
          <ViewDiffButton />
        </div>
      </div>
    </Panel>
  )
}
