import {GroupForm} from '../components/GroupForm'
import {Layout} from '../components/Layout'
import {GroupFormProvider} from '../contexts/GroupFormContext'
import {PAGE} from '../types'

export function New() {
  return (
    <Layout page={PAGE.New}>
      <GroupFormProvider>
        <GroupForm page={PAGE.New} />
      </GroupFormProvider>
    </Layout>
  )
}
