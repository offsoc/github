import type {Repository} from '@github-ui/custom-properties-types'
import {expectMockFetchCalledTimes, expectMockFetchCalledWith, mockFetch} from '@github-ui/mock-fetch'
import {screen, waitFor} from '@testing-library/react'
import type {ComponentProps} from 'react'

import {renderPropertyDefinitionsComponent} from '../../test-utils/Render'
import {PropertiesEditingPage} from '../PropertiesEditingPage'

const github: Repository = {
  id: 1,
  name: 'github',
  description: null,
  visibility: 'private',
  properties: {alpha: 'value', beta: 'two'},
}

const smile: Repository = {
  id: 2,
  name: 'smile',
  description: null,
  visibility: 'private',
  properties: {alpha: 'other', beta: 'one'},
}

const onDiscardMock = jest.fn()

// jsdom doesn't implement scrolling functions
jest.mock('@primer/behaviors')

const sampleProps: ComponentProps<typeof PropertiesEditingPage> = {
  editingRepos: [github],
  onClose: onDiscardMock,
  definitions: [
    {
      propertyName: 'alpha',
      valueType: 'string',
      required: false,
      defaultValue: null,
      description: 'description for alpha property',
      allowedValues: null,
      valuesEditableBy: 'org_actors',
      regex: null,
    },
    {
      propertyName: 'beta',
      valueType: 'single_select',
      allowedValues: ['one', 'two'],
      required: true,
      defaultValue: 'one',
      description: null,
      valuesEditableBy: 'org_actors',
      regex: null,
    },
  ],
  editableProperties: ['alpha', 'beta', 'regex'],
  onSuccess: jest.fn(),
  renderPageHeader: ({canClose}) => (
    <>
      <h2>Custom properties</h2>
      <button onClick={canClose}>Close from header</button>
    </>
  ),
}

beforeEach(() => {
  onDiscardMock.mockClear()
})

describe('PropertiesEditingPage', () => {
  it('renders existing properties in alphabetical order and adds property button', () => {
    renderPropertyDefinitionsComponent(<PropertiesEditingPage {...sampleProps} />)

    const propertyNames = screen.getAllByTestId('property-name')
    expect(propertyNames).toHaveLength(2)
    expect(propertyNames[0]).toHaveTextContent('alpha')
    expect(propertyNames[1]).toHaveTextContent('beta')

    expect(screen.getByDisplayValue('value')).toBeInTheDocument()
    expect(screen.getByText('description for alpha property')).toBeInTheDocument()
    expect(screen.getByText('two')).toBeInTheDocument()
  })

  it('renders property in readonly mode if not editable when properties table FF is enabled', () => {
    renderPropertyDefinitionsComponent(<PropertiesEditingPage {...sampleProps} editableProperties={['alpha']} />)

    const editablePropertyNames = screen.getAllByTestId('property-name')
    expect(editablePropertyNames).toHaveLength(2)
    expect(editablePropertyNames[0]).toHaveTextContent('alpha')
    expect(editablePropertyNames[1]).toHaveTextContent('beta *')

    expect(screen.getAllByText('Managed by')).toHaveLength(1)
  })

  it('filters properties', async () => {
    const {user} = renderPropertyDefinitionsComponent(<PropertiesEditingPage {...sampleProps} />)

    const input = screen.getByRole('textbox', {name: 'Filter properties'})
    await user.type(input, 'alp')

    const propertyNames = screen.getAllByTestId('property-name')
    expect(propertyNames).toHaveLength(1)
    expect(propertyNames[0]).toHaveTextContent('alpha')

    await user.clear(input)
    await user.type(input, 'unknown')

    expect(screen.queryAllByTestId('property-name')).toHaveLength(0)
    expect(screen.getByText('No properties that match')).toBeInTheDocument()
  })

  const onSubmit = jest.fn()
  onSubmit.mockImplementation(event => {
    event.preventDefault()
  })

  it('posts changed properties to the server on submit', async () => {
    const {user} = renderPropertyDefinitionsComponent(<PropertiesEditingPage {...sampleProps} />)

    mockFetch.mockRoute('/sessions/in_sudo', undefined, {ok: true, text: async () => 'true'})

    await user.type(screen.getByLabelText('alpha'), '2.0')

    await user.click(screen.getByRole('button', {name: 'Save'}))

    await waitFor(() =>
      expectMockFetchCalledWith('/organizations/acme/settings/custom-properties/values', {
        repoIds: [1],
        properties: {alpha: 'value2.0'},
      }),
    )
  })

  it('does not post on submit if no properties have changed', async () => {
    const {user} = renderPropertyDefinitionsComponent(<PropertiesEditingPage {...sampleProps} />)

    await user.click(screen.getByRole('button', {name: 'Save'}))

    expectMockFetchCalledTimes('/organizations/acme/settings/custom-properties/values', 0)
  })

  it('can remove property when selecting the current selection in the dropdown', async () => {
    const {user} = renderPropertyDefinitionsComponent(
      <PropertiesEditingPage
        {...sampleProps}
        definitions={[
          {
            propertyName: 'alpha',
            valueType: 'string',
            required: true,
            defaultValue: 'default_value',
            description: null,
            allowedValues: null,
            valuesEditableBy: 'org_actors',
            regex: null,
          },
          {
            propertyName: 'beta',
            valueType: 'single_select',
            required: false,
            defaultValue: null,
            allowedValues: ['one', 'two'],
            description: null,
            valuesEditableBy: 'org_actors',
            regex: null,
          },
        ]}
      />,
    )

    mockFetch.mockRoute('/sessions/in_sudo', undefined, {ok: true, text: async () => 'true'})

    const dropdown = screen.getByLabelText('Select beta')
    await user.click(dropdown)
    await user.click(screen.getByRole('option', {name: 'two'}))

    expect(dropdown.textContent).toEqual('Choose an option')

    await user.click(screen.getByRole('button', {name: 'Save'}))

    await waitFor(() =>
      expectMockFetchCalledWith('/organizations/acme/settings/custom-properties/values', {
        repoIds: [1],
        properties: {beta: ''},
      }),
    )
  })

  it('resets to default when removing required property', async () => {
    const {user} = renderPropertyDefinitionsComponent(<PropertiesEditingPage {...sampleProps} />)

    mockFetch.mockRoute('/sessions/in_sudo', undefined, {ok: true, text: async () => 'true'})

    const dropdown = screen.getByLabelText('Select beta')
    await user.click(dropdown)
    await user.click(screen.getByRole('option', {name: 'two'}))

    expect(dropdown.textContent).toEqual('default (one)')

    await user.click(screen.getByRole('button', {name: 'Save'}))

    await waitFor(() =>
      expectMockFetchCalledWith('/organizations/acme/settings/custom-properties/values', {
        repoIds: [1],
        properties: {beta: ''},
      }),
    )
  })

  it('can undo property when properties table FF is enabled', async () => {
    const {user} = renderPropertyDefinitionsComponent(<PropertiesEditingPage {...sampleProps} />)

    await user.type(screen.getByLabelText('alpha'), '2.0')

    const dropdown = screen.getByLabelText('Open reset options for alpha')
    await user.click(dropdown)

    await user.click(screen.getByRole('menuitem', {name: 'Undo Reset to the last used value'}))

    expect(screen.getByDisplayValue('value')).toBeInTheDocument()
  })

  it('shows validation message and prevents submitting if properties are invalid', async () => {
    const {user} = renderPropertyDefinitionsComponent(<PropertiesEditingPage {...sampleProps} />)

    await user.type(screen.getByLabelText('alpha'), 'invalid"value')
    expect(await screen.findByText('Contains invalid characters: "')).toBeInTheDocument()

    await user.click(screen.getByRole('button', {name: 'Save'}))
    expectMockFetchCalledTimes('/organizations/acme/settings/custom-properties/values', 0)
  })

  it('sends one validation request for multiple regex pattern updates in quick succession', async () => {
    const {user} = renderPropertyDefinitionsComponent(
      <PropertiesEditingPage
        {...sampleProps}
        definitions={[
          {
            propertyName: 'regex',
            valueType: 'string',
            required: false,
            defaultValue: null,
            description: 'description for regex property',
            allowedValues: null,
            valuesEditableBy: 'org_actors',
            regex: '[0-9]+',
          },
        ]}
      />,
    )

    await user.type(screen.getByLabelText('regex'), 'abc')
    await waitFor(() => expectMockFetchCalledTimes('/repos/validate_regex/value', 1))
  })

  it('can edit multiple repos in mixed state', async () => {
    const {user} = renderPropertyDefinitionsComponent(
      <PropertiesEditingPage {...sampleProps} editingRepos={[github, smile]} />,
    )

    mockFetch.mockRoute('/sessions/in_sudo', undefined, {ok: true, text: async () => 'true'})

    expect(screen.getByLabelText('alpha')).toHaveAttribute('placeholder', '(Mixed)')
    await user.type(screen.getByLabelText('alpha'), '2.0')

    await user.click(screen.getByRole('button', {name: '(Mixed)'}))
    await user.click(screen.getByRole('option', {name: 'one'}))
    await user.click(screen.getByRole('button', {name: 'Save'}))

    await waitFor(() =>
      expectMockFetchCalledWith('/organizations/acme/settings/custom-properties/values', {
        repoIds: [1, 2],
        properties: {alpha: '2.0', beta: 'one'},
      }),
    )
  })

  it('displays default error message if server call rejects and can resubmit', async () => {
    const {user} = renderPropertyDefinitionsComponent(<PropertiesEditingPage {...sampleProps} />)

    mockFetch.mockRoute('/sessions/in_sudo', undefined, {ok: true, text: async () => 'true'})

    await user.type(screen.getByLabelText('alpha'), '2.0')
    await user.click(screen.getByRole('button', {name: 'Save'}))

    await waitFor(() => expectMockFetchCalledTimes('/organizations/acme/settings/custom-properties/values', 1))
    mockFetch.rejectPendingRequest('/organizations/acme/settings/custom-properties/values', 'something went wrong')

    expect(await screen.findByText('Failed to update properties')).toBeInTheDocument()

    await user.click(screen.getByRole('button', {name: 'Save'}))

    await waitFor(() => expectMockFetchCalledTimes('/organizations/acme/settings/custom-properties/values', 2))
  })

  it('allows custom header', async () => {
    renderPropertyDefinitionsComponent(
      <PropertiesEditingPage {...sampleProps} renderPageHeader={() => <h2>Test page header</h2>} />,
    )

    expect(screen.getByRole('heading', {name: 'Test page header'})).toBeInTheDocument()
  })

  it('allows providing custom action labels', () => {
    renderPropertyDefinitionsComponent(
      <PropertiesEditingPage {...sampleProps} actionLabels={{save: 'My_Save', cancel: 'My_Cancel'}} />,
    )

    expect(screen.getByRole('button', {name: 'My_Save'})).toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'My_Cancel'})).toBeInTheDocument()

    expect(screen.queryByRole('button', {name: 'Save'})).not.toBeInTheDocument()
    expect(screen.queryByRole('button', {name: 'Cancel'})).not.toBeInTheDocument()
  })

  describe('dismiss', () => {
    it('shows no confirmation dialog on discard when no changes', async () => {
      const {user} = renderPropertyDefinitionsComponent(<PropertiesEditingPage {...sampleProps} />)

      await user.click(screen.getByRole('button', {name: 'Cancel'}))

      expect(screen.queryByRole('alertdialog', {name: 'Discard changes?'})).not.toBeInTheDocument()
      expect(onDiscardMock).toHaveBeenCalled()
    })

    it('shows confirmation dialog on discard, keep editing', async () => {
      const {user} = renderPropertyDefinitionsComponent(<PropertiesEditingPage {...sampleProps} />)

      await user.type(screen.getByLabelText('alpha'), 'change')

      await user.click(screen.getByRole('button', {name: 'Cancel'}))

      expect(screen.getByRole('alertdialog', {name: 'Discard changes?'})).toBeInTheDocument()
      await user.click(screen.getByText('Keep editing'))

      expect(screen.queryByRole('alertdialog', {name: 'Discard changes?'})).not.toBeInTheDocument()
      expect(onDiscardMock).not.toHaveBeenCalled()
    })

    it('shows confirmation dialog on discard, accept discard', async () => {
      const {user} = renderPropertyDefinitionsComponent(<PropertiesEditingPage {...sampleProps} />)

      await user.type(screen.getByLabelText('alpha'), 'change')

      await user.click(screen.getByRole('button', {name: 'Cancel'}))

      expect(screen.getByRole('alertdialog', {name: 'Discard changes?'})).toBeInTheDocument()
      await user.click(screen.getByText('Discard'))

      expect(screen.queryByRole('alertdialog', {name: 'Discard changes?'})).not.toBeInTheDocument()
      await waitFor(() => expect(onDiscardMock).toHaveBeenCalled())
    })

    it('shows confirmation dialog on discard when discarded from the header', async () => {
      const {user} = renderPropertyDefinitionsComponent(<PropertiesEditingPage {...sampleProps} />)

      await user.type(screen.getByLabelText('alpha'), 'change')

      await user.click(screen.getByRole('button', {name: 'Close from header'}))

      expect(screen.getByRole('alertdialog', {name: 'Discard changes?'})).toBeInTheDocument()
    })
  })
})
