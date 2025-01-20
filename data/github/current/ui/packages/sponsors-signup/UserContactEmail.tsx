import {testIdProps} from '@github-ui/test-id-props'
import {FormControl, Link, Select} from '@primer/react'

export interface ContactEmails {
  [email: string]: UserEmail | BillingEmail
}

interface UserEmail {
  email: string
  type: 'user'
  id: number
}

export interface BillingEmail {
  email: string
  type: 'billing'
}

export interface UserContactEmailProps {
  possibleContactEmails: ContactEmails
  contactEmailUpdatePath: string
  currentContactEmail?: string
}

export function UserContactEmail({
  possibleContactEmails,
  contactEmailUpdatePath,
  currentContactEmail,
}: UserContactEmailProps) {
  const getEmailOptions = (contactEmails: ContactEmails): UserEmail[] => {
    return Object.values(contactEmails).filter((email): email is UserEmail => email.type === 'user')
  }
  const emailOptions = getEmailOptions(possibleContactEmails)

  return (
    <>
      <FormControl>
        <FormControl.Label>Contact email</FormControl.Label>
        <Select
          name="sponsors_listing[contact_email_id]"
          defaultValue={currentContactEmail || ''}
          sx={{width: '100%'}}
          aria-describedby="contact-email-description"
          {...testIdProps('user-contact-email')}
        >
          {emailOptions.map(email => (
            <Select.Option key={email.email} value={email.id.toString()}>
              {email.email}
            </Select.Option>
          ))}
        </Select>
        <span id="contact-email-description" className="note">
          Select a verified email address for us to contact you about your GitHub Sponsors profile. This will not be
          shared publicly. You can manage verified email addresses in your{' '}
          <Link href={contactEmailUpdatePath} inline={true}>
            email settings
          </Link>
          .
        </span>
      </FormControl>
    </>
  )
}
