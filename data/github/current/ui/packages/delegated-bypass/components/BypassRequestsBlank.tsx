import {Blankslate} from '@primer/react/drafts'

export function BypassRequestsBlank() {
  return (
    <Blankslate>
      <Blankslate.Heading>No bypass requests found</Blankslate.Heading>
      <Blankslate.Description>Try adjusting the filters to refine your search.</Blankslate.Description>
    </Blankslate>
  )
}
