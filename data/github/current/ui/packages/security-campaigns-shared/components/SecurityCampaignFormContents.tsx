import {useId, useMemo} from 'react'
import {Box, Flash, FormControl, TextInput, Textarea} from '@primer/react'
import {DatePicker} from '@github-ui/date-picker'
import {SecurityCampaignManagerSelect} from './SecurityCampaignManagerSelect'
import {useSecurityCampaignFormContext} from './SecurityCampaignFormContext'

export interface SecurityCampaignFormContentsProps {
  campaignManagersPath: string
}

export function SecurityCampaignFormContents({campaignManagersPath}: SecurityCampaignFormContentsProps) {
  const {
    campaignName,
    setCampaignName,
    campaignDescription,
    setCampaignDescription,
    campaignManager,
    setCampaignManager,
    campaignDueDate,
    setCampaignDueDate,
    allowDueDateInPast,
    handleSubmit: handleFormSubmit,
    formError,
  } = useSecurityCampaignFormContext()

  const datePickerMinDate = useMemo(() => {
    if (allowDueDateInPast) {
      return undefined
    } else {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      return date
    }
  }, [allowDueDateInPast])

  const handleSubmit = async (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault()

    handleFormSubmit()
  }

  const managerLabelId = useId()

  return (
    <>
      {formError && <Flash variant="danger">{formError.message}</Flash>}
      <form onSubmit={handleSubmit}>
        <Box sx={{pb: 3}}>
          <FormControl required>
            <FormControl.Label>Campaign name</FormControl.Label>
            <TextInput
              placeholder="A short and descriptive name for this security campaign."
              sx={{width: '100%'}}
              value={campaignName}
              maxLength={50}
              name="campaign_name"
              onChange={e => setCampaignName(e.target.value)}
            />
          </FormControl>
        </Box>
        <Box sx={{pb: 3}}>
          <FormControl required>
            <FormControl.Label>Short description</FormControl.Label>
            <Textarea
              placeholder="Let everybody know what this security campaign is about and why it's important to remediate these alerts."
              sx={{width: '100%'}}
              rows={5}
              value={campaignDescription}
              maxLength={255}
              name="campaign_description"
              onChange={e => setCampaignDescription(e.target.value)}
            />
          </FormControl>
        </Box>
        <Box sx={{pb: 3}}>
          <FormControl required>
            <FormControl.Label>Campaign due date</FormControl.Label>
            <DatePicker
              value={campaignDueDate}
              minDate={datePickerMinDate}
              onChange={d => setCampaignDueDate(d)}
              // Ensures the popup appears on screen instead of being cut off
              anchoredOverlayProps={{side: 'outside-top'}}
            />
            <FormControl.Caption>Date to address all campaign alerts</FormControl.Caption>
          </FormControl>
        </Box>
        <Box sx={{pb: 3}}>
          <FormControl required>
            <FormControl.Label id={managerLabelId}>Campaign manager</FormControl.Label>
            <SecurityCampaignManagerSelect
              value={campaignManager}
              onChange={setCampaignManager}
              campaignManagersPath={campaignManagersPath}
              aria-labelledby={managerLabelId}
            />
            <FormControl.Caption>The user will be the campaign contact</FormControl.Caption>
          </FormControl>
        </Box>
      </form>
    </>
  )
}
