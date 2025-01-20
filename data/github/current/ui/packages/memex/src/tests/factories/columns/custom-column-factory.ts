import {Factory} from 'fishery'

import type {IterationConfiguration} from '../../../client/api/columns/contracts/iteration'
import {type MemexColumn, MemexColumnDataType} from '../../../client/api/columns/contracts/memex-column'
import {columnIdFactory} from './column-id-factory'
import {singleSelectOptionFactory} from './single-select-option-factory'

class CustomColumnFactory extends Factory<MemexColumn> {
  date() {
    return this.params({
      dataType: MemexColumnDataType.Date,
    })
  }

  iteration({configuration}: {configuration: IterationConfiguration}) {
    return this.params({
      dataType: MemexColumnDataType.Iteration,
      settings: {
        configuration,
      },
    })
  }

  number() {
    return this.params({
      dataType: MemexColumnDataType.Number,
    })
  }

  singleSelect({optionNames}: {optionNames: Array<string>}) {
    const options = optionNames.map(name => singleSelectOptionFactory.build({}, {transient: {name}}))
    return this.params({
      dataType: MemexColumnDataType.SingleSelect,
      settings: {
        options,
      },
    })
  }

  text() {
    return this.params({
      dataType: MemexColumnDataType.Text,
    })
  }
}

export const customColumnFactory = CustomColumnFactory.define(() => {
  const id = columnIdFactory.build()
  return {
    id,
    name: '',
    position: -1,
    dataType: MemexColumnDataType.Title,
    databaseId: id,
    defaultColumn: true,
    userDefined: true,
  }
})
