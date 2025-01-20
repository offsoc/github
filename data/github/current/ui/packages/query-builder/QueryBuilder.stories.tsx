import type {QueryBuilderElement} from '@github-ui/query-builder-element'
import type {Meta} from '@storybook/react'
import {useCallback, useState} from 'react'
import {KEY_ONLY_FILTERS, STATIC_VALUE_FILTERS} from './constants/search-filters'
import {IssuesFilterProvider} from './providers/issues-filter-provider'
import {QueryBuilder, type QueryBuilderProps} from './QueryBuilder'
import {createFilter} from './utils/query'
import {Text, Box} from '@primer/react'

const meta = {
  title: 'Recipes/QueryBuilder',
  component: QueryBuilder,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    id: {control: 'text'},
    onRequestProvider: {table: {disable: true}},
    placeholder: {control: 'text'},
    inputValue: {control: 'text'},
    label: {control: 'text'},
    visuallyHideLabel: {control: 'boolean', default: false},
    onKeyPress: {table: {disable: true}},
    onChange: {table: {disable: true}},
    renderSingularItemNames: {control: 'boolean'},
    sxString: {table: {disable: true}},
    'data-testid': {table: {disable: true}},
    sx: {table: {disable: true}},
  },
} satisfies Meta<typeof QueryBuilder>

export default meta

const defaultArgs: Pick<QueryBuilderProps, 'id' | 'placeholder' | 'label' | 'visuallyHideLabel'> = {
  id: 'storybook-query-builder',
  placeholder: 'Search issues, users, and more',
  label: 'Search',
  visuallyHideLabel: false,
}

const WrapperComponent = (props: QueryBuilderProps) => {
  const [inputValue, setInputValue] = useState('')

  const onRequestProvider = useCallback((event: Event) => {
    event.stopPropagation()
    const queryBuilder = event.target as QueryBuilderElement

    KEY_ONLY_FILTERS.map(f => createFilter(IssuesFilterProvider, f, queryBuilder))
    STATIC_VALUE_FILTERS.map(f => createFilter(IssuesFilterProvider, f, queryBuilder))
  }, [])

  return (
    <div>
      <QueryBuilder
        {...props}
        id="storybook-query-builder"
        visuallyHideLabel={true}
        placeholder="Search issues, users, and more"
        inputValue={inputValue}
        onRequestProvider={onRequestProvider}
        onChange={useCallback(
          e => {
            setInputValue(e.target.value)
          },
          [setInputValue],
        )}
      />

      <Box
        sx={{
          bg: 'canvas.subtle',
          px: [3, 5, 10],
          py: 10,
          borderRadius: 2,
          mt: 3,
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: 'border.default',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {inputValue ? (
          <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <Text sx={{fontSize: 1, color: 'fg.muted', mb: 2, textAlign: 'center'}}>Filter the items using query</Text>
            <Text sx={{fontFamily: 'mono'}}>{inputValue}</Text>
          </Box>
        ) : (
          <Text sx={{fontSize: 1, display: 'block', color: 'fg.muted', textAlign: 'center'}}>
            Show a default list of items when no query is entered
          </Text>
        )}
      </Box>
    </div>
  )
}

export const Example = {
  args: {
    ...defaultArgs,
  },
  render: (props: QueryBuilderProps) => <WrapperComponent {...props} />,
}
