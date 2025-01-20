import {PeopleIcon, SearchIcon} from '@primer/octicons-react'
import {Blankslate} from '@primer/react/drafts'

export type EmptyListProps = {
  businessName: string
  businessSlug: string
  searchString?: string
  hideCreateTeamButton?: boolean
}

const EmptyList = ({businessName, businessSlug, searchString, hideCreateTeamButton = false}: EmptyListProps) => {
  if (searchString) {
    return (
      <div data-testid={`filtered-empty-list`}>
        <Blankslate border={true}>
          <Blankslate.Visual>
            <SearchIcon size="medium" />
          </Blankslate.Visual>
          <Blankslate.Heading>No enterprise teams found</Blankslate.Heading>
          <Blankslate.Description>
            There aren&apos;t any enterprise teams matching &apos;{searchString}&apos;
          </Blankslate.Description>
        </Blankslate>
      </div>
    )
  }

  return (
    <div data-testid={`empty-list`}>
      <Blankslate border={true}>
        <Blankslate.Visual>
          <PeopleIcon size="medium" />
        </Blankslate.Visual>
        <Blankslate.Heading>{businessName} has no enterprise teams</Blankslate.Heading>
        {!hideCreateTeamButton && (
          <>
            <Blankslate.Description>Get started by creating a new enterprise team</Blankslate.Description>
            <Blankslate.PrimaryAction href={`/enterprises/${businessSlug}/new_team`}>
              New enterprise team
            </Blankslate.PrimaryAction>
          </>
        )}
      </Blankslate>
    </div>
  )
}

export default EmptyList
