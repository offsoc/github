import {render} from '@github-ui/react-core/test-utils'
import {screen, fireEvent} from '@testing-library/react'
import FieldProgressionField from '../FieldProgressionField'
import {FakeFieldProgressionEditComponent as FakeEditComponent} from './helpers/FakeFieldProgressionEditComponent'

describe('FieldProgressionField', () => {
  test('should throw an error if no index is provided (which is normally done by the FieldProgression component)', () => {
    jest.spyOn(console, 'error').mockImplementation()

    expect(() =>
      render(
        <FieldProgressionField
          name="firstField"
          displayValue="firstFieldValue"
          editComponent={<FakeEditComponent value="firstFieldValue" setValue={() => {}} />}
        />,
      ),
    ).toThrow('FieldProgressionField must be rendered as a child of a FieldProgression component')
  })

  test('renders validation error if saving without value selected', async () => {
    const componentWithValidationState = (isError: boolean) => (
      <FieldProgressionField
        name="firstField"
        displayValue="firstFieldValue"
        error={isError}
        index={0}
        isActive={true}
        editComponent={<FakeEditComponent value="firstFieldValue" setValue={() => {}} />}
      />
    )
    const {rerender} = render(componentWithValidationState(false))

    const saveButton = screen.getByTestId('fake-edit-component-button')
    fireEvent.click(saveButton)

    rerender(componentWithValidationState(true))

    expect(screen.getByText('firstField is required.')).toBeInTheDocument()
  })
})
