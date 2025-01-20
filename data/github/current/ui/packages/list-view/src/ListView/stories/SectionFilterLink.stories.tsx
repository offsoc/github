import type {Meta, StoryObj} from '@storybook/react'
import {useEffect, useState} from 'react'

import {ListViewSectionFilterLink, type ListViewSectionFilterLinkProps} from '../SectionFilterLink'
import {ListViewSectionFilters} from '../SectionFilters'

const meta = {
  title: 'Recipes/ListView/Subcomponents/ListViewSectionFilterLink',
  component: ListViewSectionFilterLink,
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
} satisfies Meta<ListViewSectionFilterLinkProps>

export default meta

export const OneLink: StoryObj<ListViewSectionFilterLinkProps> = {
  args: {
    ...meta.args,
    title: 'Authored',
  },
  render: (linkProps: ListViewSectionFilterLinkProps) => {
    return <ListViewSectionFilters links={[<ListViewSectionFilterLink key="1" {...linkProps} />]} />
  },
}

const SampleSectionFilters = ({count, title, isSelected, ...linkProps}: ListViewSectionFilterLinkProps) => {
  const [isFirstLinkSelected, setIsFirstLinkSelected] = useState(isSelected)
  useEffect(() => setIsFirstLinkSelected(isSelected), [isSelected])
  return (
    <ListViewSectionFilters
      links={[
        <ListViewSectionFilterLink
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
        <ListViewSectionFilterLink
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

export const MultipleLinks: StoryObj<ListViewSectionFilterLinkProps> = {
  args: {
    ...meta.args,
    title: 'Open',
  },
  render: (linkProps: ListViewSectionFilterLinkProps) => <SampleSectionFilters {...linkProps} />,
}
