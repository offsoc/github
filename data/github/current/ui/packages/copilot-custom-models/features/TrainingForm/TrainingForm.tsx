import {Box, Button, FormControl} from '@primer/react'
import {Banner} from './Banner'
import type {FormErrors, FormValues} from './types'
import type {FormEventHandler} from 'react'
import {BorderBox} from '../../components/BorderBox'
import {PrivateTelemetryCheckbox} from './PrivateTelemetryCheckbox'
import {parseValues} from './utils'
import {GeneralErrors} from './GeneralErrors'
import {ValidationErrors} from './ValidationErrors'
import type {Language} from '../../types'
import {Explanation} from './Explanation'
import {AutocompleteLanguages} from '../LanguagePicker'
import {RepoPicker} from '../RepoPicker'
import type {BaseRepo, QueryFn} from '../RepoPicker/types'

interface Props {
  adminEmail?: string
  availableLanguages: Language[]
  canCollectPrivateTelemetry?: boolean
  fetchSelected?: () => void
  formErrors?: FormErrors
  initialLanguages?: string[]
  initialRepoCount?: number
  initialSelectedRepos?: BaseRepo[]
  isEditing?: boolean
  isLoadingSelected?: boolean
  isSubmitting: boolean
  onCancel?: () => void
  onSubmit: (formValues: FormValues) => void
  repoPickerQueryFn: QueryFn
  showPrivateTelemetryToggle?: boolean
  wasPrivateTelemetryCollected?: boolean
}

export function TrainingForm({
  adminEmail,
  availableLanguages,
  canCollectPrivateTelemetry = false,
  fetchSelected,
  formErrors = {},
  initialLanguages,
  initialRepoCount,
  initialSelectedRepos,
  isEditing = false,
  isLoadingSelected = false,
  isSubmitting,
  onCancel,
  onSubmit,
  repoPickerQueryFn,
  showPrivateTelemetryToggle = false,
  wasPrivateTelemetryCollected = true,
}: Props) {
  const handleSubmit: FormEventHandler = e => {
    e.preventDefault()

    if (isLoadingSelected) return
    if (isSubmitting) return

    const values = parseValues(e, showPrivateTelemetryToggle)

    onSubmit(values)
  }

  const telemetryDefaultValue = isEditing
    ? canCollectPrivateTelemetry && wasPrivateTelemetryCollected
    : canCollectPrivateTelemetry

  const isSubmitInactive = isLoadingSelected || isSubmitting
  const submitLabel = isEditing ? 'Retrain model' : 'Create new custom model'

  return (
    <Box as="form" onSubmit={handleSubmit} sx={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
      <GeneralErrors errors={formErrors.general_errors} />

      <BorderBox sx={{display: 'flex', flexDirection: 'column', p: '0px'}}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            p: '16px',
          }}
        >
          <FormControl>
            <FormControl.Label>Select repositories</FormControl.Label>
            <Explanation>Choose which repositories you want to train your model on</Explanation>
            <RepoPicker
              fetchSelected={fetchSelected}
              initialRepoCount={initialRepoCount}
              initialSelected={initialSelectedRepos}
              isLoadingSelected={isLoadingSelected}
            >
              <Box sx={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                <RepoPicker.PickerButton queryFn={repoPickerQueryFn} />

                <RepoPicker.ListButton />
              </Box>

              <RepoPicker.HiddenTextInput />
            </RepoPicker>

            <ValidationErrors errors={formErrors.repository_nwos} type={'repository_nwos'} />
          </FormControl>

          <FormControl>
            <FormControl.Label htmlFor="languages">Specify languages</FormControl.Label>
            <Explanation>
              Targeting languages filters the training data to those languages. This can help reduce data size and make
              a more targeted custom model.
            </Explanation>
            <AutocompleteLanguages availableLanguages={availableLanguages} initialLanguages={initialLanguages} />
            <FormControl.Caption>
              If this is left empty, we will use all files in your repositories to train your model.
            </FormControl.Caption>
            <ValidationErrors errors={formErrors.languages} type={'languages'} />
          </FormControl>
        </Box>

        {showPrivateTelemetryToggle && (
          <PrivateTelemetryCheckbox
            canCollectPrivateTelemetry={canCollectPrivateTelemetry}
            defaultValue={telemetryDefaultValue}
          />
        )}
      </BorderBox>

      <Banner>
        Training time is based on the amount of data selected and can take a couple of days for large data sets.
        {!!adminEmail && ` We'll notify you at ${adminEmail} when training is complete.`}
      </Banner>

      <Box sx={{display: 'flex', gap: '8px'}}>
        <Button inactive={isSubmitInactive} type="submit" variant="primary">
          {submitLabel}
        </Button>

        {onCancel && (
          <Button onClick={onCancel} variant="default">
            Cancel
          </Button>
        )}
      </Box>
    </Box>
  )
}
