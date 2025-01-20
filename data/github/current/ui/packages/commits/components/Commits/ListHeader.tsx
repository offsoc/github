import type {Repository} from '@github-ui/current-repository'
import {commitsPath, repositoryTreePath} from '@github-ui/paths'
import {RefSelector} from '@github-ui/ref-selector'
import {useNavigate} from '@github-ui/use-navigate'
import {type User, UserSelector} from '@github-ui/user-selector'
import {CalendarIcon, TriangleDownIcon} from '@primer/octicons-react'
import {ActionList, Box, type BoxProps, BranchName, Breadcrumbs, Button, Heading, Octicon} from '@primer/react'
import {isValid, parseISO} from 'date-fns'
import React, {lazy, Suspense} from 'react'

import {useLoadAuthorData} from '../../hooks/use-load-author-data'
import type {RefInfo} from '../../types/shared'
import {addOrModifyUrlParameters} from '../../utils/add-or-modify-url-parameters'
import {extractRange} from '../../utils/extract-range'
import {shortSha} from '../../utils/short-sha'

// eslint-disable-next-line github/no-then
const DatePicker = lazy(() => import('@github-ui/date-picker').then(m => ({default: m.DatePicker})))
const StyledCalendarIcon = () => <Octicon icon={CalendarIcon} className="fgColor-muted" sx={{my: '2px'}} />

interface ListHeaderProps {
  repo: Repository
  refInfo: RefInfo
  path: string
  author: User | null
  contributorsUrl: string
  since: string | null
  until: string | null
  sx?: BoxProps['sx']
}

export function ListHeader({repo, refInfo, path, author, contributorsUrl, since, until, sx = {}}: ListHeaderProps) {
  let refNameOrCommit = refInfo.name
  if (refNameOrCommit === refInfo.currentOid) {
    refNameOrCommit = shortSha(refInfo.currentOid)
  }
  const navigate = useNavigate()
  const actorsState = useLoadAuthorData(contributorsUrl)

  const value = React.useMemo(() => {
    const from = parseISO(since ?? '')
    const to = parseISO(until ?? '')
    if (!isValid(from) || !isValid(to)) return null
    return {from, to}
  }, [since, until])

  const pathSplit = path?.split('/')

  return (
    <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 2, ...sx}}>
      {path && (
        <div className="d-flex flex-items-center">
          <div className="d-flex flex-items-baseline flex-column flex-sm-row">
            <Heading as="h2" className="sr-only">
              Breadcrumbs
            </Heading>

            <span className="fgColor-default no-wrap">History for</span>
            <Breadcrumbs className="ml-1">
              <Breadcrumbs.Item href={commitsPath({owner: repo.ownerLogin, repo: repo.name})}>
                {repo.name}
              </Breadcrumbs.Item>
              {pathSplit.map((part, index, parts) => {
                const href = commitsPath({
                  owner: repo.ownerLogin,
                  repo: repo.name,
                  ref: refInfo.name,
                  path: parts.slice(0, index + 1).join('/'),
                })

                const isLastElement = index === parts.length - 1
                const lastElementSx = isLastElement ? {fontWeight: 'bold'} : {}

                return (
                  <Breadcrumbs.Item
                    sx={{whiteSpace: 'normal', ...lastElementSx}}
                    key={href}
                    href={href}
                    selected={isLastElement}
                  >
                    {part}
                  </Breadcrumbs.Item>
                )
              })}
            </Breadcrumbs>
            <div className="no-wrap">
              <span className="mr-2 ml-0 ml-sm-2 fgColor-default">on</span>
              <BranchName href={repositoryTreePath({repo, commitish: refInfo.name, action: 'tree'})}>
                {refNameOrCommit}
              </BranchName>
            </div>
          </div>
        </div>
      )}

      {!path && (
        <>
          <Heading as="h2" className="sr-only">
            Branch selector
          </Heading>
          <RefSelector
            cacheKey={refInfo.listCacheKey}
            canCreate={false}
            hotKey={'w'} // TODO - get from useShortcut?
            currentCommitish={refInfo.name}
            getHref={refName =>
              commitsPath({
                owner: repo.ownerLogin,
                repo: repo.name,
                ref: refName,
              })
            }
            selectedRefType={refInfo.refType}
            defaultBranch={repo.defaultBranch}
            owner={repo.ownerLogin}
            repo={repo.name}
            idEnding="commits"
          />
        </>
      )}
      <div className="d-flex flex-column flex-sm-row gap-2">
        <Heading as="h2" className="sr-only">
          User selector
        </Heading>
        <UserSelector
          defaultText="All users"
          width="medium"
          usersState={actorsState}
          showTypedInUser={true}
          currentUser={author ?? undefined}
          onOpenChange={open => open}
          onSelect={selectedUser => {
            if (selectedUser.login !== author?.login) {
              const authorRecord: Record<string, string> = {author: selectedUser.login}
              navigate(addOrModifyUrlParameters(authorRecord, ['author', 'before', 'after']))
            }
          }}
          renderCustomFooter={() => (
            <ActionList.LinkItem href={addOrModifyUrlParameters({}, ['author'])}>
              View commits for all users
            </ActionList.LinkItem>
          )}
        />

        <Suspense
          fallback={
            <Button leadingVisual={StyledCalendarIcon} trailingVisual={TriangleDownIcon}>
              All time
            </Button>
          }
        >
          <Heading as="h2" className="sr-only">
            Datepicker
          </Heading>
          <DatePicker
            variant="range"
            value={value}
            maxDate={new Date()}
            showTodayButton={true}
            showClearButton={true}
            compressedHeader={true}
            onChange={range => {
              if (!range) {
                // empty range is from the clear button
                navigate(addOrModifyUrlParameters({}, ['since', 'until']))
                return
              }

              const extractedRange = extractRange(range)
              if (!extractedRange) return
              const {startDate, endDate} = extractedRange
              const urlRecord: Record<string, string> = {since: startDate, until: endDate}
              const newUrl = addOrModifyUrlParameters(urlRecord, ['before', 'after'])
              navigate(newUrl)
            }}
            placeholder="All time"
            anchor={({children, ...props}) => (
              <Button
                {...props}
                data-testid="date-picker-commits"
                leadingVisual={StyledCalendarIcon}
                trailingVisual={TriangleDownIcon}
              >
                {children}
              </Button>
            )}
          />
        </Suspense>
      </div>
    </Box>
  )
}
