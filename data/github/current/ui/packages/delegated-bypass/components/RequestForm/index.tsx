/* eslint eslint-comments/no-use: off */
/* eslint-disable filenames/match-regex */
import {type FC, type FormEvent, type PropsWithChildren, lazy, Suspense, useState} from 'react'
import {InfoIcon} from '@primer/octicons-react'
import {Box, Button, FormControl, Text, Textarea, Link} from '@primer/react'
import {createExemptionRequest} from '../../services/api'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {useParams} from 'react-router-dom'
import {useNavigate} from '@github-ui/use-navigate'
import {RoundedBox} from '../RoundedBox'
import {useDelegatedBypassSetBanner} from '../../contexts/DelegatedBypassBannerContext'
import type {RequestType, NewExemptionRequestPayload} from '../../delegated-bypass-types'
import {useRequestFormContext} from '../../contexts/RequestFormContext'
import {SecretScanningSecretsDetails} from '../SecretScanningSecretsDetails'
// eslint-disable-next-line @github-ui/github-monorepo/restrict-package-deep-imports
import type {RuleRun} from '@github-ui/repos-rules/types/rules-types'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import SecretScanningReviewersDialog from './SecretScanningReviewersDialog'

const SecretScanningRequestForm = lazy(() => import('./SecretScanningRequestForm'))

type RegisteredComponent = {
  displayName: string
  FormControls?: FC
  instructions: {
    title: string
    Content: () => JSX.Element
    ApproversFooter: () => JSX.Element
  }
  violations?: FC<{ruleRuns: RuleRun[]}>
}

export const componentRegistry: Record<RequestType, RegisteredComponent> = {
  push_ruleset_bypass: {
    displayName: 'push rules',
    instructions: {
      title: 'Resolve push protection violations',
      Content: () => <>Resolve push protection violations by removing the referenced commits from this push.</>,
      ApproversFooter: () => <Text sx={{ml: 1}}> Requests are sent to all approvers.</Text>,
    },
  },
  secret_scanning: {
    displayName: 'secret scanning',
    FormControls: () => (
      <Suspense>
        <SecretScanningRequestForm />
      </Suspense>
    ),
    instructions: {
      title: 'Remove detected secrets',
      Content: () => {
        const {owner} = useParams()
        const {helpUrl, orgGuidanceUrl} = useRoutePayload<NewExemptionRequestPayload>()

        if (orgGuidanceUrl) {
          return (
            <>
              <Link href={orgGuidanceUrl} inline>
                Review guidance
              </Link>{' '}
              from <span className="text-bold">{owner}</span> and{' '}
              <Link href={helpUrl} inline>
                remove any detected secrets
              </Link>{' '}
              from your commit and commit history.
            </>
          )
        }
        return (
          <>
            <Link href={helpUrl} inline>
              Remove any detected secrets
            </Link>{' '}
            from your commit and commit history.
          </>
        )
      },
      ApproversFooter: () => {
        const {approvers} = useRoutePayload<NewExemptionRequestPayload>()
        return <SecretScanningReviewersDialog approvers={approvers || [[], []]} />
      },
    },
    violations: ({ruleRuns}: {ruleRuns: RuleRun[]}) => (
      <Suspense>
        <SecretScanningSecretsDetails ruleRuns={ruleRuns} />
      </Suspense>
    ),
  },
}

export const RequestForm = ({
  instructions,
  children,
}: PropsWithChildren<{
  instructions: RegisteredComponent['instructions']
}>) => {
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [commentError, setCommentError] = useState('')
  const navigate = useNavigate()
  const {owner, repo} = useParams()
  const setBanner = useDelegatedBypassSetBanner()
  const {formValues} = useRequestFormContext()
  const {Content, ApproversFooter} = instructions

  function validateComment(comment: string) {
    if (comment.trim() === '') {
      setCommentError('A comment is required')
      return true
    } else {
      setCommentError('')
      return false
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    setSubmitting(true)
    e.preventDefault()
    if (validateComment(message)) {
      setSubmitting(false)
      return
    }
    const response = await createExemptionRequest(ssrSafeLocation.pathname, {...formValues, message: message.trim()})
    if (response.statusCode === 201) {
      setBanner({
        message: 'Your bypass request was submitted',
        variant: 'success',
      })
      navigate(response.redirect_uri || `/${owner}/${repo}/exemptions/${response.request_number}`)
    } else if (response.statusCode === 422 && response.error) {
      setBanner({
        message: response.error,
        variant: 'danger',
      })
    } else {
      setBanner({
        message: 'There was a problem submitting your bypass request',
        variant: 'danger',
      })
    }
    setSubmitting(false)
  }

  return (
    <RoundedBox sx={{minHeight: 530, mt: 4}}>
      <Box
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Text sx={{fontSize: 2, fontWeight: 'bold', mb: 1}}>{instructions.title}</Text>
        <span>
          <Content />
        </span>
      </Box>
      <Box
        as="form"
        sx={{p: 4, display: 'flex', flexDirection: 'column', gap: 4}}
        method="post"
        action={ssrSafeLocation.pathname}
        noValidate
        onSubmit={onSubmit}
      >
        <Box sx={{display: 'flex', flexDirection: 'column'}}>
          <Text sx={{fontSize: 2, fontWeight: 'bold', mb: 1}}>Or request bypass privileges</Text>
          <span>Submit a request to bypass these push protections. If granted, you may attempt this push again.</span>
        </Box>
        {children}
        <FormControl>
          <FormControl.Label required>Add a comment</FormControl.Label>
          <Textarea
            block
            sx={{height: 132}}
            placeholder="Type your comment here..."
            value={message}
            onChange={e => {
              setMessage(e.target.value)
              setCommentError('')
              validateComment(e.target.value)
            }}
            onBlur={e => validateComment(e.target.value)}
          />
          {commentError && <FormControl.Validation variant="error">{commentError}</FormControl.Validation>}
        </FormControl>
        <Button block type="submit" sx={{height: 40}} disabled={submitting}>
          Submit request
        </Button>
        <div className="note">
          <InfoIcon size={16} />
          <ApproversFooter />
        </div>
      </Box>
    </RoundedBox>
  )
}
