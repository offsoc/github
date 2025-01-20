import {graphql} from 'relay-runtime'
import {renderRelay} from '@github-ui/relay-test-utils'
import {fireEvent, screen} from '@testing-library/react'
import {DiscussionCategoryPicker} from '../components/DiscussionCategoryPicker'
import type {DiscussionCategoryPickerTestQuery} from './__generated__/DiscussionCategoryPickerTestQuery.graphql'
import {buildDiscussionCategory} from '../test-utils/DiscussionCategoryPickerHelpers'

it('should render 3 options', async () => {
  const onSelect = jest.fn()
  const optionText = 'Announcements'

  setup({onSelect})

  expect(screen.getByText(optionText)).toBeInTheDocument()
  expect(screen.getAllByRole('option')).toHaveLength(3)
})

it('should automatically select the first option', async () => {
  const onSelect = jest.fn()

  setup({onSelect})

  const optionValue = screen.getAllByRole<HTMLOptionElement>('option')[0]?.value

  expect(onSelect).toHaveBeenCalledTimes(1)
  expect(onSelect).toHaveBeenCalledWith(optionValue)
})

it('should call onSelect when an option is changed', async () => {
  const onSelect = jest.fn()

  setup({onSelect})

  const optionValue = screen.getAllByRole<HTMLOptionElement>('option')[1]?.value

  fireEvent.change(screen.getByTestId('select'), {target: {value: optionValue}})

  expect(onSelect).toHaveBeenCalledTimes(2)
  expect(onSelect).toHaveBeenCalledWith(optionValue)
})

const setup = ({onSelect = (): void => {}}: {onSelect?: (category: string) => void}) => {
  renderRelay<{testQuery: DiscussionCategoryPickerTestQuery}>(
    ({queryData: {testQuery}}) =>
      testQuery.repository ? (
        <DiscussionCategoryPicker onSelect={onSelect} discussionCategoriesData={testQuery.repository} />
      ) : (
        <div />
      ),
    {
      relay: {
        queries: {
          testQuery: {
            type: 'fragment',
            query: graphql`
              query DiscussionCategoryPickerTestQuery($first: Int!, $repo: String!, $owner: String!)
              @relay_test_operation {
                repository(name: $repo, owner: $owner) {
                  ...DiscussionCategoryPickerDiscussionCategories
                }
              }
            `,
            variables: {
              first: 10,
              owner: 'monalisa',
              repo: 'smile',
            },
          },
        },
        mockResolvers: {
          DiscussionCategoryConnection() {
            return {
              edges: [
                {node: buildDiscussionCategory({name: 'Announcements'})},
                {node: buildDiscussionCategory({name: 'General'})},
                {node: buildDiscussionCategory({name: 'Ideas'})},
              ],
            }
          },
        },
      },
    },
  )
}
