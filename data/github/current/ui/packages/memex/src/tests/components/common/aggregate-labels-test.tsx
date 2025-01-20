import {render, screen} from '@testing-library/react'

import {AggregateLabels, getAggregateDisplayValue} from '../../../client/components/common/aggregate-labels'

describe('AggregateLabels', () => {
  it('should display items count if hideItemsCount is false', () => {
    render(<AggregateLabels hideItemsCount={false} itemsCount={10} aggregates={[]} />)

    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('should not display items count if hideItemsCount is true', () => {
    render(<AggregateLabels hideItemsCount itemsCount={10} aggregates={[]} />)

    expect(screen.queryByText('10')).not.toBeInTheDocument()
  })

  it('should display any provided aggregates', () => {
    const aggregates = [
      {name: 'foo', sum: 9000, maxDecimalPlaces: 0},
      {name: 'baz', sum: 4, maxDecimalPlaces: 0},
    ]

    render(<AggregateLabels hideItemsCount itemsCount={10} aggregates={aggregates} />)

    expect(screen.getByTestId('column-sum-foo')).toHaveTextContent('foo: 9000')
    expect(screen.getByTestId('column-sum-baz')).toHaveTextContent('baz: 4')
  })

  it('should respect the number of decimal places', () => {
    const aggregates = [
      {name: 'places0', sum: 215.07999999999998, maxDecimalPlaces: 0},
      {name: 'places1', sum: 215.07999999999998, maxDecimalPlaces: 1},
      {name: 'places2', sum: 215.07999999999998, maxDecimalPlaces: 2},
      {name: 'places3', sum: 215.07999999999998, maxDecimalPlaces: 3},
      {name: 'places4', sum: 1.0001, maxDecimalPlaces: 4},
    ]

    render(<AggregateLabels hideItemsCount itemsCount={10} aggregates={aggregates} />)

    expect(screen.getByTestId('column-sum-places0')).toHaveTextContent('places0: 215')
    expect(screen.getByTestId('column-sum-places1')).toHaveTextContent('places1: 215')
    expect(screen.getByTestId('column-sum-places2')).toHaveTextContent('places2: 215.08')
    expect(screen.getByTestId('column-sum-places3')).toHaveTextContent('places3: 215.08')
    expect(screen.getByTestId('column-sum-places4')).toHaveTextContent('places4: 1.0001')
  })
})

describe('getAggregateDisplayValue', () => {
  it('displays integers without any modification', () => {
    expect(getAggregateDisplayValue({name: 'num', sum: 1, maxDecimalPlaces: 0})).toEqual('1')
    expect(getAggregateDisplayValue({name: 'num', sum: 0, maxDecimalPlaces: 0})).toEqual('0')
    expect(getAggregateDisplayValue({name: 'num', sum: 9000, maxDecimalPlaces: 0})).toEqual('9000')
    expect(getAggregateDisplayValue({name: 'num', sum: -1234, maxDecimalPlaces: 0})).toEqual('-1234')
  })
  it('displays sums rounded to max decimal places', () => {
    expect(getAggregateDisplayValue({name: 'num', sum: 1.23456789, maxDecimalPlaces: 0})).toEqual('1')
    expect(getAggregateDisplayValue({name: 'num', sum: 1.23456789, maxDecimalPlaces: 1})).toEqual('1.2')
    expect(getAggregateDisplayValue({name: 'num', sum: 1.23456789, maxDecimalPlaces: 2})).toEqual('1.23')
    expect(getAggregateDisplayValue({name: 'num', sum: 1.23456789, maxDecimalPlaces: 3})).toEqual('1.235')
    expect(getAggregateDisplayValue({name: 'num', sum: 0.1 + 0.2, maxDecimalPlaces: 1})).toEqual('0.3')
    expect(getAggregateDisplayValue({name: 'num', sum: 0.1 + 0.2, maxDecimalPlaces: 3})).toEqual('0.3')
    expect(getAggregateDisplayValue({name: 'num', sum: 5.33 + 5.2, maxDecimalPlaces: 2})).toEqual('10.53')
    expect(getAggregateDisplayValue({name: 'num', sum: 1.9999 + 1, maxDecimalPlaces: 4})).toEqual('2.9999')
    expect(getAggregateDisplayValue({name: 'num', sum: 1.9999 + 1, maxDecimalPlaces: 0})).toEqual('3')
    expect(getAggregateDisplayValue({name: 'num', sum: 2.07999999999998, maxDecimalPlaces: 0})).toEqual('2')
    expect(getAggregateDisplayValue({name: 'num', sum: 2.07999999999998, maxDecimalPlaces: 2})).toEqual('2.08')
  })
})
