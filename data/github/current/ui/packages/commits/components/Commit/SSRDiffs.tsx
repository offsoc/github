import type {Repository} from '@github-ui/current-repository'
import {noop} from '@github-ui/noop'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {useRef} from 'react'

import {useDiffViewSettings} from '../../contexts/DiffViewSettingsContext'
import type {CommitAppPayload, CommitPayload, DiffEntryDataWithExtraInfo} from '../../types/commit-types'
import {Diff} from './Diff'

interface DiffsProps {
  diffEntryData: DiffEntryDataWithExtraInfo[]
  contextLinePathURL: string
  unselectedFileExtensions?: Set<string>
  repo: Repository
  oid: string
}

export function SSRDiffs({diffEntryData, contextLinePathURL, repo, oid}: DiffsProps) {
  const diffViewSettings = useDiffViewSettings()
  const diffEntriesToUse = useRef(diffEntryData)
  const payload = useAppPayload<CommitAppPayload>()
  const commitPayload = useRoutePayload<CommitPayload>()

  return (
    <div data-hpc>
      {diffEntryData.map((currentDiffData, index) => {
        return (
          <div key={currentDiffData.pathDigest} className={index === 0 ? 'pt-0' : 'pt-3'}>
            <Diff
              prId={undefined}
              diffEntryData={diffEntriesToUse}
              index={index}
              helpUrl={payload.helpUrl}
              splitPreference={diffViewSettings.splitPreference}
              contextLinePathURL={contextLinePathURL}
              recalcTotalHeightOfVirtualWindow={noop}
              repo={repo}
              ignoreWhitespace={commitPayload.ignoreWhitespace}
              oid={oid}
            />
          </div>
        )
      })}
    </div>
  )
}
