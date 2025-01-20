import type {CustomTemplate} from '../../client/api/common-contracts'
import {deepCopy} from './utils'

export class CustomTemplatesCollection {
  private templates: Array<CustomTemplate>

  constructor(templates: Array<CustomTemplate> = []) {
    this.templates = deepCopy(templates)
  }

  public all() {
    return this.templates
  }
}
