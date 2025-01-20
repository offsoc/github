import {ThreePanesLayout} from '@github-ui/three-panes-layout'
import InboxRootV1 from '../components-v1/InboxRoot'

export const InboxPage = () => {
  return <ThreePanesLayout middlePane={<InboxRootV1 />} />
}
