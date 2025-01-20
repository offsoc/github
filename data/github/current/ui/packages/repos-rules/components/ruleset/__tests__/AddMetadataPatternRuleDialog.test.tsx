import {screen, within, fireEvent} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {RuleModalState} from '../../../types/rules-types'
import {AddMetadataPatternRuleDialog} from '../AddMetadataPatternRuleDialog'
import {createMetadataRule, createMetadataRuleSchema} from '../../../test-utils/mock-data'

const routePayload = {source: {name: 'github/github'}, sourceType: 'repository'}

describe('AddMetadataPatternRuleDialog', () => {
  describe('with RuleModalState.CREATING', () => {
    test('should not render form when no available rules', () => {
      const rule = createMetadataRule()
      const ruleSchema = createMetadataRuleSchema()
      rule._modalState = RuleModalState.CREATING
      render(
        <AddMetadataPatternRuleDialog
          rule={rule}
          ruleSchema={ruleSchema}
          availableMetadataRuleSchemas={[]}
          removeRule={() => null}
          setRuleModalState={() => null}
          updateRuleParameters={() => null}
        />,
        {routePayload},
      )
      expect(screen.getByText('All metadata restrictions have been used')).toBeInTheDocument()
      expect(screen.queryByRole('button', {name: 'Add'})).not.toBeInTheDocument()
      expect(screen.getByRole('button', {name: 'Ok'})).toBeInTheDocument()
      expect(screen.queryByText('Add a metadata restriction')).not.toBeInTheDocument()
      expect(screen.queryByRole('combobox', {name: 'Property'})).not.toBeInTheDocument()
    })

    test('should render form when at least one rule is available', () => {
      const ruleSchema = createMetadataRuleSchema()
      const rule = createMetadataRule()
      rule._modalState = RuleModalState.CREATING
      render(
        <AddMetadataPatternRuleDialog
          rule={rule}
          ruleSchema={ruleSchema}
          availableMetadataRuleSchemas={[ruleSchema]}
          removeRule={() => null}
          setRuleModalState={() => null}
          updateRuleParameters={() => null}
        />,
        {routePayload},
      )
      expect(screen.getByRole('button', {name: 'Add'})).toBeInTheDocument()
      expect(screen.queryByRole('button', {name: 'Ok'})).not.toBeInTheDocument()
      expect(screen.getByText('Add a metadata restriction')).toBeInTheDocument()
      expect(screen.getByRole('combobox', {name: 'Property'})).toBeInTheDocument()
    })
  })

  describe('with RuleModalState.EDITING', () => {
    test('should render form when no rules and have only 1 option', () => {
      const ruleSchema = createMetadataRuleSchema()
      const rule = createMetadataRule()
      rule._modalState = RuleModalState.EDITING
      render(
        <AddMetadataPatternRuleDialog
          rule={rule}
          ruleSchema={ruleSchema}
          availableMetadataRuleSchemas={[]}
          removeRule={() => null}
          setRuleModalState={() => null}
          updateRuleParameters={() => null}
        />,
        {routePayload},
      )
      expect(screen.getByRole('button', {name: 'Update'})).toBeInTheDocument()
      expect(screen.getByText('Edit a metadata restriction')).toBeInTheDocument()
      const selectElement: HTMLSelectElement = screen.getByRole('combobox', {name: 'Property'})
      expect(within(selectElement).getAllByRole('option')).toHaveLength(1)
      const optionElement: HTMLOptionElement = within(selectElement).getByRole('option', {selected: true})
      expect(optionElement.value).toEqual(ruleSchema.type)
    })
  })

  test('should show a validation error if the pattern input is empty and focus changes', async () => {
    const ruleSchema = createMetadataRuleSchema()
    const rule = createMetadataRule()
    rule._modalState = RuleModalState.EDITING
    render(
      <AddMetadataPatternRuleDialog
        rule={rule}
        ruleSchema={ruleSchema}
        availableMetadataRuleSchemas={[]}
        removeRule={() => null}
        setRuleModalState={() => null}
        updateRuleParameters={() => null}
      />,
      {routePayload},
    )

    const updateButtonElement: HTMLButtonElement = screen.getByRole('button', {name: 'Update'})
    const patternInputElement: HTMLInputElement = screen.getByLabelText('Matching pattern*')

    fireEvent.change(patternInputElement, {target: {value: ''}})
    fireEvent.click(updateButtonElement)

    expect(await screen.findByText('Pattern cannot be empty')).toBeInTheDocument()
  })
})
