import {clsx} from 'clsx'
import {currency as formatCurrency} from '@github-ui/formatters'
import {CheckIcon} from '@primer/octicons-react'
import {Link, Octicon} from '@primer/react'
import {planCost} from '../../helpers/plan'
import {pluralize} from '../../helpers/text'
import type {PlanText} from '../../types'
import styles from './styles.module.css'

interface ConfirmationMessageProps {
  planText: PlanText
  membersCount: number
  newSeatCount: number
  isOnCopilotBusinessTrial: boolean | undefined
  formatBusinessTrialEndsAt: () => string
}
export function ConfirmationMessage(props: ConfirmationMessageProps) {
  const {planText, membersCount, newSeatCount, isOnCopilotBusinessTrial, formatBusinessTrialEndsAt} = props
  return (
    <>
      <div className="mb-0">
        <span className={clsx(styles.confirmationText, 'mb-3')}>
          Copilot in your organization has
          {planText === 'Enterprise' && (
            <Link href="https://docs.github.com/en/enterprise-cloud@latest/copilot/github-copilot-enterprise">
              {' '}
              Enterprise license
            </Link>
          )}
          {planText === 'Business' && (
            <Link href="https://docs.github.com/en/enterprise-cloud@latest/copilot/copilot-business">
              {' '}
              Business license
            </Link>
          )}{' '}
          issued by enterprise administrator.
        </span>
        <div className={clsx(styles.confirmationText, 'mt-2', 'mb-0')}>
          Please confirm you want to grant access to Copilot to{' '}
          <span className="text-bold" data-testid={`confirmation-messages-${membersCount}-members`}>
            {pluralize(membersCount, 'member', 's')}
          </span>{' '}
          of this organization.
        </div>
      </div>
      <div>
        <Octicon icon={CheckIcon} className="fgColor-success mr-1" />
        <span className="text-bold mb-4">
          You will be adding {pluralize(newSeatCount, 'Copilot seat', 's')}
          {isOnCopilotBusinessTrial ? '.' : ' to your monthly bill.'}
        </span>
      </div>
      <div>
        <Octicon icon={CheckIcon} className="fgColor-success mr-1" />
        <span className="text-bold">
          {isOnCopilotBusinessTrial
            ? `You will not be charged until ${formatBusinessTrialEndsAt()}.`
            : `Estimated monthly cost is ${formatCurrency(planCost(planText) * membersCount)} ($${planCost(
                planText,
              )}/month each seat).`}
        </span>
      </div>
      {!isOnCopilotBusinessTrial && <hr className="my-0" />}
    </>
  )
}
