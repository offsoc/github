import type {ContactSalesPage} from '../../../lib/types/contentful'
import type {ArrayElement} from '../../../lib/types/utils'

type FormFieldDefinition = {
  label: string
  name: string
  type: 'text' | 'number' | 'country' | 'email'
  placeholder?: string
  required?: boolean
  validation?: (value: string) => boolean
  validationError?: string
}

export type FormFieldsAttributes =
  | FormFieldDefinition
  | NonNullable<ArrayElement<ContactSalesPage['fields']['template']['fields']>>
