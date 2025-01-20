import {RepoIcon, RepoLockedIcon} from '@primer/octicons-react'
import type {Repository} from '../models/models'
import {Link, Truncate} from '@primer/react'
import {Utils} from '../utils/utils'
import {RequestType} from '../models/enums'

interface MetricsCellProps {
  children: React.ReactNode
  tooltip?: string
}
export function MetricsCell(props: MetricsCellProps) {
  return (
    <Truncate inline={true} title={props.tooltip || ''} sx={{maxWidth: '100%'}}>
      <>{props.children}</>
    </Truncate>
  )
}

export function RepositoryCell(repository?: Repository, linkToMetrics?: boolean, requestType?: RequestType) {
  if (!repository) {
    return BlankCell()
  }

  const icon = repository.public ? (
    <RepoIcon size={16} className="mr-2" />
  ) : (
    <RepoLockedIcon size={16} className="mr-2" />
  )

  let url = repository.url

  if (linkToMetrics && requestType) {
    if (requestType === RequestType.Performance) {
      url += `/actions/metrics/performance`
    } else if (requestType === RequestType.Usage) {
      url += `/actions/metrics/usage`
    }
  }

  return (
    <MetricsCell tooltip={repository.name}>
      {icon} <LinkCell href={url}>{repository.name}</LinkCell>
    </MetricsCell>
  )
}

export function WorkflowCell(workflow?: string, repository?: Repository, org?: string) {
  if (workflow && repository && org) {
    const href = `/${org}/${repository.name}/actions/workflows/${workflow}`
    const workflowFileName = workflow.split('/').pop()
    return (
      <MetricsCell tooltip={workflowFileName || ''}>
        <LinkCell href={href}>{workflowFileName}</LinkCell>
      </MetricsCell>
    )
  }

  if (workflow) {
    const workflowFileName = workflow.split('/').pop()
    return <MetricsCell tooltip={workflowFileName || ''}>{workflowFileName}</MetricsCell>
  }

  return BlankCell()
}

export function NumberCell(num?: number, approximate?: boolean) {
  let numberToShow = ''

  if (num !== undefined) {
    let approximateNumber = num

    if (approximate) {
      approximateNumber = Math.floor(approximateNumber / 1000) * 1000 // round down to nearest thousand
    }

    numberToShow = approximateNumber?.toLocaleString() ?? ''
  }

  if (numberToShow && approximate) {
    numberToShow += '+'
  }

  return <MetricsCell tooltip={numberToShow}>{numberToShow}</MetricsCell>
}

export function PercentCell(num?: number) {
  let numberToShow = ''

  if (num !== undefined) {
    numberToShow = Utils.getPercentage(num)
  }

  return <MetricsCell>{numberToShow}</MetricsCell>
}

export function DurationCell(num?: number) {
  // number => xd xh xm xs
  let textToShow = ''

  if (num !== undefined) {
    textToShow = Utils.getDuration(num)
  }

  return <MetricsCell>{textToShow}</MetricsCell>
}

export function TextCell(str?: string) {
  return <MetricsCell tooltip={str ?? ''}>{str ?? ''}</MetricsCell>
}

interface LinkCellProps {
  href: string
  ariaLabel?: string
  children: React.ReactNode
}
function LinkCell(props: LinkCellProps) {
  return (
    <Link href={props.href} aria-label={props.ariaLabel}>
      {props.children}
    </Link>
  )
}

function BlankCell() {
  return <></>
}
