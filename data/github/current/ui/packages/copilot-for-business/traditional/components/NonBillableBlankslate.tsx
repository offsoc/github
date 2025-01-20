import {Box, Link, LinkButton} from '@primer/react'
import {ssrSafeLocation} from '@github-ui/ssr-utils'

type Props = {
  owner: string
  type: 'organization' | 'enterprise'
  viewerIsAdmin: boolean
}

export function NonBillableBlankslate(props: Props) {
  const adminViewLink = props.viewerIsAdmin ? (
    <Link
      sx={{textDecoration: 'underline'}}
      href={`${ssrSafeLocation.origin}/${props.type}s/${props.owner}/settings/billing/summary`}
    >
      Review billing for more details.
    </Link>
  ) : (
    "Contact your enterprise's adminstrator to add a payment method."
  )
  return (
    <div className="Box rounded-top-0 blankslate">
      <Box sx={{alignItems: 'center', display: 'flex', flexDirection: 'column'}} data-testid="cfb-no-seats">
        <>
          <h2 className="blankslate-heading">Provide payment details to start adding seats</h2>
          <p className="mb-3">
            No payment details provided. You must add a payment method in order to use Copilot. Each purchased seat is
            $19/month. {adminViewLink}
          </p>
          {props.viewerIsAdmin && (
            <LinkButton
              href={`${ssrSafeLocation.origin}/${props.type}s/${props.owner}/settings/billing/payment_information`}
              size="medium"
              variant="default"
            >
              Confirm payment details
            </LinkButton>
          )}
        </>
      </Box>
    </div>
  )
}
