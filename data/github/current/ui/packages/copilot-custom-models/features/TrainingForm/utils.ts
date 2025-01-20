import type {FormEvent} from 'react'
import type {FormValues} from './types'

function stringArrayToArray(str: string): string[] {
  // The filter covers this case:
  // str is '', so splitting returns [''], but we just want []
  return str.split(',').filter(v => !!v)
}

// Exported for testing purposes only
export function toRepoNwos(formValue: string | null): string[] | null {
  if (formValue === null) return null
  return stringArrayToArray(formValue)
}

export function parseValues(e: FormEvent<EventTarget>, showPrivateTelemetryToggle: boolean): FormValues {
  const formData = new FormData(e.target as HTMLFormElement)
  const languages = stringArrayToArray((formData.get('languages') as string) ?? '')
  const repository_nwos = toRepoNwos(formData.get('repository_nwos') as string)

  const values: FormValues = {languages, repository_nwos}

  if (showPrivateTelemetryToggle) {
    values.private_telemetry = formData.get('private_telemetry') === 'on'
  }

  return values
}
