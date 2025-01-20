import {ReactBaseElement} from '../ReactBaseElement'
import {controller} from '@github/catalyst'
import type {EmbeddedData} from '../embedded-data-types'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'react-test': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
    }
  }
}

@controller
class ReactTestElement extends ReactBaseElement<EmbeddedData> {
  nameAttribute = 'app-name'

  async getReactNode() {
    return <div />
  }

  override disconnectedCallback() {
    /* no-op to prevent react from being disconnected too soon */
  }
}
