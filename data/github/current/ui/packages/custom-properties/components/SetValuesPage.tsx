import type {OrgCustomPropertiesDefinitionsPagePayload, Repository} from '@github-ui/custom-properties-types'
import {listOrgReposPropertyValuesPath} from '@github-ui/paths'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {ReposFilter} from '@github-ui/repos-filter'
import {NoReposMessage, useListResults, type UserInfo} from '@github-ui/repos-list-shared'
import {useSearchParams} from '@github-ui/use-navigate'
import {Breadcrumbs} from '@primer/react'
import {PageHeader} from '@primer/react/drafts'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'

import {useCurrentOrg} from '../contexts/CurrentOrgRepoContext'
import {useSetFlash} from '../contexts/FlashContext'
import {PropertiesEditingPage} from './PropertiesEditingPage'
import {PropertiesHeaderPageTabs} from './PropertiesHeaderPageTabs'
import {ReposPropertiesList} from './ReposPropertiesList'

// This page can only be accessed by org admins
const adminUserInfo: UserInfo = {
  admin: true,
  // This page never allows creating repos, no matter the current user
  canCreateRepository: false,
  directOrTeamMember: true,
}

export function SetValuesPage() {
  const payload = useRoutePayload<OrgCustomPropertiesDefinitionsPagePayload>()
  const {definitions, pageCount, repositories, repositoryCount, permissions} = payload

  const [initialParams] = useSearchParams()
  const [editingRepos, setEditingRepos] = useState<Repository[]>([])
  const [query, setQuery] = useState(initialParams.get('q') || '')
  const org = useCurrentOrg()

  const setFlash = useSetFlash()

  const showFilterDialog = useFeatureFlag('repos_list_show_filter_dialog')

  const {results, currentPage, isFetching, fetchResults} = useListResults<Repository>(
    {repositories, pageCount, repositoryCount},
    listOrgReposPropertyValuesPath({org: org.login}),
    Number(initialParams.get('page')),
  )

  const [selectedRepoIds, setSelectedRepoIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    setSelectedRepoIds(new Set())
  }, [currentPage, query])

  const editableProperties = useMemo(() => definitions.map(d => d.propertyName), [definitions])

  const onEditSuccess = () => {
    fetchResults({page: currentPage, q: query})
    setFlash('repos.properties.updated')
  }

  const selectRepos = useCallback(
    (repositorySelections: Repository[], buttonId: string) => {
      setFlash(null)
      setEditingRepos(repositorySelections)
      clickedEditButtonRef.current = {buttonId, offset: window.scrollY}
    },
    [setFlash, setEditingRepos],
  )

  const clickedEditButtonRef = useRef<null | {buttonId: string; offset: number}>(null)

  const isEditing = !!editingRepos.length
  useEffect(() => {
    const {buttonId, offset} = clickedEditButtonRef.current || {}
    if (!isEditing && buttonId && offset) {
      const button = document.getElementById(buttonId)
      button?.focus()
      window.scrollTo({top: offset})
    }
  }, [isEditing])

  if (isEditing) {
    const closePage = () => setEditingRepos([])

    const pageTitle =
      editingRepos.length === 1
        ? `Set properties on ${editingRepos[0]!.name}`
        : `Set properties on ${editingRepos.length} selected repositories`

    return (
      <PropertiesEditingPage
        definitions={definitions}
        editableProperties={editableProperties}
        onClose={closePage}
        onSuccess={() => {
          onEditSuccess()
          closePage()
        }}
        editingRepos={editingRepos}
        renderPageHeader={({canClose}) => (
          <PropertiesEditingPageHeader
            onCloseClick={async () => {
              if (await canClose()) closePage()
            }}
            pageTitle={pageTitle}
          />
        )}
      />
    )
  }

  function updateQuery(q: string) {
    setQuery(q)
  }

  function submitQuery(q: string) {
    fetchResults({q, page: 1, searchOnSubmitEnabled: true})
  }

  return (
    <>
      <PropertiesHeaderPageTabs permissions={permissions} definitions={definitions} />
      <ReposFilter
        id="repos-list-filter"
        sx={{flex: 1, mb: 3}}
        label="Search repositories"
        variant={showFilterDialog ? 'full' : 'input'}
        placeholder="Search repositories"
        filterValue={query}
        definitions={definitions}
        onChange={updateQuery}
        onSubmit={filterQuery => submitQuery(filterQuery.raw)}
      />
      <div data-hpc>
        {results.repositories.length ? (
          <ReposPropertiesList
            selectedRepoIds={selectedRepoIds}
            onSelectionChange={setSelectedRepoIds}
            repositoryCount={results.repositoryCount}
            pageCount={results.pageCount}
            repos={results.repositories}
            page={currentPage}
            showSpinner={isFetching}
            onPageChange={page => fetchResults({page, q: query})}
            onEditRepoPropertiesClick={selectRepos}
            orgName={org.login}
          />
        ) : (
          <NoReposMessage
            currentPage={currentPage}
            pageCount={results.pageCount}
            filtered={!!query}
            userInfo={adminUserInfo}
          />
        )}
      </div>
    </>
  )
}

function PropertiesEditingPageHeader({pageTitle, onCloseClick}: {pageTitle: string; onCloseClick: () => void}) {
  const backToParentRef = useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    window.scrollTo({top: 0})
    backToParentRef.current?.focus()
  }, [])

  return (
    <PageHeader sx={{mb: 3}}>
      <PageHeader.TitleArea sx={{pb: 2, borderBottom: 'solid 1px', borderColor: 'border.muted'}}>
        <PageHeader.Title>{pageTitle}</PageHeader.Title>
      </PageHeader.TitleArea>
      <PageHeader.ContextArea hidden={false}>
        <PageHeader.ContextBar hidden={false}>
          <Breadcrumbs>
            <Breadcrumbs.Item
              ref={backToParentRef}
              href="#"
              onClick={e => {
                e.preventDefault()
                onCloseClick()
              }}
            >
              Custom properties
            </Breadcrumbs.Item>
            <Breadcrumbs.Item selected>{pageTitle}</Breadcrumbs.Item>
          </Breadcrumbs>
        </PageHeader.ContextBar>
      </PageHeader.ContextArea>
    </PageHeader>
  )
}
