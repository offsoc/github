import {render} from '@github-ui/react-core/test-utils'
import {useEffect} from 'react'

import {NestedListView, type NestedListViewProps} from '../../NestedListView'
import {NestedListItem, type NestedListItemProps} from '../NestedListItem'
import {NestedListItemTitle} from '../Title'

type RenderNestedListItemProps = Omit<NestedListItemProps, 'title'> & {
  title?: NestedListItemProps['title']
  listArgs?: Omit<NestedListViewProps, 'title'>
}

const defaultTitle = 'My item title'

export function renderNestedListItem({
  title = <NestedListItemTitle value={defaultTitle} />,
  throwError,
  listArgs,
  ...args
}: RenderNestedListItemProps & {throwError?: string}) {
  return render(
    <NestedListView title="My test list" {...listArgs}>
      <NestedListItem title={title} {...args} />
      {throwError && <ErrorComponent error={throwError} />}
    </NestedListView>,
  )
}

function ErrorComponent({error}: {error: string}) {
  useEffect(() => {
    if (error) {
      throw new Error(error)
    }
  }, [error])

  return <></>
}
