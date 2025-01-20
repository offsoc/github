import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {GlobeIcon, KebabHorizontalIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, IconButton, Link, Pagination, Spinner} from '@primer/react'
import {Blankslate, Dialog} from '@primer/react/drafts'
import {useQuery} from '@tanstack/react-query'
import {useEffect, useState} from 'react'
import {useParams} from 'react-router-dom'

export type SecurityManagerTeam = {
  name: string
  slug: string
  path: string
}

export type SecurityManagerTeamsResponse = {
  teams: SecurityManagerTeam[]
  totalPages: number
}

export interface SecurityManagerTeamListProps {
  search: string
  hideRemoveAction?: boolean
}

export function SecurityManagerTeamList({search, hideRemoveAction = false}: SecurityManagerTeamListProps): JSX.Element {
  const {business} = useParams()
  const [securityManagerTeams, setSecurityManagerTeams] = useState<SecurityManagerTeam[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [showRemoveDialogForTeam, setShowRemoveDialogForTeam] = useState<SecurityManagerTeam | null>(null)

  const {
    isSuccess,
    isFetching,
    isError,
    refetch: refetchSecurityManagerTeams,
    data: securityManagerTeamsResponse,
  } = useQuery<SecurityManagerTeamsResponse>({
    queryKey: ['security-manager-teams', business, currentPage, search],
    queryFn: async () => {
      const url = new URL(`/enterprises/${business}/security-managers/teams`, window.location.origin)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search,
      })
      url.search = params.toString()
      const resp = await verifiedFetchJSON(url.toString())
      if (!resp.ok) {
        throw new Error('Failed to fetch security manager teams')
      }
      return resp.json()
    },
  })

  useEffect(() => {
    if (securityManagerTeamsResponse) {
      const {teams, totalPages: total} = securityManagerTeamsResponse
      setSecurityManagerTeams(teams)
      setTotalPages(total)
      if (currentPage > total) {
        setCurrentPage(total)
      }
    }
  }, [currentPage, securityManagerTeamsResponse])

  const handleDelete = (slug: string) => {
    return async (): Promise<void> => {
      const url = new URL(`/enterprises/${business}/security-managers/${slug}`, window.location.origin)
      const resp = await verifiedFetchJSON(url.toString(), {method: 'DELETE'})
      setShowRemoveDialogForTeam(null)

      if (resp.ok) {
        refetchSecurityManagerTeams()
      }
    }
  }

  function TeamList(): JSX.Element {
    const list = securityManagerTeams.map(team => (
      <div
        key={team.slug}
        data-testid={`esm-team-${team.slug}`}
        className="d-flex flex-items-center flex-justify-between border-bottom p-3"
      >
        <div className="d-flex flex-items-center">
          <GlobeIcon size={24} className="border rounded-1 p-1" />
          <Link href={team.path} muted className="pl-2">
            {team.name}
          </Link>
        </div>
        {!hideRemoveAction && (
          <ActionMenu>
            <ActionMenu.Anchor>
              <IconButton
                icon={KebabHorizontalIcon}
                size="small"
                aria-label="Open column options"
                variant="invisible"
                data-testid={`column-options-${team.slug}`}
              />
            </ActionMenu.Anchor>
            <ActionMenu.Overlay align="end">
              <ActionList>
                <ActionList.Item
                  variant="danger"
                  onSelect={() => setShowRemoveDialogForTeam(team)}
                  data-testid={`remove-team-${team.slug}`}
                >
                  Remove
                </ActionList.Item>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        )}
      </div>
    ))

    if (list.length === 0) {
      return (
        <Blankslate>
          <Blankslate.Visual>
            <GlobeIcon size={24} />
          </Blankslate.Visual>
          <Blankslate.Heading>No security manager teams found</Blankslate.Heading>
        </Blankslate>
      )
    }

    return (
      <>
        {list}
        <Pagination currentPage={currentPage} pageCount={totalPages} onPageChange={(_, page) => setCurrentPage(page)} />
      </>
    )
  }

  return (
    <>
      <div className="border rounded-2">
        {isFetching && (
          <div className="d-flex flex-items-center flex-justify-center flex-auto p-3">
            <Spinner srText="Fetching Security manager teams" />
          </div>
        )}
        {isError && (
          <div className="d-flex flex-items-center flex-justify-center flex-auto p-3">
            Error loading security manager teams, please try again.
          </div>
        )}
        {isSuccess && <TeamList />}
      </div>
      {showRemoveDialogForTeam != null && (
        <Dialog
          onClose={() => setShowRemoveDialogForTeam(null)}
          title="Remove security manager"
          footerButtons={[
            {content: 'Cancel', onClick: (): void => setShowRemoveDialogForTeam(null)},
            {
              content: 'Remove security manager team permission',
              onClick: handleDelete(showRemoveDialogForTeam.slug),
              buttonType: 'danger' as const,
            },
          ]}
        >
          <div className="p-2">
            <p className="mx-2">
              This action will remove team members from all organizations within your enterprise unless they were
              already members of those organizations. Existing organization members will retain their membership.
            </p>
            <p className="mx-2">This change will notify the owners of each of these organizations.</p>
            <p className="mx-2">Please note that this change may take some time to propagate to all organizations.</p>
            <p className="mx-2">Are you sure you want to proceed?</p>
          </div>
        </Dialog>
      )}
    </>
  )
}
