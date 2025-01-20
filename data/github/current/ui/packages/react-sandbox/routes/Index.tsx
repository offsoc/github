import {Box, Heading, ActionList} from '@primer/react'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {Link} from '@github-ui/react-core/link'
import {useNavigate} from '@github-ui/use-navigate'

export function IndexPage() {
  const payload = useRoutePayload()
  const navigate = useNavigate()

  return (
    <>
      <Heading as="h1" tabIndex={-1}>
        React sandbox index page
      </Heading>
      <Box as="pre" sx={{padding: 1, backgroundColor: 'canvas.inset', borderRadius: 2}} data-hpc={null}>
        {JSON.stringify({payload}, null, 2)}
      </Box>
      <Heading as="h2" tabIndex={-1} sx={{fontSize: 14}}>
        Some additional links/buttons for testing:
      </Heading>
      <ActionList showDividers>
        <ActionList.Group>
          <ActionList.GroupHeading as="h3">Destinations outside this app:</ActionList.GroupHeading>
          <ActionList.LinkItem href="/search">
            <code>/search</code>
          </ActionList.LinkItem>
          <ActionList.LinkItem href="/search" data-turbo={false}>
            <code>/search</code> (turbo disabled)
          </ActionList.LinkItem>
        </ActionList.Group>
        <ActionList.LinkItem as={Link} to="/pulls">
          <code>/pulls</code>
        </ActionList.LinkItem>
        <ActionList.LinkItem href="/pulls" data-turbo={false}>
          <code>/pulls</code> (turbo disabled)
        </ActionList.LinkItem>
        {/* NOTE: obviously this should be using a link and not an onclick, but we
            are doing this to test imperative navigations: */}
        <ActionList.Item onSelect={() => navigate('/pulls')}>
          <code>/pulls</code> (imperative navigation)
        </ActionList.Item>
        <ActionList.Group>
          <ActionList.GroupHeading as="h3">URL Hashes</ActionList.GroupHeading>
          <ActionList.LinkItem as={Link} to="#test-link">
            <code>#test-link</code>
          </ActionList.LinkItem>
          <ActionList.LinkItem as={Link} to="#test-link-2">
            <code>#test-link-2</code>
          </ActionList.LinkItem>{' '}
          <ActionList.Item
            onSelect={() => {
              navigate('/_react_sandbox#test-link-2')
            }}
          >
            <code>/_react_sandbox#test-link-2</code> (imperative navigation)
          </ActionList.Item>
          <ActionList.Item
            onSelect={() => {
              navigate('/_react_sandbox/hash#payload')
            }}
          >
            <code>/_react_sandbox/hash#payload</code> (imperative navigation)
          </ActionList.Item>
        </ActionList.Group>
      </ActionList>
      <div id="test-link" />
      <div id="test-link-2" />
    </>
  )
}
