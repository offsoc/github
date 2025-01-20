import {Box, Label, Link, Octicon} from '@primer/react'
import {userHovercardPath} from '@github-ui/paths'
import {LABELS} from '../../constants/labels'
import {graphql} from 'relay-runtime'
import {useFragment} from 'react-relay'
import type {RepositoryPill$key} from './__generated__/RepositoryPill.graphql'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import type {FC} from 'react'
import {RepoIcon} from '@primer/octicons-react'

const RepositoryPillFragment = graphql`
  fragment RepositoryPill on Issue {
    repository {
      name
      owner {
        login
      }
      isPrivate
    }
  }
`

export type RepositoryPillProps = {
  repositoryPillData: RepositoryPill$key
  sx?: BetterSystemStyleObject
  isSmall?: boolean
}

export const SmallRepositoryPill: FC<RepositoryPillProps> = props => <RepositoryPill {...props} isSmall={true} />

export function RepositoryPill({repositoryPillData, sx, isSmall = false}: RepositoryPillProps) {
  const {repository} = useFragment(RepositoryPillFragment, repositoryPillData)
  const repoOwner = repository.owner.login
  const repoName = repository.name

  const link = (
    <Box
      sx={{
        alignItems: 'center',
        color: 'fg.subtle',
        display: 'flex',
        flexDirection: 'row',
        flexShrink: 1,
        flexWrap: 'nowrap',
        fontSize: 0,
        fontWeight: 'normal',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        height: isSmall ? undefined : '32px',
      }}
    >
      {!isSmall && <Octicon icon={RepoIcon} sx={{mr: 1, mt: '2px'}} />} {/* 2px to achieve visual alignment */}
      <Link
        href={`/${repoOwner}`}
        sx={{
          color: 'fg.muted',
          fontWeight: 'normal',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          flexBasis: 'auto',
          flexShrink: 1,
          minWidth: 'var(--base-size-24, 24px)',
        }}
        data-hovercard-url={userHovercardPath({owner: repoOwner})}
      >
        {repoOwner}
      </Link>
      <span>/</span>
      <Link
        href={`/${repoOwner}/${repoName}`}
        sx={{
          color: 'fg.muted',
          fontWeight: 'normal',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          flexBasis: 'auto',
          flexShrink: 4,
          minWidth: 'var(--base-size-24, 24px)',
        }}
      >
        {repoName}
      </Link>
    </Box>
  )

  if (isSmall) {
    return link
  }

  return (
    <Box
      sx={{
        color: 'fg.subtle',
        fontWeight: 'normal',
        fontSize: 0,
        display: 'flex',
        gap: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        px: 'var(--control-small-paddingInline-normal, 12px)',
        pr: 'var(--control-medium-paddingBlock, 6px)', // 6px, this traces the edge of the private/public label
        border: '1px solid',
        borderColor: 'var(--borderColor-muted, var(--color-border-muted))',
        borderRadius: '32px',
        height: '32px',
        ...sx,
      }}
    >
      {link}
      <Label
        size="small"
        data-watch-overflow
        sx={{
          ml: 1,
          color: 'fg.default',
          background: 'var(--bgColor-neutral-muted, var(--color-neutral-muted))',
          border: 'none',
        }}
      >
        {repository.isPrivate ? LABELS.private : LABELS.public}
      </Label>
    </Box>
  )
}
