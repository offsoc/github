import {Heading, Box, LinkButton, Link} from '@primer/react'

type Props = {
  owner: string
  docsUrls: {
    managing_policies: string
  }
}

export function NoCodePolicyBlankslate(props: Props) {
  return (
    <>
      <Heading as="h3" sx={{fontSize: 3, fontWeight: 400}}>
        Access management
      </Heading>
      <div className="mt-3 px-4 py-3 table-list-header table-list-header-next">
        <div className="flex-auto">
          <h4>Getting started with Copilot</h4>
        </div>
      </div>
      <div className="Box rounded-top-0 blankslate">
        <Box sx={{alignItems: 'center', display: 'flex', flexDirection: 'column'}} data-testid="cfb-no-seats">
          <>
            <h2 className="blankslate-heading">Configure code policies to start adding seats</h2>
            <p className="mb-3">
              Finish up the setup by configuring code suggestions.
              <br />
              You must select your preference to start using Copilot and assign seats to users.
              <br />
              <Link href={props.docsUrls.managing_policies} inline>
                Review documentation for more details
              </Link>
              .
            </p>
            <LinkButton
              href={`/organizations/${props.owner}/settings/copilot/policies`}
              size="medium"
              variant="default"
            >
              Go to policies
            </LinkButton>
          </>
        </Box>
      </div>
    </>
  )
}
