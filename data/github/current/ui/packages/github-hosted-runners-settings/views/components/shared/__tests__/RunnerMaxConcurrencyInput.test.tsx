import {render, screen} from '@testing-library/react'
import {RunnerMaxConcurrencyInput} from '../RunnerMaxConcurrencyInput'

describe('RunnerMaxConcurrencyInput', () => {
  test('renders correctly', () => {
    const onChange = jest.fn()
    const value = 5
    const min = 1
    const max = 10

    render(
      <RunnerMaxConcurrencyInput value={value} min={min} max={max} onChange={onChange} gpuRunnerSelected={false} />,
    )

    const inputElement = screen.getByTestId('runner-max-concurrency-input')
    expect(inputElement).toBeInTheDocument()
    expect(inputElement).toHaveValue(value)
  })

  test('renders with error when value over max', () => {
    const onChange = jest.fn()
    const value = 11
    const min = 1
    const max = 10

    render(
      <RunnerMaxConcurrencyInput value={value} min={min} max={max} onChange={onChange} gpuRunnerSelected={false} />,
    )

    const inputElement = screen.getByTestId('runner-max-concurrency-input')
    const error = screen.getByTestId('runner-max-concurrency-input-error')
    expect(inputElement).toBeInTheDocument()
    expect(inputElement).toHaveValue(value)
    expect(error).toHaveTextContent(`Must be at most ${max}`)
  })

  test('renders with error when value over max when a gpu runner is selected', () => {
    const onChange = jest.fn()
    const value = 11
    const min = 1
    const max = 10

    render(<RunnerMaxConcurrencyInput value={value} min={min} max={max} onChange={onChange} gpuRunnerSelected={true} />)

    const inputElement = screen.getByTestId('runner-max-concurrency-input')
    const error = screen.getByTestId('runner-max-concurrency-input-error')
    expect(inputElement).toBeInTheDocument()
    expect(inputElement).toHaveValue(value)
    expect(error).toHaveTextContent(`Must be at most ${max} for GPU-powered runners`)
  })

  test('renders with error when value under min', () => {
    const onChange = jest.fn()
    const value = 0
    const min = 1
    const max = 10

    render(
      <RunnerMaxConcurrencyInput value={value} min={min} max={max} onChange={onChange} gpuRunnerSelected={false} />,
    )

    const inputElement = screen.getByTestId('runner-max-concurrency-input')
    const error = screen.getByTestId('runner-max-concurrency-input-error')
    expect(inputElement).toBeInTheDocument()
    expect(inputElement).toHaveValue(value)
    expect(error).toHaveTextContent(`Must be at least ${min}`)
  })
})
