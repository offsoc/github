import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {SearchIcon} from '@primer/octicons-react'
import {Box, Button} from '@primer/react'
import {Blankslate, Dialog} from '@primer/react/drafts'
import {Banner, FilteredActionList} from '@primer/react/experimental'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useCallback, useEffect, useRef, useState} from 'react'
import {useParams} from 'react-router-dom'

interface EnterpriseTeam {
  name: string
  slug: string
}

export function AssignmentDialog(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const [activePanel, setPanel] = useState<1 | 2>(1)
  const [search, setSearch] = useState('')
  const [filteredTeams, setFilteredTeams] = useState<EnterpriseTeam[]>([])
  const [selectedTeams, setSelectedTeams] = useState<EnterpriseTeam[]>([])
  const [errorText, setErrorText] = useState('')

  const {business} = useParams()
  const {
    isLoading,
    isLoadingError,
    data: teams,
  } = useQuery<EnterpriseTeam[]>({
    queryKey: ['assignment-suggestions', business],
    queryFn: async () => {
      const url = new URL(`/enterprises/${business}/security-managers/assignment-suggestions`, window.location.origin)
      const resp = await verifiedFetchJSON(`${url.pathname}${url.search}`)

      if (!resp.ok) {
        throw new Error('Failed to load teams')
      }

      return resp.json()
    },
    enabled: isOpen, // Fetch the data when the dialog is opened
  })
  useEffect(() => {
    if (isLoadingError) {
      setErrorText(
        'Failed to load teams. Please refresh the page and try again. If the issue persists, contact GitHub support.',
      )
    }
  }, [isLoadingError])

  useEffect(() => {
    if (isLoadingError) {
      return
    }

    if (search) {
      setFilteredTeams((teams ?? []).filter(team => team.name.toLowerCase().includes(search)))
    } else {
      setFilteredTeams(teams ?? [])
    }
  }, [search, teams, isLoadingError])

  const assignSecurityManagersMutation = useMutation({
    mutationFn: async (teamsToAssign: EnterpriseTeam[]) => {
      const url = new URL(`/enterprises/${business}/security-managers`, window.location.origin)

      return Promise.allSettled(
        teamsToAssign.map(team => {
          const body = {teamSlugs: [team.slug]}
          return verifiedFetchJSON(url.pathname, {method: 'POST', body})
        }),
      )
    },
  })

  const onCancel = useCallback(() => {
    setSearch('')
    setFilteredTeams(teams ?? [])
    setSelectedTeams([])
    setPanel(1)
    setIsOpen(false)
    assignSecurityManagersMutation.reset()
  }, [teams, assignSecurityManagersMutation])

  const onSelect = useCallback(
    (team: EnterpriseTeam) => {
      if (selectedTeams.some(st => st.slug === team.slug)) {
        setSelectedTeams(selectedTeams.filter(st => st.slug !== team.slug))
      } else {
        setSelectedTeams(selectedTeams.concat(team))
      }
    },
    [selectedTeams],
  )

  const queryClient = useQueryClient()
  const onSubmit = useCallback(async () => {
    setErrorText('')
    assignSecurityManagersMutation.mutate(selectedTeams, {
      onSettled: () => queryClient.invalidateQueries({queryKey: ['assignment-suggestions', business]}),
      onSuccess: results => {
        // Remove teams that were successfully assigned the security manager role
        setSelectedTeams(
          selectedTeams.filter(
            (_, i) => results[i] == null || results[i].status !== 'fulfilled' || !results[i].value.ok,
          ),
        )

        if (results.every(result => result.status === 'fulfilled' && result.value.ok)) {
          onCancel()
          window.location.reload()
        } else if (results.some(result => result.status === 'fulfilled' && result.value.ok)) {
          setErrorText(
            'Some teams could not be assigned the security manager role. Please try again. If the issue persists, contact GitHub support.',
          )
        } else {
          setErrorText(
            'Failed to assign the security manager role. Please try again. If the issue persists, contact GitHub support.',
          )
        }
      },
    })
  }, [selectedTeams, assignSecurityManagersMutation, queryClient, business, onCancel])
  const submitting = assignSecurityManagersMutation.isPending

  const footerButtons =
    activePanel === 1
      ? [
          {content: 'Cancel', onClick: onCancel},
          {
            content: 'Next',
            onClick: (): boolean | void => {
              if (selectedTeams.length > 0) {
                setPanel(2)
              } else {
                setErrorText('Please select at least one team to assign to the security manager role.')
              }
            },
            buttonType: 'primary' as const,
            disabled: isLoading,
          },
        ]
      : [
          {content: 'Back', disabled: submitting, onClick: (): void => setPanel(1)},
          {
            content: 'Yes, assign the role',
            onClick: onSubmit,
            buttonType: 'primary' as const,
            loading: submitting,
            loadingAnnouncement: 'Saving',
          },
        ]

  // Clear the error when the panel changes or the dialog is opened/closed
  useEffect(() => setErrorText(''), [activePanel, isOpen])

  // Focus error banner header when it appears
  const bannerRef = useRef<HTMLElement>(null)
  useEffect(() => {
    errorText && bannerRef.current?.querySelector('h2')?.focus()
  }, [errorText])

  return (
    <>
      <Button
        variant="primary"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        data-testid="assignment-dialog-button"
      >
        Assign new team
      </Button>

      {isOpen && (
        <Dialog
          title="Assign security manager role"
          onClose={onCancel}
          height={activePanel === 1 ? 'small' : 'auto'}
          width="large"
          renderBody={({children}) => {
            // Setting the height to the space allotted by the dialog to make scrolling work properly for FilteredActionList.
            return <Dialog.Body sx={{height: '100%', p: 0}}>{children}</Dialog.Body>
          }}
          footerButtons={footerButtons}
        >
          <Box
            className="d-flex flex-column"
            sx={
              // Adapted from https://github.com/primer/react/blob/41b75deba71d1cd741c6296e919d2a85d7e7f3fe/packages/react/src/SelectPanel/SelectPanel.tsx#L226-L228
              // to make scrolling work properly.
              {maxHeight: '100%'}
            }
          >
            {errorText && (
              <Banner variant="critical" className="m-2" ref={bannerRef}>
                <Banner.Title as="h2" tabIndex={-1}>
                  Something went wrong
                </Banner.Title>
                {errorText}
              </Banner>
            )}
            {activePanel === 1 && (
              <>
                <FilteredActionList
                  placeholderText="Search for teams"
                  aria-label="Select teams"
                  selectionVariant="multiple"
                  aria-multiselectable
                  onFilterChange={setSearch}
                  loading={isLoading}
                  items={filteredTeams.map(team => ({
                    id: team.slug,
                    text: team.name,
                    selected: selectedTeams.some(st => st.slug === team.slug),
                    onAction: () => onSelect(team),
                    role: 'option',
                  }))}
                  textInputProps={
                    // Copied from https://github.com/primer/react/blob/41b75deba71d1cd741c6296e919d2a85d7e7f3fe/packages/react/src/SelectPanel/SelectPanel.tsx#L167-L175
                    // to make the search input look like the one in SelectPanel.
                    {
                      sx: {m: 2},
                      contrast: true,
                      leadingVisual: SearchIcon,
                    }
                  }
                />

                {!isLoading && filteredTeams.length === 0 && (
                  <Blankslate spacious>
                    <Blankslate.Heading>No teams found</Blankslate.Heading>
                    <Blankslate.Description>
                      {search
                        ? 'No teams found for the search term.'
                        : 'Create a team to assign the security manager role.'}
                    </Blankslate.Description>
                  </Blankslate>
                )}
              </>
            )}

            {activePanel === 2 && (
              <div className="p-2">
                <p className="text-bold mx-2">
                  We will add the team members to all organizations within your enterprise.
                </p>
                <p className="mx-2">This change will notify the owners of each of these organizations.</p>
                <p className="mx-2">
                  Please note that this change may take some time to propagate to all organizations.
                </p>
                <p className="mx-2">Are you sure you want to proceed?</p>
              </div>
            )}
          </Box>
        </Dialog>
      )}
    </>
  )
}
