import {Box, Link, Text} from '@primer/react'

interface ImportHeaderProps {
  migrationFailed: boolean
}

export function ImportHeader({migrationFailed}: ImportHeaderProps) {
  const headerText = migrationFailed ? 'We found an error during import' : 'Preparing your new repository'

  const renderSubHeader = () => {
    if (!migrationFailed) {
      return (
        <Text
          as="p"
          sx={{
            fontStyle: 'italic',
            mb: 3,
          }}
        >
          There is no need to keep this window open. We&apos;ll email you when the import is done.
        </Text>
      )
    } else {
      return (
        <Text as="p" sx={{mb: 3}}>
          We recommend restarting the import process, but if you are still having trouble{'  '}
          <Link href="/contact" inline>
            contact support
          </Link>
          .
        </Text>
      )
    }
  }

  return (
    <Box
      sx={{
        mb: 2,
        pt: 2,
        borderBottomStyle: 'solid',
        borderBottomColor: 'border.muted',
        borderBottomWidth: 1,
        width: '100%',
      }}
    >
      <h1 data-hpc>{headerText}</h1>
      {renderSubHeader()}
    </Box>
  )
}
