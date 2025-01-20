import {Breadcrumbs, Link} from '@primer/react'
import {ArrowLeftIcon} from '@primer/octicons-react'

interface INetworkConfigurationHeadingProps {
  link: string
  previousPageText: string
  currentPageText: string
  isBusiness: boolean
}

export function NetworkConfigurationHeading(props: INetworkConfigurationHeadingProps) {
  return (
    <>
      {props.isBusiness ? (
        <div className="pb-3">
          <Link href={props.link}>
            <ArrowLeftIcon size={16} className="mr-2" />
            Back to {props.previousPageText}
          </Link>
        </div>
      ) : (
        <Breadcrumbs sx={{mb: 3}}>
          <Breadcrumbs.Item href={props.link}>{props.previousPageText}</Breadcrumbs.Item>
          <Breadcrumbs.Item selected>{props.currentPageText}</Breadcrumbs.Item>
        </Breadcrumbs>
      )}
    </>
  )
}
