import {controller} from '@github/catalyst'
import {getReactPartial} from './react-partial-registry'
import type {EmbeddedPartialData} from './embedded-data-types'
import {ReactBaseElement} from './ReactBaseElement'
import {PartialEntry} from './PartialEntry'
import type {ReactPartialAnchorElement} from '@github-ui/react-partial-anchor-element'

// What is this silliness? Is it react or a web component?!
// It's a web component we use to bootstrap react partials within the monolith.
@controller
class ReactPartialElement extends ReactBaseElement<EmbeddedPartialData> {
  nameAttribute = 'partial-name'

  async getReactNode(embeddedData: EmbeddedPartialData) {
    const {Component} = await getReactPartial(this.name)

    // Some React Partials will be wrapped in a react-partial-anchor, which is used to conditionally render the Partial
    const anchorElement = this.closest<ReactPartialAnchorElement>('react-partial-anchor')

    return (
      <PartialEntry
        partialName={this.name}
        embeddedData={embeddedData}
        Component={Component}
        wasServerRendered={this.hasSSRContent}
        ssrError={this.ssrError}
        anchorElement={anchorElement}
      />
    )
  }
}
