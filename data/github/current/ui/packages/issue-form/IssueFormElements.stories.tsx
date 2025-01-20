import type {Meta} from '@storybook/react'
import {IssueFormElements, type IssueFormElementsViaPayloadProps} from './IssueFormElements'
import {type RefObject, createRef, useState} from 'react'
import type {IssueFormRef} from './types'
import {Button} from '@primer/react'
import type {SafeHTMLString} from '@github-ui/safe-html'

const meta = {
  title: 'IssuesComponents/IssueForm',
  component: IssueFormElements,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    elements: [
      {
        type: 'markdown',
        // eslint-disable-next-line github/unescaped-html-literal
        contentHTML: '<h2>Hello, world!</h2>',
      },
      {
        type: 'input',
        label: 'Name',
        value: 'Default input value',
      },
      {
        type: 'dropdown',
        label: 'Dropdown',
        multiple: false,
        options: ['Option 1', 'Option 2', 'Option 3'],
      },
      {
        type: 'checkboxes',
        label: 'Checkboxes',
        checkboxOptions: [
          {
            label: 'Option 1',
            required: true,
          },
          {
            label: 'Option 2',
            required: false,
          },
        ],
      },
      {
        type: 'textarea',
        label: 'Textarea',
        value: 'Default textarea value',
      },
    ],
    outputRef: createRef(),
  },
} satisfies Meta<typeof IssueFormElements>

export default meta

const defaultArgs: IssueFormElementsViaPayloadProps = {
  sessionStorageKey: '',
  elements: [
    {
      type: 'markdown',

      verifiedHTML:
        // eslint-disable-next-line github/unescaped-html-literal
        '<h4>These are the examples of various element types rendered on an issue form!</h4>' as SafeHTMLString,
    },
    {
      type: 'input',
      label: 'Name',
      value: 'Default input value',
      // eslint-disable-next-line github/unescaped-html-literal
      descriptionHTML: '<p>Input description - we support <strong>HTML rendering</strong> here!</p>',
    },
    {
      type: 'dropdown',
      label: 'Single select dropdown',
      multiple: false,
      options: ['Option 1', 'Option 2', 'Option 3'],
    },
    {
      type: 'dropdown',
      label: 'Required multi-select dropdown',
      multiple: true,
      required: true,
      options: ['Option 1', 'Option 2', 'Option 3'],
    },
    {
      type: 'checkboxes',
      label: 'Checkboxes',
      checkboxOptions: [
        {
          label: 'Required to check',
          labelHTML: 'Required to check',
          required: true,
        },
        {
          label: 'Not required to check',
          labelHTML: 'Not required to check',
          required: false,
        },
      ],
    },
    {
      type: 'textarea',
      label: 'Textarea with markdown',
      // eslint-disable-next-line github/unescaped-html-literal
      descriptionHTML: '<p>Textarea - we support <strong>HTML rendering</strong> here!</p>',
      value: 'Write a long paragraph here, markdown is supported!',
    },
    {
      type: 'textarea',
      label: 'Required code textarea using the render attribute',
      value: '```js\nconst foo = "bar"\n```',
      render: 'javascript',
      required: true,
    },
  ],
  outputRef: createRef(),
  subject: {
    type: 'issue',
    repository: {
      databaseId: 0,
      nwo: 'primer/components',
      slashCommandsEnabled: false,
    },
  },
}

export const IssueFormExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: IssueFormElementsViaPayloadProps) => (
    <>
      <IssueFormElements {...args} />
      <hr />
      <ValidateInputsButton outputRef={args.outputRef} />
      <br />
      <ResetInputsButton outputRef={args.outputRef} />
      <br />
      <RenderMarkdownButton outputRef={args.outputRef} />
    </>
  ),
}

const RenderMarkdownButton = ({outputRef}: {outputRef: RefObject<IssueFormRef>}) => {
  const [markdown, setMarkdown] = useState('')
  const handleClick = () => {
    setMarkdown(outputRef.current?.markdown() ?? '')
  }

  return (
    <>
      <Button onClick={handleClick}>Generate markdown output</Button>
      <pre>{markdown}</pre>
    </>
  )
}

const ResetInputsButton = ({outputRef}: {outputRef: RefObject<IssueFormRef>}) => {
  const handleClick = () => {
    outputRef.current?.resetInputs()
  }

  return <Button onClick={handleClick}>Reset inputs</Button>
}

const ValidateInputsButton = ({outputRef}: {outputRef: RefObject<IssueFormRef>}) => {
  const [isValid, setIsValid] = useState<boolean | undefined>(undefined)
  const handleClick = () => {
    setIsValid((outputRef.current?.getInvalidInputs()?.length || 0) === 0)
  }

  return (
    <>
      <Button onClick={handleClick}>Validate inputs</Button>
      {isValid !== undefined && <span>{isValid ? 'All inputs are valid' : 'Some inputs are invalid'}</span>}
    </>
  )
}
