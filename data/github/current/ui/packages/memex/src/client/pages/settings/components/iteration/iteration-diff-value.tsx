import {testIdProps} from '@github-ui/test-id-props'
import {type SxProp, Text} from '@primer/react'
import type {ReactNode} from 'react'

import {identity} from '../../../../../utils/identity'

type DiffValueProps = {
  originalValue?: string
  /** Custom render function for the original value. */
  renderOriginalValue?: (value: string) => ReactNode
  updatedValue?: string
  /** Custom render function for the updated value. */
  renderUpdatedValue?: (value: string) => ReactNode
  testId?: string
} & SxProp

export const DiffValue = ({
  originalValue = '',
  updatedValue = '',
  renderUpdatedValue = identity,
  renderOriginalValue = identity,
  sx,
  testId,
}: DiffValueProps) => {
  return (
    <Text sx={{mr: 2, ...(sx ?? {})}} {...(testId ? testIdProps(testId) : {})}>
      {originalValue === updatedValue ? (
        <span>{renderUpdatedValue(updatedValue)}</span>
      ) : (
        <>
          {originalValue && (
            <>
              <Text
                as="del"
                sx={{color: 'fg.subtle', textDecoration: 'line-through'}}
                {...testIdProps('original-value')}
              >
                {renderOriginalValue(originalValue)}
              </Text>
            </>
          )}
          {originalValue && updatedValue && <Text sx={{mr: 2}}> </Text>}
          {updatedValue && (
            <Text
              as="ins"
              sx={{
                textDecoration: 'none',
              }}
              {...testIdProps('updated-value')}
            >
              {renderUpdatedValue(updatedValue)}
            </Text>
          )}
        </>
      )}
    </Text>
  )
}
