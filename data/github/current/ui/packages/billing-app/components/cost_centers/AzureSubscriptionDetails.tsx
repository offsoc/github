import {PencilIcon, XIcon} from '@primer/octicons-react'
import {Box, Button, Dialog, FormControl, Heading, IconButton, LinkButton, Radio, RadioGroup, Text} from '@primer/react'
import {useState} from 'react'

import {Fonts, Spacing, boxStyle} from '../../utils/style'

import type {Subscription} from '../../types/cost-centers'

interface Props {
  encodedAzureSubscriptionUri: string
  setAzureTargetId: (azureSubscriptionId: string) => void
  subscriptions: Subscription[]
  targetId: string
  // Optionally display the azure details in view-only mode
  viewOnly?: boolean
}

export function AzureSubscriptionDetails({
  encodedAzureSubscriptionUri,
  setAzureTargetId,
  subscriptions,
  targetId,
  viewOnly = false,
}: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(true)
  const [selectedTargetId, setSelectedTargetId] = useState<string>(targetId)

  const handleSubmit = () => {
    setAzureTargetId(selectedTargetId)
    setIsOpen(false)
  }

  if (viewOnly && !targetId) {
    return <></>
  }

  return (
    <Box sx={{mb: Spacing.CardMargin}} data-testid="azure-subscription-id-box">
      <Box sx={{mb: 2}}>
        <Heading as="h3" sx={{fontSize: Fonts.SectionHeadingFontSize}}>
          Azure subscription ID
        </Heading>
        {!viewOnly && (
          <span>Add an optional Azure Subscription ID. You will be asked to authenticate through Azure.</span>
        )}
      </Box>
      {targetId && subscriptions ? (
        <Box sx={{...boxStyle, display: 'flex', alignItems: 'center'}} data-testid="azure-subscription-id-view">
          <Box sx={{display: 'flex', flexDirection: 'column'}}>
            <Text sx={{fontWeight: 'bold'}}>{subscriptions.find(s => s.subscriptionId === targetId)?.displayName}</Text>
            <Text sx={{color: 'fg.muted'}}> {targetId}</Text>
          </Box>
          {!viewOnly && (
            <>
              {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
              <IconButton
                unsafeDisableTooltip={true}
                icon={PencilIcon}
                variant="invisible"
                sx={{color: 'fg.muted', ml: 'auto'}}
                aria-label={`Change Azure subscription`}
                onClick={() => setAzureTargetId('')}
              />
              {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
              <IconButton
                unsafeDisableTooltip={true}
                icon={XIcon}
                variant="invisible"
                sx={{color: 'fg.muted', ml: 0}}
                aria-label={`Delete Azure subscription`}
                onClick={() => setAzureTargetId('')}
              />
            </>
          )}
        </Box>
      ) : (
        <Box className="Box" sx={{mt: 2, p: 3}}>
          <FormControl>
            <FormControl.Label visuallyHidden>Cost center Azure Subscription ID input</FormControl.Label>
            <LinkButton
              sx={{color: 'btn.text', ':hover': {textDecoration: 'none'}}}
              underline={false}
              href={encodedAzureSubscriptionUri}
            >
              Add Azure Subscription ID
            </LinkButton>
            {subscriptions.length > 0 && (
              <Dialog
                isOpen={isOpen}
                onDismiss={() => setIsOpen(false)}
                aria-labelledby="picker-header"
                sx={{width: 440, maxHeight: '80vh', display: 'flex', flexDirection: 'column'}}
              >
                <Dialog.Header id="picker-header">Connect Azure subscription</Dialog.Header>
                <Box sx={{p: Spacing.StandardPadding, overflow: 'auto', flex: '1 1 auto'}}>
                  <RadioGroup
                    name="azureSubscriptionGroup"
                    onChange={(value: string | null) => {
                      setSelectedTargetId(value ?? '')
                    }}
                  >
                    <RadioGroup.Label>
                      <Heading as="h3" sx={{fontSize: 3}}>
                        Select a subscription
                      </Heading>
                    </RadioGroup.Label>
                    {subscriptions.map(s => {
                      return (
                        <FormControl key={s.subscriptionId} sx={{...boxStyle}}>
                          <Radio name="subscription" value={s.subscriptionId} />
                          <FormControl.Label> {s.displayName} </FormControl.Label>
                          <FormControl.Caption> {s.subscriptionId} </FormControl.Caption>
                        </FormControl>
                      )
                    })}
                  </RadioGroup>
                </Box>
                {selectedTargetId && (
                  <Box sx={{display: 'flex', p: 3}}>
                    <Button block variant="primary" onClick={handleSubmit}>
                      Connect
                    </Button>
                  </Box>
                )}
              </Dialog>
            )}
          </FormControl>
        </Box>
      )}
    </Box>
  )
}
