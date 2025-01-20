import {LockIcon, MirrorIcon, RepoForkedIcon, RepoIcon} from '@primer/octicons-react'
import {Link} from '@primer/react'

interface Props {
  /**
   * The octicon key that represents this repository's present state.
   * see Repository#repo_type_icon
   */
  icon: 'repo' | 'lock' | 'repo-forked' | 'mirror' | string
  name: string
  href: string
}

export default function RepositoryLabel({icon, name, href}: Props): JSX.Element {
  const renderRepositoryIcon = (): JSX.Element => {
    switch (icon) {
      case 'repo':
        return <RepoIcon />
      case 'lock':
        return <LockIcon />
      case 'repo-forked':
        return <RepoForkedIcon />
      case 'mirror':
        return <MirrorIcon />
      default:
        throw new Error('Unsupported repository icon')
    }
  }

  return (
    <Link href={href} muted>
      {renderRepositoryIcon()}
      &nbsp;
      {name}
    </Link>
  )
}
