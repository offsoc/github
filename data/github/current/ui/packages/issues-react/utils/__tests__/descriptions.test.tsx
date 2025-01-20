import {kFormatter} from '../descriptions'

test('number formatter', () => {
  const numbers = [42, 0, 3, 999, 1100, 14000, 14325, 554322]
  const expectations = ['42', '0', '3', '999', '1,100', '14,000', '14,325', '554,322']

  for (let i = 0; i < numbers.length; i++) {
    expect(kFormatter(numbers[i]!)).toBe(expectations[i])
  }
})
