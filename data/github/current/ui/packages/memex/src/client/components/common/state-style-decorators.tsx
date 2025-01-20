import {testIdProps} from '@github-ui/test-id-props'
import {CheckIcon, XIcon} from '@primer/octicons-react'
import {Box, type BoxProps, type CaretProps, Octicon, PointerBox, type PointerBoxProps, Spinner} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

import type {Status} from '../../hooks/use-api-request'
import {CommitState} from '../../hooks/use-autosave'
import {Resources} from '../../strings'

type ErrorStateProps = {
  message?: string
  caret?: CaretProps['location']
  testId?: string
}

const sharedStyles = {
  bg: 'danger.subtle',
  borderColor: 'danger.fg',
  color: 'danger.fg',
}

const AlertStyledBox: React.FC<Omit<BoxProps, 'sx'>> = props => (
  <Box
    sx={{
      padding: '8px 16px',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: '6px',
      fontSize: '14px',
      lineHeight: '20px',
      ...sharedStyles,
    }}
    {...props}
  />
)

const ErrorStyledPointerBox: React.FC<Omit<PointerBoxProps, 'sx'>> = props => (
  <PointerBox
    sx={{
      marginTop: '16px',
      padding: '8px 6px',
      borderRadius: '6px',
      fontSize: '12px',
      lineHeight: '18px',
      ...sharedStyles,
    }}
    {...props}
  />
)

/*
 * A component to indicate failure of an action inline
 * Return a styled box indicating error
 *  - default message is 'Something went wrong' but it can be customized
 *  - the association with the input field is done through a caret, default positioned on the top-left
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  message = Resources.genericErrorMessage,
  caret,
  testId = 'error-state-message-box',
}) => {
  const CustomBox = caret ? ErrorStyledPointerBox : AlertStyledBox
  return (
    <>
      <Box sx={{flexBasis: '100%'}} />
      <CustomBox caret={caret} {...testIdProps(testId)}>
        {message}
      </CustomBox>
      <Box sx={{flexBasis: '100%'}} />
    </>
  )
}

/*
 * A component to indicate success of an action inline
 * Return a green checkbox indicating success
 */
export const SuccessState: React.FC = () => <Octicon icon={CheckIcon} sx={{ml: 3, color: 'success.fg'}} />

interface RequestStateProps {
  status: Status<void>['status'] | CommitState
}

/** Shows an icon that indicates the state of a request. */
export const RequestStateIcon = ({status}: RequestStateProps) => {
  switch (status) {
    case 'idle':
    case CommitState.None:
      return <></>
    case 'failed':
    case CommitState.Failed:
      return <Octicon icon={XIcon} sx={{color: 'danger.fg'}} />
    case 'loading':
      return <Spinner size="small" />
    case 'succeeded':
    case CommitState.Successful:
      return <Octicon icon={CheckIcon} sx={{color: 'success.fg'}} />
  }
}

export const errorStyle: BetterSystemStyleObject = {
  borderColor: `#CB2431 !important`,
}
