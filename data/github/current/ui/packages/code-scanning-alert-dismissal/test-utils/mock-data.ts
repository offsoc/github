import type {CodeScanningAlertDismissalProps} from '../CodeScanningAlertDismissal'

export function getCodeScanningAlertDismissalProps(): CodeScanningAlertDismissalProps {
  return {
    alertClosureReasons: {
      TEST_REASON: 'Test Reason',
    },
    closeReasonDetails: {
      TEST_REASON: 'These alerts are not <dismissal reason>',
    },
    path: 'http://close.com/',
    refNames: ['refs/heads/\u2764', 'refs/heads/\u{1F494}', 'refs/heads/\u{1F1FA}\u{1F1F8}'],
  }
}
