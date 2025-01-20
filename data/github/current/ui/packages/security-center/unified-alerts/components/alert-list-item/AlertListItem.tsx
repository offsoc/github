import CodeScanningAlert, {type CodeScanningAlertProps} from './CodeScanningAlert'
import DependabotAlert, {type DependabotAlertProps} from './DependabotAlert'
import SecretScanningAlert, {type SecretScanningAlertProps} from './SecretScanningAlert'

export type AlertListItemProps = DependabotAlertProps | CodeScanningAlertProps | SecretScanningAlertProps

export function AlertListItem(props: AlertListItemProps): JSX.Element {
  switch (props.featureType) {
    case 'dependabot_alerts':
      return <DependabotAlert {...props} />
    case 'code_scanning':
      return <CodeScanningAlert {...props} />
    case 'secret_scanning':
      return <SecretScanningAlert {...props} />
    default:
      throw new Error('Unsupported alert type')
  }
}
