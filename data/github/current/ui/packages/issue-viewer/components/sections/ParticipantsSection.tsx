import {graphql, useFragment} from 'react-relay'

import {LABELS} from '../../constants/labels'
import {ReadonlySectionHeader} from '@github-ui/issue-metadata/ReadonlySectionHeader'
import {Section} from '@github-ui/issue-metadata/Section'
import type {ParticipantsSectionFragment$key} from './__generated__/ParticipantsSectionFragment.graphql'
import {Box, Button} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import {Suspense, useState} from 'react'
import {Participant} from './Participant'
import {ParticipantsListLoading} from './ParticipantsListLoading'
import {ParticipantsList} from './ParticipantsList'

type ParticipantsSectionProps = {
  issue: ParticipantsSectionFragment$key
}

export function ParticipantsSection({issue}: ParticipantsSectionProps) {
  const {
    repository: {
      owner: {login: owner},
      name: repo,
    },
    number,
    participants,
  } = useFragment(
    graphql`
      fragment ParticipantsSectionFragment on Issue {
        ... on Issue {
          repository {
            name
            owner {
              login
            }
          }
          number
          participants(first: 10) {
            nodes {
              ...ParticipantFragment
              id
            }
            totalCount
          }
        }
      }
    `,
    issue,
  )

  const filteredParticipants = (participants.nodes || []).flatMap(a => (a ? a : [])).slice(0, 5)
  const [isOpen, setIsOpen] = useState(false)

  const hasParticipants = filteredParticipants.length > 0
  const showMoreCount = participants.totalCount - 5
  const showMoreAriaLabel = showMoreCount
    ? `and ${showMoreCount} other participants, click to see the full list`
    : undefined

  return (
    <Section
      sectionHeader={<ReadonlySectionHeader title={LABELS.sectionTitles.participants} />}
      emptyText={hasParticipants ? undefined : LABELS.emptySections.participants}
    >
      <Box
        data-testid="sidebar-participants-section"
        sx={{display: 'flex', flexDirection: 'row', width: '100%', px: 2, pt: 2, mb: 2, alignItems: 'center'}}
      >
        <Box sx={{display: 'flex', flexDirection: 'row', gap: 1}}>
          {filteredParticipants.map(participant => (
            <Participant key={participant.id} participant={participant} />
          ))}
        </Box>
        {showMoreCount > 0 && (
          <Button
            aria-label={showMoreAriaLabel}
            variant="invisible"
            onClick={() => setIsOpen(true)}
            sx={{color: 'fg.subtle', fontWeight: 'normal', pl: 1, pr: 1, ml: 2}}
          >
            +{showMoreCount}
          </Button>
        )}
        {isOpen && (
          <Dialog title="Participants" onClose={() => setIsOpen(false)}>
            <Box sx={{overflowY: 'auto', minHeight: '300px', maxHeight: '600px'}}>
              <Suspense fallback={<ParticipantsListLoading />}>
                <ParticipantsList owner={owner} repo={repo} number={number} totalCount={participants.totalCount} />
              </Suspense>
            </Box>
          </Dialog>
        )}
      </Box>
    </Section>
  )
}
