import {Box} from '@primer/react'
import {Link} from '@github-ui/react-core/link'

export function Nav() {
  return (
    <Box as="nav" aria-label="Test links" sx={{height: '150vh'}}>
      <h2>Anchor links</h2>
      <ul>
        <li>
          <a href="/_navigation_test/rails">Rails (anchor)</a>
        </li>
        <li>
          <a href="/_navigation_test/react/json/ssr">React SSR (anchor)</a>
        </li>
        <li>
          <a href="/_navigation_test/react/json/csr">React CSR (anchor)</a>
        </li>
        <li>
          <a href="/_navigation_test/react/json/transition_while_fetching">
            React React Transition While Fetching (anchor)
          </a>
        </li>
        <li>
          <a href="/_navigation_test/react/relay/ssr">React-Relay SSR (anchor)</a>
        </li>
        <li>
          <a href="/_navigation_test/react/relay/csr">React-Relay CSR (anchor)</a>
        </li>
      </ul>
      <h2>React Core Links</h2>
      <ul>
        <li>
          <Link to="/_navigation_test/rails">Rails (Link)</Link>
        </li>
        <li>
          <Link to="/_navigation_test/react/json/ssr">React SSR (Link)</Link>
        </li>
        <li>
          <Link to="/_navigation_test/react/json/csr">React CSR (Link)</Link>
        </li>
        <li>
          <Link to="/_navigation_test/react/json/transition_while_fetching">
            React React Transition While Fetching (Link)
          </Link>
        </li>
        <li>
          <Link to="/_navigation_test/react/relay/ssr">React-Relay SSR (Link)</Link>
        </li>
        <li>
          <Link to="/_navigation_test/react/relay/csr">React-Relay CSR (Link)</Link>
        </li>
      </ul>
    </Box>
  )
}
