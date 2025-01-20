import {useFilesPageInfo} from '../contexts/FilesPageInfoContext'
import {useCurrentRepository} from '@github-ui/current-repository'
import {repoDefaultBrachUrl, repoOverviewUrl} from '@github-ui/paths'
import type {PageError} from '@github-ui/react-core/app-routing-types'
import {AlertIcon} from '@primer/octicons-react'
import {Box, BranchName, Link, LinkButton, Octicon} from '@primer/react'
import LinkButtonCSS from '../css/LinkButton.module.css'
import {clsx} from 'clsx'

export function CodeViewError(error: PageError) {
  const repo = useCurrentRepository()
  const {refInfo, path} = useFilesPageInfo()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        margin: 16,
      }}
    >
      <div className="d-flex flex-column flex-justify-center flex-items-center border rounded-2 px-6 py-7">
        <Octicon icon={AlertIcon} className="fgColor-muted mb-2" size={20} />
        <ErrorText {...error} />
        {(path || !refInfo.currentOid) && (
          <LinkButton
            type="button"
            className={clsx('mt-4', LinkButtonCSS['code-view-link-button'])}
            variant="primary"
            aria-label={refInfo.currentOid ? 'go to Overview' : 'go to default branch'}
            href={refInfo.currentOid ? repoOverviewUrl(repo) : repoDefaultBrachUrl(repo)}
          >
            {refInfo.currentOid ? 'Return to the repository overview' : 'Go to default branch'}
          </LinkButton>
        )}
      </div>
    </Box>
  )
}

function ErrorText({httpStatus, type}: PageError) {
  const title = httpStatus === 404 ? '404 - page not found' : 'Error loading page'

  return (
    <div className="d-flex flex-column flex-items-center gap-1 text-center">
      <div className="f2 fgColor-default text-bold">{title}</div>

      {httpStatus === 404 ? <DescriptionText404 /> : <DefaultDescriptionText httpStatus={httpStatus} type={type} />}
    </div>
  )
}

function DescriptionText404() {
  const repo = useCurrentRepository()
  const {path, refInfo} = useFilesPageInfo()

  if (!refInfo.currentOid) {
    return (
      <div className="d-flex flex-wrap flex-justify-center fgColor-muted" data-testid="error-404-description">
        Cannot find a valid ref in&nbsp;
        <BranchName as="p" className="mb-0">
          {refInfo.name}
        </BranchName>
      </div>
    )
  }

  return (
    <div className="d-flex flex-wrap flex-justify-center fgColor-muted" data-testid="eror-404-description">
      The&nbsp;
      <BranchName as="p" className="mb-0">
        {refInfo.name}
      </BranchName>
      &nbsp;branch of&nbsp;
      <p className="text-bold mb-0">{repo.name}</p>
      &nbsp;does not contain the path&nbsp;
      <p className="text-bold mb-0">{path}.</p>
    </div>
  )
}

function DefaultDescriptionText({httpStatus, type}: {httpStatus?: number; type?: string}) {
  const errorNumberText = httpStatus ? ` ${httpStatus} error` : 'error'

  if (type === 'fetchError') {
    return (
      <div className="f5 fgColor-muted" data-testid="fetch-error-description">
        It looks like your internet connection is down. Please check it.
      </div>
    )
  }

  return (
    <div className="f5 fgColor-muted" data-testid="default-error-description">
      An unexpected {errorNumberText} occured. Try
      <Link inline onClick={() => window.location.reload()} key="reload-page">
        &nbsp;reloading the page.
      </Link>
    </div>
  )
}
