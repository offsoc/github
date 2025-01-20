import type {RepoPolicyInfo} from '@github-ui/code-view-types'
import {SafeHTMLBox, type SafeHTMLString} from '@github-ui/safe-html'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {Link, Spinner} from '@primer/react'
import {useEffect, useState} from 'react'

interface ErrorState {
  header?: string
  message?: React.ReactNode
}

export async function getCodespacesTabContent({
  codespacesPath,
  contactPath,
}: {
  codespacesPath: string
  contactPath: string
}) {
  let errorState: ErrorState = {header: '', message: ''}
  let loading: boolean = true
  let content: string = ''

  const result = await verifiedFetch(codespacesPath)

  if (result.ok) {
    content = await result.text()
    loading = false
  } else {
    loading = false
    errorState = {
      header: 'Codespace access limited',
      message: defaultErrorMessage(contactPath),
    }
  }

  return {
    errorState,
    loading,
    content,
  }
}

export function buildCodespacesPath(repoId: number, refName: string) {
  const encodeRef = encodeURIComponent(refName)
  return `/codespaces?codespace%5Bref%5D=${encodeRef}&current_branch=${encodeRef}&event_target=REPO_PAGE&repo=${repoId}`
}

function defaultErrorMessage(contactPath: string) {
  return (
    <span>
      An unexpected error occurred. Please{' '}
      <Link inline href={contactPath}>
        contact support
      </Link>{' '}
      for more information.
    </span>
  )
}

export interface CodespacesTabProps {
  hasAccessToCodespaces: boolean
  repositoryPolicyInfo?: RepoPolicyInfo
  contactPath: string
  currentUserIsEnterpriseManaged?: boolean
  enterpriseManagedBusinessName?: string
  newCodespacePath?: string
  codespacesPath: string
  isLoggedIn: boolean
}

export function CodespacesTab(props: CodespacesTabProps) {
  const {
    hasAccessToCodespaces,
    repositoryPolicyInfo,
    contactPath,
    currentUserIsEnterpriseManaged,
    enterpriseManagedBusinessName,
    newCodespacePath,
    codespacesPath,
    isLoggedIn,
  } = props
  const [codespacesContent, setCodespacesContent] = useState('')
  const [codespacesLoading, setCodespacesLoading] = useState(hasAccessToCodespaces)
  const [errorState, setErrorState] = useState<ErrorState>(() => {
    if (hasAccessToCodespaces) {
      return {}
    }

    if (!isLoggedIn) {
      return {
        header: 'Sign In Required',
        message: (
          <span>
            Please{' '}
            <Link inline href={newCodespacePath}>
              sign in
            </Link>{' '}
            to use Codespaces.
          </span>
        ),
      }
    }

    const initialErrorState: ErrorState = {header: '', message: ''}

    if (!repositoryPolicyInfo?.allowed) {
      initialErrorState.header = 'Codespace access limited'
      if (!repositoryPolicyInfo?.canBill && currentUserIsEnterpriseManaged) {
        initialErrorState.message = (
          <span>
            <Link href="https://docs.github.com/enterprise-cloud@latest/admin/identity-and-access-management/using-enterprise-managed-users-for-iam/about-enterprise-managed-users">
              Enterprise-managed users
            </Link>
            {` must have their Codespaces usage paid for by ${enterpriseManagedBusinessName || 'their enterprise'}.`}
          </span>
        )
      } else if (repositoryPolicyInfo?.hasIpAllowLists) {
        initialErrorState.message = (
          <span>
            Your organization or enterprise enforces{' '}
            <Link
              inline
              href="https://docs.github.com/enterprise-cloud@latest/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/managing-allowed-ip-addresses-for-your-organization"
            >
              IP allow lists
            </Link>
            Which are unsupported by Codespaces at this time.
          </span>
        )
      } else if (repositoryPolicyInfo?.disabledByBusiness) {
        initialErrorState.message = (
          <span>
            Your enterprise has disabled Codespaces at this time. Please contact your enterprise administrator for more
            information.
          </span>
        )
      } else if (repositoryPolicyInfo?.disabledByOrganization) {
        initialErrorState.message = (
          <span>
            Your organization has disabled Codespaces on this repository. Please contact your organization administrator
            for more information.
          </span>
        )
      } else {
        initialErrorState.message = defaultErrorMessage(contactPath)
      }
    } else if (!repositoryPolicyInfo?.changesWouldBeSafe) {
      initialErrorState.header = 'Repository access limited'
      initialErrorState.message = (
        <span>You do not have access to push to this repository and its owner has disabled forking.</span>
      )
    } else {
      initialErrorState.header = 'Codespace access limited'
      initialErrorState.message = defaultErrorMessage(contactPath)
    }

    return initialErrorState
  })

  useEffect(() => {
    const fetchData = async () => {
      // Return early to avoid refetching content if it's already loaded
      if (codespacesContent) {
        return
      }

      const data = await getCodespacesTabContent({
        contactPath,
        codespacesPath,
      })

      // eslint-disable-next-line @typescript-eslint/no-shadow
      const {errorState, loading, content} = data

      if (errorState.header && errorState.message) {
        setErrorState(errorState)
      }

      setCodespacesLoading(loading)
      setCodespacesContent(content)
    }

    if (hasAccessToCodespaces) {
      fetchData()
    }
  }, [contactPath, codespacesPath, hasAccessToCodespaces, codespacesContent])

  return (
    <div className="d-flex flex-justify-center">
      {codespacesLoading ? (
        <span className="m-2">
          <Spinner />
        </span>
      ) : errorState.header && errorState.message ? (
        <div className="blankslate">
          <h4 className="mb-1">{errorState.header}</h4>
          <p className="mt-2 mx-4">{errorState.message}</p>
        </div>
      ) : (
        <SafeHTMLBox className="width-full" html={codespacesContent as SafeHTMLString} />
      )}
    </div>
  )
}
