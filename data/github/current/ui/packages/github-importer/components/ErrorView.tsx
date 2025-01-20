import {Box, Octicon, Flash, Text, Details, useDetails} from '@primer/react'
import {AlertIcon, ChevronDownIcon, ChevronUpIcon} from '@primer/octicons-react'
import {useEffect, useState, useRef} from 'react'

interface ErrorViewProps {
  migrationFailureReason: string
  migrationErrorDetails: string[]
}

export function ErrorView({migrationFailureReason, migrationErrorDetails}: ErrorViewProps) {
  const [truncatedMigrationErrorDetails, setTruncatedMigrationErrorDetails] = useState<string[]>([])
  const failureRef = useRef<HTMLDivElement | null>(null)

  const {getDetailsProps, open} = useDetails({closeOnOutsideClick: true})

  useEffect(() => {
    // Focus on the flash message when it's present
    if (failureRef.current) {
      failureRef.current.focus()
    }
  }, [failureRef])

  useEffect(() => {
    if (migrationErrorDetails && migrationErrorDetails.length > 20) {
      const errors = migrationErrorDetails.slice(0, 20)
      errors.push('* This list has been truncated to 20 lines')
      setTruncatedMigrationErrorDetails(errors)
    } else {
      setTruncatedMigrationErrorDetails(migrationErrorDetails)
    }
  }, [migrationErrorDetails])

  return (
    <Flash
      variant="danger"
      sx={{mb: 3, mt: 3, width: '100%'}}
      className="anim-fade-in"
      ref={failureRef}
      tabIndex={-1}
      data-testid="import-failure-flash"
    >
      <div aria-label="Migration failure reason" role="alert">
        <Octicon icon={AlertIcon} />
        <Text as="span" sx={{fontSize: 2, fontStyle: 'semibold'}}>
          {migrationFailureReason}
        </Text>
      </div>
      {truncatedMigrationErrorDetails?.length > 0 && (
        <Details {...getDetailsProps()}>
          <Box
            as={'summary'}
            sx={{pt: 3, pb: 1, px: 0}}
            title={open ? 'Hide Error Details' : 'Show Error Details'}
            data-testid={'migration-error-details'}
          >
            <span>Error Details{'  '}</span>
            <Octicon icon={open ? ChevronUpIcon : ChevronDownIcon} />
          </Box>
          <ul className="mt-2 list-style-none d-flex flex-column gap-2">
            {truncatedMigrationErrorDetails?.map((detail, index) => <li key={index}>{detail}</li>)}
          </ul>
        </Details>
      )}
    </Flash>
  )
}
