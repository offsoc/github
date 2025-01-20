import type {PropertyDefinition} from '@github-ui/custom-properties-types'
import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {
  CustomPropertyMultiSelectPanel,
  CustomPropertySingleSelectPanel,
  getDisplayAnchorLabel,
} from '../CustomPropertySelectPanel'

// Jest does not support scrollIntoView
jest.mock('@primer/behaviors')

const commonProps = {
  mixed: false,
  onChange: jest.fn(),
}

const singleSelectProps = {
  ...commonProps,
  propertyValue: 'prod',
  propertyDefinition: {
    propertyName: 'env',
    valueType: 'single_select',
    allowedValues: ['test', 'prod'],
  } as PropertyDefinition,
}

const multiSelectProps = {
  ...commonProps,
  propertyValue: ['ios', 'web'],
  propertyDefinition: {
    propertyName: 'platform',
    valueType: 'multi_select',
    allowedValues: ['android', 'ios', 'web'],
  } as PropertyDefinition,
}

describe('CustomPropertySingleSelectPanel', () => {
  it('drops down all options and changes selected on click', async () => {
    const onChange = jest.fn()
    const {user} = render(<CustomPropertySingleSelectPanel {...singleSelectProps} onChange={onChange} />)

    const selectPanel = screen.getByRole('button')
    await user.click(selectPanel)
    expect(screen.queryAllByRole('option')).toHaveLength(2)
    await user.click(screen.getByRole('option', {name: 'test'}))
    expect(onChange).toHaveBeenCalledWith('test')
    // Popup is closed on click
    expect(screen.queryAllByRole('option')).toHaveLength(0)
  })

  it('filter options and selects it on click', async () => {
    const onChange = jest.fn()
    const {user} = render(<CustomPropertySingleSelectPanel {...singleSelectProps} onChange={onChange} />)

    const selectPanel = screen.getByRole('button')
    await user.click(selectPanel)
    const filterBox = screen.getByRole('textbox')

    await user.click(filterBox)
    await user.paste('test')

    expect(screen.queryAllByRole('option')).toHaveLength(1)
    await user.click(screen.getByRole('option'))
    expect(onChange).toHaveBeenCalledWith('test')
  })

  it('show no matches if filter cannot find anything', async () => {
    const onChange = jest.fn()
    const {user} = render(<CustomPropertySingleSelectPanel {...singleSelectProps} onChange={onChange} />)

    const selectPanel = screen.getByRole('button')
    await user.click(selectPanel)
    const filterBox = screen.getByRole('textbox')
    await user.click(filterBox)
    await user.paste('not-here')
    expect(screen.getByRole('option', {name: 'No matches'})).toBeInTheDocument()
  })
})

describe('CustomPropertyMultiSelectPanel', () => {
  it('drops down all options and adds one on click', async () => {
    const onChange = jest.fn()
    const {user} = render(<CustomPropertyMultiSelectPanel {...multiSelectProps} onChange={onChange} />)

    const selectPanel = screen.getByRole('button')
    await user.click(selectPanel)
    expect(screen.queryAllByRole('option')).toHaveLength(3)
    await user.click(screen.getByRole('option', {name: 'android'}))
    expect(onChange).toHaveBeenCalledWith(['ios', 'web', 'android'])
  })

  it('filter options and adds it on click', async () => {
    const onChange = jest.fn()
    const {user} = render(<CustomPropertyMultiSelectPanel {...multiSelectProps} onChange={onChange} />)

    const selectPanel = screen.getByRole('button')
    await user.click(selectPanel)
    const filterBox = screen.getByRole('textbox')
    await user.click(filterBox)
    await user.paste('andr')
    expect(screen.queryAllByRole('option')).toHaveLength(1)
    await user.click(screen.getByRole('option'))
    expect(onChange).toHaveBeenCalledWith(['ios', 'web', 'android'])
  })

  it('popup keeps open while clicking options', async () => {
    const onChangeFirst = jest.fn()
    const {rerender, user} = render(<CustomPropertyMultiSelectPanel {...multiSelectProps} onChange={onChangeFirst} />)

    const selectPanel = screen.getByRole('button')
    await user.click(selectPanel)

    await user.click(screen.getByRole('option', {name: 'web'}))
    expect(onChangeFirst).toHaveBeenCalledWith(['ios'])

    const onChangeSecond = jest.fn()
    // The external value gets updated and the component is re-rendered with the new value
    rerender(<CustomPropertyMultiSelectPanel {...multiSelectProps} propertyValue={['ios']} onChange={onChangeSecond} />)

    await user.click(screen.getByRole('option', {name: 'android'}))
    expect(onChangeSecond).toHaveBeenCalledWith(['ios', 'android'])
  })
})

describe('getDisplayAnchorLabel', () => {
  describe('text value', () => {
    it('no value', () => expect(getDisplayAnchorLabel('', null, false)).toEqual('Choose an option'))
    it('mixed', () => expect(getDisplayAnchorLabel('', null, true)).toEqual('(Mixed)'))
    it('default', () => expect(getDisplayAnchorLabel('', 'test', false)).toEqual('default (test)'))
    it('selected', () => {
      expect(getDisplayAnchorLabel('test', 'default', false)).toEqual('test')
      expect(getDisplayAnchorLabel('test', null, false)).toEqual('test')
    })
  })

  describe('list of values', () => {
    it('no value', () => expect(getDisplayAnchorLabel([], null, false)).toEqual('Choose an option'))
    it('mixed', () => expect(getDisplayAnchorLabel([], null, true)).toEqual('(Mixed)'))
    it('default single', () => expect(getDisplayAnchorLabel([], ['test'], false)).toEqual('default (test)'))
    it('default multiple', () => expect(getDisplayAnchorLabel([], ['a', 'b'], false)).toEqual('default (2 selected)'))
    it('1 selected', () => {
      expect(getDisplayAnchorLabel(['test'], ['default'], false)).toEqual('test')
      expect(getDisplayAnchorLabel(['test'], null, false)).toEqual('test')
    })
    it('Multiple selected', () => {
      expect(getDisplayAnchorLabel(['a', 'b'], ['default'], false)).toEqual('2 selected')
      expect(getDisplayAnchorLabel(['a', 'b'], null, false)).toEqual('2 selected')
    })
  })
})
