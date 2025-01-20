import {FilterQuery} from '../../filter-query'
// eslint-disable-next-line import/no-deprecated
import {FilterQueryParser} from '../../parser/v1'
import {CreatedFilterProvider, IsFilterProvider, StateFilterProvider} from '../../providers'
import type {IndexedFilterBlock} from '../../types'

describe('Parser', () => {
  it('should parse a query', () => {
    const query = 'state:open is:open this is some text'

    const stateProvider = new StateFilterProvider()
    const isProvider = new IsFilterProvider()
    // eslint-disable-next-line import/no-deprecated
    const parser = new FilterQueryParser([stateProvider, isProvider])

    const result = parser.parse(query, new FilterQuery(query), 10)

    expect(result.activeBlockId).toBe(0)
    expect(result.blocks.length).toBe(11)

    const block1 = result.blocks[0] as IndexedFilterBlock
    const block3 = result.blocks[2] as IndexedFilterBlock

    expect(block1.key.value).toBe('state')
    expect(block1.value.values.length).toBe(1)
    expect(block1.value.values[0]?.value).toBe('open')
    expect(block3.key.value).toBe('is')
    expect(block3.value.values.length).toBe(1)
    expect(block3.value.values[0]?.value).toBe('open')
    expect(block3.value.values[0]?.valid).toBeFalsy()
  })

  it('should recognize operators for numerical values', async () => {
    const query = 'state:open is:issue created:<10 this is some text'

    const stateProvider = new StateFilterProvider()
    const isProvider = new IsFilterProvider()
    const createdProvider = new CreatedFilterProvider()
    // eslint-disable-next-line import/no-deprecated
    const parser = new FilterQueryParser([stateProvider, isProvider, createdProvider])

    let result = parser.parse(query, new FilterQuery(query), 10)
    result = await parser.validateFilterQuery(result)

    expect(result.activeBlockId).toBe(0)
    expect(result.blocks.length).toBe(13)

    const block1 = result.blocks[0] as IndexedFilterBlock
    const block2 = result.blocks[2] as IndexedFilterBlock
    const block3 = result.blocks[4] as IndexedFilterBlock
    expect(block1.key.value).toBe('state')
    expect(block1.value.values.length).toBe(1)
    expect(block1.value.values[0]?.value).toBe('open')
    expect(block2.key.value).toBe('is')
    expect(block2.value.values.length).toBe(1)
    expect(block2.value.values[0]?.value).toBe('issue')
    expect(block2.value.values[0]?.valid).toBeTruthy()
    expect(block3.key.value).toBe('created')
    expect(block3.value.values.length).toBe(1)
    expect(block3.value.values[0]?.value).toBe('<10')
    expect(block3.operator).toBe('Before')
  })
})

describe('insertSuggestion', () => {
  it('should insert the suggestion at the caret position', () => {
    const query = 'state:op'
    const caretPosition = query.length

    const stateProvider = new StateFilterProvider()
    const isProvider = new IsFilterProvider()
    // eslint-disable-next-line import/no-deprecated
    const parser = new FilterQueryParser([stateProvider, isProvider])
    const queryRequest = parser.parse(query, new FilterQuery(), query.length)
    const result = parser.insertSuggestion(queryRequest, 'open', caretPosition)

    expect(result).toStrictEqual(['state:open', 10])
  })

  it('should replace partial suggestions with numerical operators', () => {
    const query = 'comments:<1'
    const caretPosition = query.length

    const stateProvider = new StateFilterProvider()
    const isProvider = new IsFilterProvider()
    // eslint-disable-next-line import/no-deprecated
    const parser = new FilterQueryParser([stateProvider, isProvider])
    const queryRequest = parser.parse(query, new FilterQuery(), query.length)
    const result = parser.insertSuggestion(queryRequest, '<10', caretPosition)

    expect(result).toStrictEqual(['comments:<10', 12])
  })

  it('if caret position is negative, it should insert the suggestion at the end of the query', () => {
    const query = 'state:op'
    const caretPosition = -1

    const stateProvider = new StateFilterProvider()
    const isProvider = new IsFilterProvider()
    // eslint-disable-next-line import/no-deprecated
    const parser = new FilterQueryParser([stateProvider, isProvider])
    const queryRequest = parser.parse(query, new FilterQuery(), caretPosition)
    const result = parser.insertSuggestion(queryRequest, 'open', caretPosition)

    expect(result).toStrictEqual(['state:opopen', 12])
  })
})
