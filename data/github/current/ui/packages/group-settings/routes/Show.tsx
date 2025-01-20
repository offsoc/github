import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {GroupForm} from '../components/GroupForm'
import {GroupFormProvider} from '../contexts/GroupFormContext'
import {Layout} from '../components/Layout'
import {PAGE, type ShowPayload} from '../types'

export function Show() {
  const {group} = useRoutePayload<ShowPayload>()
  const name = group.group_path.split('/').pop()

  return (
    <Layout page={PAGE.Show} name={name}>
      <GroupFormProvider>
        <GroupForm group={group} page={PAGE.Show} />
      </GroupFormProvider>
    </Layout>
  )
}
