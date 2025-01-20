import {currency as formatCurrency} from '@github-ui/formatters'
import {Dialog, Box, Flash, Button, Text} from '@primer/react'
import {planCost} from '../../helpers/plan'
import {pluralize} from '../../helpers/text'
import {CopilotForBusinessSeatPolicy} from '../../types'
import type {PlanText, CopilotForBusinessTrial} from '../../types'
import {formatBusinessTrialEndsAt} from '../../helpers/date'

type ConfirmPolicyUpdateProps = {
  isOpen: boolean
  revertPolicy: () => void
  currentPolicy: CopilotForBusinessSeatPolicy
  nextPolicy: CopilotForBusinessSeatPolicy
  seatCount: number
  confirmSave: (arg?: {keep: boolean}) => void
  planText: PlanText
  businessTrial?: CopilotForBusinessTrial
}

export function PolicyConfirmationDialog(props: ConfirmPolicyUpdateProps) {
  const {isOpen, revertPolicy, currentPolicy, nextPolicy, seatCount, confirmSave, businessTrial, planText} = props

  const toSelected = nextPolicy === CopilotForBusinessSeatPolicy.EnabledForSelected
  const hasSeatsToReadd = currentPolicy === CopilotForBusinessSeatPolicy.Disabled && seatCount > 0
  const toSelectedText = toSelected ? 'specifically-selected users and teams' : 'all users'

  return (
    <Dialog
      isOpen={isOpen}
      onDismiss={revertPolicy}
      aria-labelledby="header-id"
      sx={{width: '100%', maxWidth: '760px'}}
    >
      <Dialog.Header id="header-id">Confirm policy update</Dialog.Header>
      <Box sx={{p: 3}}>
        <Flash>
          <p>
            You are enabling GitHub Copilot for <Text sx={{fontWeight: 'bold'}}>{toSelectedText}</Text> in your
            organization.
          </p>
        </Flash>
        <Box sx={{py: 3}}>
          <>
            <p>
              You can choose to either renew seats for members pending removal or start by adding seats from scratch.
            </p>
            <p className="pt-3">
              Select the option <Text sx={{fontWeight: 'bold'}}>Start from scratch</Text> to begin adding new seats.
              Seats that are pending removal will not regain access.
            </p>
            <p>
              <>
                Choose <Text sx={{fontWeight: 'bold'}}>Renew seats</Text> to reassign all seats that are pending removal
                {toSelected ? ' to their respective members' : ''}. Users will retain their seats and you will have the
                ability to add new members and manually remove users who should not have access to Copilot.
              </>
            </p>
          </>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          p: 3,
          justifyContent: hasSeatsToReadd ? 'space-between' : 'flex-end',
          alignItems: 'center',
          borderTopColor: 'border.default',
          borderTopStyle: 'solid',
          borderTopWidth: 1,
        }}
      >
        {hasSeatsToReadd && (
          <div data-testid="confirmation-policy-expected-cost">
            <Text sx={{fontWeight: 'bold'}}>{pluralize(seatCount, 'seat', 's')}</Text>
            <span> with an approximate cost of </span>
            <Text sx={{fontWeight: 'bold'}}>
              {businessTrial && businessTrial.has_trial && businessTrial.copilot_plan === 'business'
                ? `${formatCurrency(0)} (Free until ${formatBusinessTrialEndsAt(businessTrial)})`
                : formatCurrency(planCost(planText) * seatCount)}
            </Text>
          </div>
        )}
        <Box sx={{display: 'flex'}}>
          <Button variant="default" data-testid="scratch-button" onClick={() => confirmSave()} sx={{mr: 1}}>
            Start from scratch
          </Button>
          <Button variant="primary" data-testid="keep-button" onClick={() => confirmSave({keep: true})}>
            Renew seats
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}
