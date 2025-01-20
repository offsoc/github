import {handleItemToggle} from '../handle-item-toggle'

describe('handleItemToggle', () => {
  test('toggles the checked state of the task item', () => {
    const markdownValue = '- [ ] 0.0 Task item'
    const markdownIndex = 0
    const onChange = jest.fn()

    handleItemToggle({markdownValue, markdownIndex, onChange})

    expect(onChange).toHaveBeenCalledWith('- [x] 0.0 Task item')
  })

  test('toggles the unchecked state of the task item', () => {
    const markdownValue = '- [x] 0.0 Task item'
    const markdownIndex = 0
    const onChange = jest.fn()

    handleItemToggle({markdownValue, markdownIndex, onChange})

    expect(onChange).toHaveBeenCalledWith('- [ ] 0.0 Task item')
  })
})
