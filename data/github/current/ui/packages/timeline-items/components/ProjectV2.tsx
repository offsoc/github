import {TableIcon} from '@primer/octicons-react'
import {Link, Octicon} from '@primer/react'

type ProjectV2Props = {
  url: string
  title: string
}

export function ProjectV2({url, title}: ProjectV2Props): JSX.Element {
  return (
    <>
      <Octicon icon={TableIcon} />{' '}
      <Link href={url} sx={{color: 'fg.default'}} inline>
        {title}
      </Link>
    </>
  )
}
