import {AlertIcon, ArchiveIcon, LockIcon} from '@primer/octicons-react'
import {Box, Text} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

import {Resources} from '../../../strings'

const containerStyle: BetterSystemStyleObject = {
  position: 'relative',
  p: '32px',
  textAlign: 'center',
}

const iconStyle: BetterSystemStyleObject = {
  mx: 1,
  mb: 2,
  color: 'fg.muted',
}

const textStyle = {
  color: 'fg.muted',
  mt: 2,
}

export function SelectMenuError(props: {error: Error}) {
  const apiErrorCode = props.error.name
  let displayErrorMessage: string | undefined = undefined
  let icon

  switch (apiErrorCode) {
    case 'RepoArchived': {
      displayErrorMessage = Resources.repoArchivedErrorMessage
      icon = <ArchiveIcon size={26} />
      break
    }
    case 'Forbidden': {
      displayErrorMessage = Resources.forbiddenErrorMessage
      icon = <LockIcon size={26} />
      break
    }
    case 'IssueTypesDisabledForRepo':
    case 'IssueTypesDisabledForRepoOwner': {
      displayErrorMessage = props.error.message
      icon = <AlertIcon size={26} />
      break
    }
    default: {
      displayErrorMessage = Resources.genericErrorMessage
      icon = <AlertIcon size={26} />
      break
    }
  }

  return (
    <Box sx={containerStyle}>
      <Box sx={iconStyle}>{icon}</Box>
      <Text as="p" sx={textStyle}>
        {displayErrorMessage}
      </Text>
    </Box>
  )
}
