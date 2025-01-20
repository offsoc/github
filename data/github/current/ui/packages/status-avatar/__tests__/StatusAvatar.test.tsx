import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {StatusAvatar} from '../StatusAvatar'
import {XCircleFillIcon} from '@primer/octicons-react'

test('Renders the StatusAvatar', () => {
  const altText = 'My avatar'
  const hovercardUrl = '/monalisa'
  const src = 'https://avatars.githubusercontent.com/u/1?s=40&v=4'
  render(
    <StatusAvatar
      altText={altText}
      hovercardUrl={hovercardUrl}
      src={src}
      square={false}
      icon={XCircleFillIcon}
      iconColor="color.fg"
      backgroundColor="success.fg"
      zIndex={{zIndex: 1}}
    />,
  )
  expect(screen.getByAltText(altText)).toBeInTheDocument()
})
