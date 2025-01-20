import {Dialog} from '@primer/react/experimental'
import {Text, Box, Link} from '@primer/react'
import {ENABLEMENT_FAILURES_MAP} from '../utils/helpers'
import {useAppContext} from '../contexts/AppContext'

interface FailureReasonDialogProps {
  reason: string
  repositoryName: string
  configurationName: string
  setShowFailureReasonDialog: React.Dispatch<React.SetStateAction<boolean>>
}

interface FailureDialogBodyMap {
  [dialogTitle: string]: {
    body: JSX.Element
    remediations: JSX.Element[]
  }
}

const dialogTitleText = (failureReason: string | undefined) => {
  if (!failureReason) return 'Something went wrong'

  const reason: {frontend_dialog_title?: string} | undefined = ENABLEMENT_FAILURES_MAP.get(failureReason)

  return reason && reason['frontend_dialog_title'] ? reason['frontend_dialog_title'] : 'Something went wrong'
}

const FailureReasonDialog: React.FC<FailureReasonDialogProps> = ({
  reason,
  repositoryName,
  configurationName,
  setShowFailureReasonDialog,
}) => {
  const {docsUrls} = useAppContext()
  const title = dialogTitleText(reason)
  const repositoryNameText = <strong>{repositoryName}</strong>

  const FAILURE_DIALOG_BODY_MAP: FailureDialogBodyMap = {
    'Not enough licenses': {
      body: (
        <>
          {configurationName} is enabling GitHub Advanced Security features but you don’t have enough licenses. As a
          private repository, {repositoryNameText} requires 1 additional GitHub Advanced Security license.
        </>
      ),
      remediations: [
        <>Purchase more licenses and re-apply this configuration.</>,
        <>Apply a configuration that excludes GitHub Advanced Security.</>,
      ],
    },
    'Code scanning: Actions disabled': {
      body: (
        <>
          {configurationName} is enabling code scanning default setup, which requires actions, but actions is disabled
          at the repository/organization/enterprise level.
        </>
      ),
      remediations: [
        <>Enable Actions and re-apply this configuration.</>,
        <>Apply a configuration that delegates code scanning default setup.</>,
      ],
    },
    'Code scanning: Advanced setup conflict': {
      body: (
        <>
          {configurationName} is enabling code scanning default setup but {repositoryNameText} has an existing advanced
          setup.
        </>
      ),
      remediations: [
        <>Disable advanced setup on {repositoryNameText} and re-apply this configuration.</>,
        <>Apply a configuration that delegates code scanning default setup.</>,
      ],
    },
    'Code scanning: Runners unavailable': {
      body: (
        <>
          Code scanning default setup can only be enabled if runners with the label <code>code-scanning</code> (or{' '}
          <code>macOS</code> for Swift) are assigned to this repository.
        </>
      ),
      remediations: [
        <>
          Create a runner with the label <code>code-scanning</code>.
        </>,
        <>Ensure that this repository has access to the runner.</>,
      ],
    },
    'Something went wrong': {
      body: <>Something unexpected went wrong.</>,
      remediations: [
        <>Re-apply this configuration</>,
        <>
          <Link inline href="https://support.github.com/">
            Contact GitHub Support
          </Link>{' '}
          if you continue having issues.
        </>,
      ],
    },
    'GHAS not allowed by enterprise': {
      body: (
        <>
          This configuration is enabling GitHub Advanced Security features, but using GitHub Advanced Security is
          restricted by your enterprise policy.
        </>
      ),
      remediations: [
        <>Contact your enterprise administrators to allow GitHub Advanced Security enablement on this organization.</>,
        <>Apply a configuration that excludes GitHub Advanced Security.</>,
      ],
    },
    'GHAS not purchased': {
      body: (
        <>
          This configuration is enabling GitHub Advanced Security features, but GitHub Advanced Security has not been
          purchased by your organization.
        </>
      ),
      remediations: [
        <>
          <Link inline href={docsUrls.ghasTrial}>
            Trial GitHub Advanced Security
          </Link>
          .
        </>,
        <>Apply a configuration that excludes GitHub Advanced Security.</>,
      ],
    },
    'Automatic dependency submission: Actions disabled': {
      body: (
        <>
          Automatic dependency submission requires actions, but actions is disabled at the
          repository/organization/enterprise level.
        </>
      ),
      remediations: [
        <>Enable Actions and re-apply this configuration.</>,
        <>Apply a configuration that delegates automatic dependency setup.</>,
      ],
    },
    'Automatic dependency submission: Labeled runners unavailable': {
      body: (
        <>
          Automatic dependency submission requires that the repository has access to runners with the label
          &apos;dependency-submission&apos;
        </>
      ),
      remediations: [
        <>Create a runner group with the dependency-submission label.</>,
        <>Ensure that this repository has been added to the runner group.</>,
        <>Apply a configuration that delegates automatic dependency setup.</>,
      ],
    },
  }

  const body = FAILURE_DIALOG_BODY_MAP[title]?.body
  const remediations = FAILURE_DIALOG_BODY_MAP[title]?.remediations || []

  return (
    <>
      <Dialog title={title} onClose={() => setShowFailureReasonDialog(false)}>
        <div data-testid="failure-dialog-body">{body}</div>
        <Box sx={{mt: 3, p: 3, borderRadius: 2, backgroundColor: 'neutral.muted'}}>
          <Text sx={{fontWeight: 'bold', color: 'fg.muted'}}>Remediation options</Text>
          <ul data-testid="failure-dialog-remediations" style={{marginLeft: 20, marginTop: 4}}>
            {remediations.map((remediation, i) => (
              <li key={`remediation${i.toString()}`} style={{marginTop: 4}}>
                {remediation}
              </li>
            ))}
          </ul>
        </Box>
      </Dialog>
    </>
  )
}

export default FailureReasonDialog
