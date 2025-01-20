/** @jest-environment node */

// Register with react-core before attempting to render
import {renderToString} from 'react-dom/server'
import {PortalTooltip} from '../PortalTooltip'
import {createRef} from 'react'

test('Renders PortalTooltip with SSR', () => {
  expect(() => {
    renderToString(<PortalTooltip contentRef={createRef()} id="" />)
  }).not.toThrow()
})
