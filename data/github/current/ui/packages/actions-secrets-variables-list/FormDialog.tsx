import type {FormEvent} from 'react'
import {useState} from 'react'
import {Dialog} from '@primer/react/drafts'
import {Flash, FormControl, TextInput, Textarea} from '@primer/react'
import {fetchSessionInSudo, sudoPrompt} from '@github-ui/sudo'
import {verifiedFetch} from '@github-ui/verified-fetch'
import capitalize from 'lodash-es/capitalize'
import {ItemsScope, ListMode, FormMode, type Item, type FormDialogProps} from './types'
import {testIdProps} from '@github-ui/test-id-props'
import {encryptString} from './util'

// eslint-disable-next-line import/no-nodejs-modules
import {Buffer} from 'buffer'

export const FormDialog = ({
  mode,
  name,
  value,
  onClose,
  tableDataUpdater,
  formMode,
  publicKey,
  keyId,
  url,
}: FormDialogProps) => {
  const [err, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [nameValue, setNameValue] = useState<string>(name || '')
  const [itemValue, setItemValue] = useState<string>(value || '')

  const prefix = capitalize(formMode)

  const [visible, setVisible] = useState(true)
  const [saving, setSaving] = useState(false)

  const resetToDefaultStates = () => {
    setError(false)
    setErrorMessage('')
    setSaving(false)
  }

  const handleSubmit = async (e: FormEvent<HTMLElement>) => {
    resetToDefaultStates()
    if (!nameValue || !itemValue || (!keyId && mode === ListMode.secret)) {
      setError(true)
      setErrorMessage('Name and value are required')
      return
    }

    if (url) {
      // If we're updating a secret or variable, we need to check if the user is in sudo mode
      if (formMode !== FormMode.add) {
        // check if the current session is in sudo mode
        let sessionInSudo = await fetchSessionInSudo()

        // if not in sudo mode, we need to prompt the user to confirm access to sudo mode
        if (!sessionInSudo) {
          // we need to hide this dialog so that the sudo modal doesn't have issues with focus trapping
          setVisible(false)
          sessionInSudo = await sudoPrompt(e.currentTarget)
          setVisible(true)
          // if the user cancels the sudo prompt, we can stop here with an error
          if (!sessionInSudo) {
            setError(true)
            setErrorMessage('Re-authentication required')
            return
          }
        }
      }

      // Set form data
      const formData = new FormData()
      setSaving(true)
      if (mode === ListMode.secret) {
        if (keyId && publicKey !== undefined) {
          const encryptedValue = await encryptString(itemValue, publicKey)

          formData.set('secret_name', nameValue)
          formData.set('encrypted_value', encryptedValue)
          formData.set('key_id', keyId)
        } else {
          // This error should only occur from improper use of the component, should never surface to user
          setError(true)
          setErrorMessage('Secret encryption failed: missing public key')
          return
        }
      } else if (mode === ListMode.variable) {
        formData.set(formMode === FormMode.update ? 'variable_updated_name' : 'variable_name', nameValue)
        formData.set('variable_value', itemValue)
      }

      // Do request and handle result
      const resp = await verifiedFetch(url, {
        method: formMode === FormMode.add ? 'POST' : 'PUT',
        body: formData,
      })
      setSaving(false)
      if (resp.ok) {
        onClose()

        // Pre-encrypt variables for re-render in parent component
        const finalValue = mode === ListMode.secret ? undefined : Buffer.from(itemValue).toString('base64')
        const result: Item = {
          name: nameValue.toUpperCase(),
          value: finalValue,
          scope: ItemsScope.Environment,
          updated_at: new Date(Date.now()),
        }

        // Generate new URL for update/delete routes
        const urlArray = url.split('/')
        urlArray.pop()
        urlArray.push(nameValue.toUpperCase())
        const newUrl = urlArray.join('/')

        tableDataUpdater(result, newUrl, formMode)
        setVisible(false)
      } else {
        const body = await resp.json()
        setErrorMessage(body.message ?? `An error occurred while saving your ${mode}, please try again`)
        setError(true)
      }
    }
  }

  return (
    <Dialog
      title={`${prefix} ${mode}`}
      sx={{visibility: visible ? 'visible' : 'hidden'}}
      onClose={() => {
        resetToDefaultStates()
        onClose()
      }}
      footerButtons={[
        {
          buttonType: 'danger',
          content: 'Cancel',
          onClick: () => {
            resetToDefaultStates()
            onClose()
          },
        },
        {
          buttonType: 'primary',
          content: `${prefix} ${mode}`,
          onClick: e => {
            handleSubmit(e)
          },
          autoFocus: true,
          disabled: saving,
          ...testIdProps('submit-button'),
        },
      ]}
    >
      <Dialog.Body data-testid="form-dialog">
        {err && (
          <div className="mb-2">
            <Flash variant="danger" data-testid="error-block">
              {errorMessage}
            </Flash>
          </div>
        )}
        {mode === ListMode.secret && formMode === FormMode.update ? (
          <p>
            <code className="color-fg-default f4" data-testid={`environment-${mode}-name`}>
              {nameValue}
            </code>
          </p>
        ) : (
          <FormControl>
            <FormControl.Label>Name</FormControl.Label>
            <TextInput
              sx={{width: '100%'}}
              placeholder={`YOUR_${mode.toUpperCase()}_NAME`}
              value={nameValue}
              onChange={e => setNameValue(e.target.value)}
              data-testid={`environment-${mode}-name-input`}
            />
          </FormControl>
        )}
        <FormControl>
          <FormControl.Label>
            <div className="mt-2">Value</div>
          </FormControl.Label>
          <Textarea
            placeholder={`${capitalize(mode)} value`}
            value={itemValue}
            onChange={e => setItemValue(e.target.value)}
            sx={{width: '100%'}}
            data-testid={`environment-${mode}-value`}
          />
        </FormControl>
      </Dialog.Body>
    </Dialog>
  )
}

export default FormDialog
