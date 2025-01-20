import React from 'react'
import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'

import {ControlGroup} from '../ControlGroup'
import {getPaddingInlineStart} from '../components/utils'

describe('ControlGroup component', () => {
  it('renders a control group without crashing', () => {
    render(
      <ControlGroup data-testid="control-group">
        <ControlGroup.Item>
          <ControlGroup.Title>Item title</ControlGroup.Title>
        </ControlGroup.Item>
      </ControlGroup>,
    )

    expect(screen.getByTestId('control-group')).toBeInTheDocument()
  })

  it('renders a control group item w/ a description without crashing', () => {
    render(
      <ControlGroup data-testid="control-group">
        <ControlGroup.Item>
          <ControlGroup.Title>Item title</ControlGroup.Title>
          <ControlGroup.Description>This is an optional short description</ControlGroup.Description>
        </ControlGroup.Item>
      </ControlGroup>,
    )

    expect(screen.getByTestId('control-group')).toBeInTheDocument()
  })

  it('renders a control group w/ nested items without crashing', () => {
    render(
      <ControlGroup data-testid="control-group">
        <ControlGroup.Item>
          <ControlGroup.Title>Nesting level 0</ControlGroup.Title>
        </ControlGroup.Item>
        <ControlGroup.Item nestedLevel={1}>
          <ControlGroup.Title>Nesting level 1</ControlGroup.Title>
          <ControlGroup.ToggleSwitch />
        </ControlGroup.Item>
        <ControlGroup.Item nestedLevel={2}>
          <ControlGroup.Title>Nesting level 2</ControlGroup.Title>
          <ControlGroup.ToggleSwitch />
        </ControlGroup.Item>
      </ControlGroup>,
    )

    expect(screen.getByTestId('control-group')).toBeInTheDocument()
  })

  it('can get the correct value for a nested item inline start padding with getPaddingInlineStart', () => {
    // no nesting
    expect(getPaddingInlineStart(0)).toBe('var(--base-size-12)')

    // with >=1 level of nesting
    expect(getPaddingInlineStart(1)).toBe('calc(var(--base-size-12) * 2)')
  })

  describe('ControlGroup.ToggleSwitch', () => {
    it('renders a switch that is turned on', () => {
      render(
        <ControlGroup>
          <ControlGroup.Item>
            <ControlGroup.Title id="toggle">Toggle switch item</ControlGroup.Title>
            <ControlGroup.ToggleSwitch aria-labelledby="toggle" defaultChecked />
          </ControlGroup.Item>
        </ControlGroup>,
      )
      const toggleSwitch = screen.getByLabelText('Toggle switch item')

      expect(toggleSwitch).toHaveAttribute('aria-pressed', 'true')
    })

    it('calls onChange when the switch is toggled', async () => {
      const handleChange = jest.fn()
      const ControlledSwitchGroup = ({handleSwitchChange}: {handleSwitchChange: (on: boolean) => void}) => {
        const [isOn, setIsOn] = React.useState(false)

        const onClick = () => {
          setIsOn(!isOn)
        }

        return (
          <ControlGroup>
            <ControlGroup.Item>
              <ControlGroup.Title id="toggle">Toggle switch item</ControlGroup.Title>
              <ControlGroup.ToggleSwitch
                onClick={onClick}
                onChange={handleSwitchChange}
                checked={isOn}
                aria-labelledby="toggle"
              />
            </ControlGroup.Item>
          </ControlGroup>
        )
      }

      const {user} = render(<ControlledSwitchGroup handleSwitchChange={handleChange} />)

      const toggleSwitch = screen.getByLabelText('Toggle switch item')

      await user.click(toggleSwitch)
      expect(handleChange).toHaveBeenCalledWith(true)
    })

    it("renders a switch who's state is loading", async () => {
      const {container} = render(
        <ControlGroup>
          <ControlGroup.Item>
            <ControlGroup.Title id="toggle">Toggle switch item</ControlGroup.Title>
            <ControlGroup.ToggleSwitch loading aria-labelledby="toggle" />
          </ControlGroup.Item>
        </ControlGroup>,
      )
      const toggleSwitch = screen.getByLabelText('Toggle switch item')
      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      const loadingSpinner = container.querySelector('svg')

      expect(loadingSpinner).toBeDefined()
      expect(toggleSwitch).toHaveAttribute('aria-pressed', 'false')
    })
  })

  describe('ControlGroup.Button', () => {
    it('calls the onClick handler passed to the button control', async () => {
      const onClick = jest.fn()

      const {user} = render(
        <ControlGroup>
          <ControlGroup.Item>
            <ControlGroup.Title>Button item</ControlGroup.Title>
            <ControlGroup.Button onClick={onClick}>Button</ControlGroup.Button>
          </ControlGroup.Item>
        </ControlGroup>,
      )

      expect(onClick).not.toHaveBeenCalled()
      await user.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalled()
    })
  })

  describe('ControlGroup.InlineEdit', () => {
    it('sets the aria-label passed to the inline edit button', () => {
      render(
        <ControlGroup>
          <ControlGroup.Item>
            <ControlGroup.Title>Button item</ControlGroup.Title>
            <ControlGroup.InlineEdit aria-label="Some other label" value="Value" />
          </ControlGroup.Item>
        </ControlGroup>,
      )

      expect(screen.getByLabelText('Some other label')).toBeInTheDocument()
    })

    it('calls the onClick handler passed to the inline edit button control', async () => {
      const onClick = jest.fn()

      const {user} = render(
        <ControlGroup>
          <ControlGroup.Item>
            <ControlGroup.Title>Button item</ControlGroup.Title>
            <ControlGroup.InlineEdit onClick={onClick} value="Value" />
          </ControlGroup.Item>
        </ControlGroup>,
      )

      expect(onClick).not.toHaveBeenCalled()
      await user.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalled()
    })
  })

  describe('ControlGroup.LinkItem', () => {
    it('renders an anchor tag when using a link item', () => {
      render(
        <ControlGroup>
          <ControlGroup.LinkItem href="#">
            <ControlGroup.Title>Link item</ControlGroup.Title>
          </ControlGroup.LinkItem>
        </ControlGroup>,
      )

      expect(screen.getByRole('link')).toBeInTheDocument()
    })
  })

  describe('ControlGroup.Custom', () => {
    it('renders whatever element is passed to the custom control', () => {
      render(
        <ControlGroup>
          <ControlGroup.Item>
            <ControlGroup.Title>Action Menu item</ControlGroup.Title>
            <ControlGroup.Custom>
              <div data-testid="custom-control">Custom control</div>
            </ControlGroup.Custom>
          </ControlGroup.Item>
        </ControlGroup>,
      )

      expect(screen.getByTestId('custom-control')).toBeInTheDocument()
    })
  })
})
