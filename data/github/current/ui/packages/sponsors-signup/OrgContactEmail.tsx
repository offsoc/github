import {testIdProps} from '@github-ui/test-id-props'
import {FormControl, Link, TextInput} from '@primer/react'
import type {ContactEmails, BillingEmail} from './UserContactEmail'

export interface OrgContactEmailProps {
  possibleContactEmails: ContactEmails
  contactEmailUpdatePath: string
}

export function OrgContactEmail({possibleContactEmails, contactEmailUpdatePath}: OrgContactEmailProps) {
  const getEmailOptions = (contactEmails: ContactEmails): BillingEmail[] => {
    return Object.values(contactEmails).filter((email): email is BillingEmail => email.type === 'billing')
  }
  const billingEmail = getEmailOptions(possibleContactEmails)[0]

  return (
    <FormControl disabled={true}>
      <FormControl.Label>Contact email</FormControl.Label>
      <TextInput
        name="billing_email"
        sx={{width: '100%'}}
        {...testIdProps('org-contact-email')}
        defaultValue={billingEmail?.email || ''}
        readOnly
      />
      <span className="note">
        The organization billing email where we will contact you about your GitHub Sponsors profile. This will not be
        shared publicly. Change it in the{' '}
        <Link href={contactEmailUpdatePath} inline={true}>
          organization profile page
        </Link>
        .
      </span>
    </FormControl>
  )
}
