import {mockMarkerNavigationImplementation} from '@github-ui/diff-lines/test-utils'
import {noop} from '@github-ui/noop'
import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {buildAnnotation} from '../../test-utils/query-data'
import {AnnotationDialog} from '../AnnotationDialog'

describe('AnnotationDialog', () => {
  test('renders the annotation in the dialog', async () => {
    const annotation = buildAnnotation({title: 'this is bonkers!'})

    render(
      <AnnotationDialog
        annotation={annotation}
        markerNavigationImplementation={mockMarkerNavigationImplementation}
        onClose={noop}
      />,
    )

    expect(screen.getByText('this is bonkers!')).toBeVisible()
  })

  describe('global marker navigation', () => {
    test('does not render the left/right arrows if there is only one marker to navigate through', () => {
      const annotation = buildAnnotation({title: 'this is bonkers!'})

      const markerNavigationImplementation = {
        incrementActiveMarker: jest.fn(),
        decrementActiveMarker: jest.fn(),
        filteredMarkers: [annotation],
      }

      render(
        <AnnotationDialog
          annotation={annotation}
          markerNavigationImplementation={{...mockMarkerNavigationImplementation, ...markerNavigationImplementation}}
          onClose={noop}
        />,
      )

      expect(screen.queryByLabelText('Load previous marker')).toBeNull()
      expect(screen.queryByLabelText('Load next marker')).toBeNull()
    })

    test('renders the left/right arrows if the annotation is in the collection of navigable markers and there is more than one navigable marker', () => {
      const annotation = buildAnnotation({title: 'this is bonkers!'})
      const annotation2 = buildAnnotation({title: 'danger!'})
      const markerNavigationImplementation = {
        incrementActiveMarker: jest.fn(),
        decrementActiveMarker: jest.fn(),
        filteredMarkers: [annotation, annotation2],
      }

      render(
        <AnnotationDialog
          annotation={annotation}
          markerNavigationImplementation={{...mockMarkerNavigationImplementation, ...markerNavigationImplementation}}
          onClose={noop}
        />,
      )

      expect(screen.getByLabelText('Load previous marker')).toBeInTheDocument()
      expect(screen.getByLabelText('Load next marker')).toBeInTheDocument()
    })

    test('does not render the left/right arrows if the annotation is not in the collection of navigable markers (unlikely)', () => {
      const annotation = buildAnnotation({title: 'this is bonkers!'})
      const annotation2 = buildAnnotation({title: 'danger!'})
      const annotation3 = buildAnnotation({title: 'this annotation went missing'})
      const markerNavigationImplementation = {
        incrementActiveMarker: jest.fn(),
        decrementActiveMarker: jest.fn(),
        filteredMarkers: [annotation, annotation2],
      }

      render(
        <AnnotationDialog
          annotation={annotation3}
          markerNavigationImplementation={{...mockMarkerNavigationImplementation, ...markerNavigationImplementation}}
          onClose={noop}
        />,
      )

      expect(screen.queryByLabelText('Load previous marker')).toBeNull()
      expect(screen.queryByLabelText('Load next marker')).toBeNull()
    })
  })
})
