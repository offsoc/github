import {Resources} from '../../../../strings'

export class PasteValidationFailure extends Error {}

export class DataTypeMismatchFailure extends PasteValidationFailure {
  constructor() {
    super(Resources.unableToPasteMismatchedDataTypes)
  }
}
