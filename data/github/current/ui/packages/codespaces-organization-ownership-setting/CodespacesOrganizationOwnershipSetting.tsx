import {Button, Box, Dialog, Text, Octicon, Flash, Radio, RadioGroup, FormControl} from '@primer/react'
import {AlertIcon} from '@primer/octicons-react'
import {useRef, useState} from 'react'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {testIdProps} from '@github-ui/test-id-props'
export interface CodespacesOrganizationOwnershipSettingProps {
  currentValue: string
  disabled: boolean
  submitUrl: string
}

export const ORGANIZATION_CONFIRM_MESSAGE =
  'Any codespaces created on organization owned repositories and owned by organization members or collaborators with codespaces access will transfer ownership to your organization.'
export const USER_CONFIRM_MESSAGE =
  'All codespaces currently owned by your organization will transfer ownership to the creating user.'
export function CodespacesOrganizationOwnershipSetting({
  currentValue,
  disabled,
  submitUrl,
}: CodespacesOrganizationOwnershipSettingProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [flashMessage, setFlashMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedValue, setSelectedValue] = useState(currentValue)
  const returnFocusRef = useRef(null)

  const handleSubmit = async () => {
    const postForm = new FormData()

    postForm.append('codespaces_org_ownership_setting', selectedValue)

    try {
      const response = await verifiedFetch(submitUrl, {
        method: 'PUT',
        body: postForm,
        headers: {
          Accept: 'application/json',
        },
      })
      if (response.ok) {
        setIsOpen(false)
        const data = await response.json()
        setFlashMessage(data.message)
        setErrorMessage('') // clear error
        return response
      } else {
        return new Error('Failed to update')
      }
    } catch (error) {
      return error
    }
  }

  const selectedValueConfirmMessage = () => {
    if (selectedValue === 'organization') {
      return ORGANIZATION_CONFIRM_MESSAGE
    } else {
      return USER_CONFIRM_MESSAGE
    }
  }

  return (
    <div {...testIdProps('codespaces-org-ownership-setting')} className="mb-4">
      {flashMessage && <Flash>{flashMessage}</Flash>}
      {errorMessage && <Flash variant={'danger'}>{errorMessage}</Flash>}
      <h3 className="text-normal pb-2 mt-4">Codespace ownership</h3>
      <p>
        Control who owns codespaces created by your organization’s members on organization owned repositories. Codespace
        ownership dictates who is billed for usage, whose policies apply, and where audit logs are sent.
      </p>
      <div className="pt-3 pb-1">
        <form>
          <RadioGroup aria-labelledby="ownershipChoice" name="choiceGroup">
            <FormControl disabled={disabled}>
              <Radio
                name={'codespaces-ownership-setting'}
                value={'organization'}
                defaultChecked={currentValue === 'organization'}
                onClick={() => setSelectedValue('organization')}
                {...testIdProps('organization-radio-button')}
              />
              <FormControl.Label>
                Organization ownership
                <p {...testIdProps('organization-radio-button-label')} className="note">
                  All codespaces created by your organization’s members on your organization’s repositories are owned by
                  the organization
                </p>
              </FormControl.Label>
            </FormControl>
            <FormControl disabled={disabled}>
              <Radio
                name={'codespaces-ownership-setting'}
                value={'user'}
                defaultChecked={currentValue === 'user'}
                onClick={() => setSelectedValue('user')}
                {...testIdProps('user-radio-button')}
              />
              <FormControl.Label>
                User ownership
                <p {...testIdProps('user-radio-button-label')} className="note">
                  All codespaces created by your organization’s members on your organization’s repositories are owned by
                  the creating member
                </p>
              </FormControl.Label>
            </FormControl>
          </RadioGroup>
        </form>
      </div>
      <Button
        className="mt-2"
        ref={returnFocusRef}
        {...testIdProps('save-button')}
        onClick={() => setIsOpen(true)}
        disabled={disabled}
      >
        Save
      </Button>
      <Dialog
        isOpen={isOpen}
        returnFocusRef={returnFocusRef}
        onDismiss={() => setIsOpen(false)}
        aria-labelledby="update-codespaces-settings"
        {...testIdProps('dialog')}
      >
        <Dialog.Header id="update-codespaces-settings">Update GitHub Codespaces ownership settings?</Dialog.Header>
        <Box sx={{p: 3}}>
          <Text id="label" sx={{fontFamily: 'sans-serif'}}>
            <Octicon icon={AlertIcon} sx={{mr: 2, color: 'danger.fg'}} />
            {selectedValueConfirmMessage()}
          </Text>
          <Box sx={{display: 'flex', mt: 3, justifyContent: 'flex-end'}}>
            <Button sx={{mr: 1}} onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Submit
            </Button>
          </Box>
        </Box>
      </Dialog>
    </div>
  )
}
