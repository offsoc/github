import type {
  CodeNavSymbolDetails,
  CodeNavSymbolReference,
  CodeReferenceDetails,
  ReferenceDetails,
  SuggestionSymbolDetails,
  SuggestionSymbolReference,
} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {blamePath, blobPath, commitPath, repoOverviewUrl} from '@github-ui/paths'
import {useContributors} from '@github-ui/use-contributors'
import {useLatestCommit} from '@github-ui/use-latest-commit'
import {HistoryIcon, LinkExternalIcon, PeopleIcon, RepoIcon} from '@primer/octicons-react'
import {RelativeTime} from '@primer/react'

import {ReferencePreview} from './ReferencePreview'
import {SimpleCodeListing} from './SimpleCodeListing'

type DefOrRef = CodeNavSymbolDetails | CodeReferenceDetails | SuggestionSymbolDetails

export function SymbolReferencePreview<T extends CodeNavSymbolReference | SuggestionSymbolReference>({
  reference,
  details,
  detailsLoading,
  detailsError,
  onDismiss,
}: {
  reference: T
  details: ReferenceDetails<T> | undefined
  detailsLoading: boolean
  detailsError: boolean
  onDismiss?: () => void
}) {
  const definitionsByFile = new Map<string, DefOrRef[]>()
  const referencesByFile = new Map<string, DefOrRef[]>()

  if (details?.kind === 'suggestionSymbol') {
    for (const def of details.suggestionDefinitions ?? []) {
      if (!def.highlightedContents) continue
      const key = `${def.repoOwner}/${def.repoName}/${def.path}`
      if (!definitionsByFile.has(key)) {
        definitionsByFile.set(key, [])
      }
      definitionsByFile.get(key)!.push(def)
    }
  } else if (details?.kind === 'codeNavSymbol') {
    for (const def of details.codeNavDefinitions ?? []) {
      if (!def.highlightedContents) continue
      const key = `${def.repoOwner}/${def.repoName}/${def.path}`
      if (!definitionsByFile.has(key)) {
        definitionsByFile.set(key, [])
      }
      definitionsByFile.get(key)!.push(def)
    }

    for (const ref of details?.codeNavReferences ?? []) {
      if (!ref.highlightedContents) continue
      const key = `${ref.repoOwner}/${ref.repoName}/${ref.path}`
      if (!referencesByFile.has(key)) {
        referencesByFile.set(key, [])
      }
      referencesByFile.get(key)!.push(ref)
    }
  }

  const firstDefOrRef = [...definitionsByFile.values()][0]?.[0] ?? [...referencesByFile.values()][0]?.[0]
  const hasDefinitions = definitionsByFile.size > 0
  const hasReferences = referencesByFile.size > 0

  const totalDefinitionFiles = [...definitionsByFile.values()].length
  const totalDefinitions = [...definitionsByFile.values()].reduce((sum, nextDefs) => sum + nextDefs.length, 0)
  const totalReferenceFiles = [...referencesByFile.values()].length
  const totalReferences = [...referencesByFile.values()].reduce((sum, nextRefs) => sum + nextRefs.length, 0)

  const {contributors} = useContributors(
    firstDefOrRef?.repoOwner,
    firstDefOrRef?.repoName,
    firstDefOrRef?.commitOID,
    firstDefOrRef?.path,
  )

  const [latestCommit] = useLatestCommit(
    firstDefOrRef?.repoOwner,
    firstDefOrRef?.repoName,
    firstDefOrRef?.commitOID,
    firstDefOrRef?.path,
  )

  return (
    <ReferencePreview.Frame>
      <ReferencePreview.Header onDismiss={onDismiss}>{reference.name}</ReferencePreview.Header>
      <ReferencePreview.Body detailsError={detailsError} detailsLoading={detailsLoading}>
        {hasDefinitions && (
          <>
            <ReferencePreview.SectionDivider>
              {totalDefinitions} {totalDefinitions === 1 ? 'definition' : 'definitions'}
              {totalDefinitionFiles > 1 ? ` across ${totalDefinitionFiles} files` : null}
            </ReferencePreview.SectionDivider>
            {[...definitionsByFile.values()].map((defs, i) => (
              <ReferencePreview.CollapsibleSubsection key={defs[0]!.path} title={defs[0]!.path} initiallyOpen={i === 0}>
                <ReferencePreview.Content>
                  {defs.map((def, j) =>
                    def.highlightedContents ? (
                      <SimpleCodeListing
                        key={j}
                        trimLineBeginnings={def.highlightedContents.length === 1}
                        lines={def.highlightedContents}
                        lineNumbers={getLineNumbers(def)}
                      />
                    ) : null,
                  )}
                </ReferencePreview.Content>
              </ReferencePreview.CollapsibleSubsection>
            ))}
          </>
        )}

        {hasReferences && (
          <>
            <ReferencePreview.SectionDivider>
              {totalReferences} {totalReferences === 1 ? 'reference' : 'references'}
              {totalReferenceFiles > 1 ? ` across ${totalReferenceFiles} files` : null}
            </ReferencePreview.SectionDivider>
            {[...referencesByFile.values()].map((refs, i) => (
              <ReferencePreview.CollapsibleSubsection
                key={refs[0]!.path}
                title={refs[0]!.path}
                initiallyOpen={i === 0 && !hasDefinitions}
              >
                <ReferencePreview.Content>
                  {refs.map((ref, j) =>
                    ref.highlightedContents ? (
                      <SimpleCodeListing
                        key={j}
                        trimLineBeginnings={ref.highlightedContents.length === 1}
                        lines={ref.highlightedContents}
                        lineNumbers={getLineNumbers(ref)}
                      />
                    ) : null,
                  )}
                </ReferencePreview.Content>
              </ReferencePreview.CollapsibleSubsection>
            ))}
          </>
        )}

        <ReferencePreview.Details>
          {firstDefOrRef && (
            <ReferencePreview.DetailLink
              href={repoOverviewUrl({name: firstDefOrRef.repoName, ownerLogin: firstDefOrRef.repoOwner})}
              icon={RepoIcon}
            >
              {firstDefOrRef.repoOwner}/{firstDefOrRef.repoName}
            </ReferencePreview.DetailLink>
          )}

          {contributors && firstDefOrRef && (
            <ReferencePreview.DetailLink
              icon={PeopleIcon}
              href={blamePath({
                owner: firstDefOrRef.repoOwner,
                repo: firstDefOrRef.repoName,
                commitish: firstDefOrRef.commitOID,
                filePath: firstDefOrRef.path,
              })}
            >
              {contributors.totalCount} {contributors.totalCount === 1 ? 'contributor' : 'contributors'}
            </ReferencePreview.DetailLink>
          )}

          {latestCommit && firstDefOrRef && (
            <ReferencePreview.DetailLink
              icon={HistoryIcon}
              href={commitPath({
                owner: firstDefOrRef.repoOwner,
                repo: firstDefOrRef.repoName,
                commitish: latestCommit?.oid,
              })}
            >
              {latestCommit?.author?.displayName} updated <RelativeTime datetime={latestCommit?.date} />
            </ReferencePreview.DetailLink>
          )}

          {firstDefOrRef && (
            <ReferencePreview.DetailLink
              icon={LinkExternalIcon}
              href={blobPath({
                owner: firstDefOrRef.repoOwner,
                repo: firstDefOrRef.repoName,
                commitish: firstDefOrRef.commitOID,
                filePath: firstDefOrRef.path,
              })}
            >
              {firstDefOrRef.repoOwner}/{firstDefOrRef.repoName}/{firstDefOrRef.path}
            </ReferencePreview.DetailLink>
          )}
        </ReferencePreview.Details>
      </ReferencePreview.Body>
    </ReferencePreview.Frame>
  )
}

function getLineNumbers({range}: DefOrRef): number[] {
  if (!range) {
    return []
  }
  return new Array(range.end - range.start + 1).fill(null).map((_, i) => range.start + i)
}
