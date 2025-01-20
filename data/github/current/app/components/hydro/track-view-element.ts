import {controller} from '@github/catalyst'
import {trackView} from '../../assets/modules/github/hydro-tracking'

@controller
class TrackViewElement extends HTMLElement {
  connectedCallback() {
    trackView(this)
  }
}
