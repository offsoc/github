import type {Meta, StoryObj} from '@storybook/react'
import {useEffect, useState} from 'react'

import {
  NestedListViewHeaderSectionFilterLink,
  type NestedListViewHeaderSectionFilterLinkProps,
} from '../SectionFilterLink'
import {NestedListViewHeaderSectionFilters} from '../SectionFilters'

const meta = {
  title: 'Recipes/NestedListView/NestedListViewHeader/NestedListViewHeaderSectionFilterLink',
  component: NestedListViewHeaderSectionFilterLink,
  args: {
    isSelected: true,
    isLoading: false,
    count: '1,234',
    underline: false,
    muted: false,
    href: '#',
  },
  argTypes: {
    count: {control: 'text'},
  },
} satisfies Meta<NestedListViewHeaderSectionFilterLinkProps>

export default meta

export const OneLink: StoryObj<NestedListViewHeaderSectionFilterLinkProps> = {
  args: {
    ...meta.args,
    title: 'Authored',
  },
  render: (linkProps: NestedListViewHeaderSectionFilterLinkProps) => {
    return (
      <NestedListViewHeaderSectionFilters links={[<NestedListViewHeaderSectionFilterLink key="1" {...linkProps} />]} />
    )
  },
}

const SampleSectionFilters = ({count, title, isSelected, ...linkProps}: NestedListViewHeaderSectionFilterLinkProps) => {
  const [isFirstLinkSelected, setIsFirstLinkSelected] = useState(isSelected)
  useEffect(() => setIsFirstLinkSelected(isSelected), [isSelected])
  return (
    <NestedListViewHeaderSectionFilters
      links={[
        <NestedListViewHeaderSectionFilterLink
          key="1"
          isSelected={isFirstLinkSelected}
          onClick={e => {
            e.preventDefault()
            setIsFirstLinkSelected(true)
          }}
          title={title}
          count={count}
          {...linkProps}
        />,
        <NestedListViewHeaderSectionFilterLink
          key="2"
          isSelected={!isFirstLinkSelected}
          onClick={e => {
            e.preventDefault()
            setIsFirstLinkSelected(false)
          }}
          title="Closed"
          count={456}
          {...linkProps}
        />,
      ]}
    />
  )
}

export const MultipleLinks: StoryObj<NestedListViewHeaderSectionFilterLinkProps> = {
  args: {
    ...meta.args,
    title: 'Open',
  },
  render: (linkProps: NestedListViewHeaderSectionFilterLinkProps) => <SampleSectionFilters {...linkProps} />,
}
