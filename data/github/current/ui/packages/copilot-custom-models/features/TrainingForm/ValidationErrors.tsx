import {FormControl} from '@primer/react'

export function ValidationErrors(props: {errors: string[] | undefined; type: string}) {
  if (!props.errors?.length) return null

  return (
    <>
      {props.errors.map((error: string, index: number) => (
        <FormControl.Validation key={`${props.type}-${index}`} variant="error">
          {error}
        </FormControl.Validation>
      ))}
    </>
  )
}
