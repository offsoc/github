// Temporary file to hold the ExplorePage type and the initial and full list of ExplorePages.
// The list is hardcoded for now as we experiment with the Explore search provider.

export interface ExplorePage {
  title: string
  url: string
  octicon: string
}

// Initial suggestions are: Enterprise, Security, Copilot, and Pricing - before the user types anything.
export const InitialExplorePages: ExplorePage[] = [
  {title: 'Enterprise', url: '/enterprise', octicon: 'organization'},
  {title: 'Security', url: '/security', octicon: 'shield-check'},
  {title: 'Copilot', url: '/features/copilot', octicon: 'copilot'},
  {title: 'Pricing', url: '/pricing', octicon: 'credit-card'},
]

export const ExplorePages: ExplorePage[] = [
  {title: 'GitHub Actions', url: '/features/actions', octicon: 'workflow'},
  {title: 'Blog', url: 'https://github.blog', octicon: 'book'},
  {title: 'CI/CD', url: '/solutions/ci-cd/', octicon: 'workflow'},
  {title: 'Code review', url: '/features/code-review', octicon: 'code-review'},
  {title: 'Codespaces', url: '/features/codespaces', octicon: 'codespaces'},
  {title: 'Copilot', url: '/features/copilot', octicon: 'copilot'},
  {title: 'Customer stories', url: '/customer-stories', octicon: 'comment'},
  {title: 'Discussions', url: '/features/discussions', octicon: 'comment-discussion'},
  {title: 'Documentation', url: 'https://docs.github.com', octicon: 'book'},
  {title: 'Enterprise', url: '/enterprise', octicon: 'organization'},
  {title: 'Features', url: '/features', octicon: 'rocket'},
  {title: 'GitHub Security', url: '/security', octicon: 'shield-check'},
  {title: 'GitHub Sponsors', url: '/sponsors', octicon: 'heart'},
  {title: 'GitHub Pages', url: 'https://pages.github.com', octicon: 'server'},
  {title: 'Integrations', url: '/features/integrations', octicon: 'globe'},
  {title: 'Issues', url: '/features/issues', octicon: 'issue-opened'},
  {title: 'GitHub Mobile', url: '/mobile', octicon: 'device-mobile'},
  {title: 'GitHub Packages', url: '/features/packages', octicon: 'package'},
  {title: 'Pricing', url: '/pricing', octicon: 'credit-card'},
  {title: 'Resources', url: 'https://resources.github.com', octicon: 'book'},
  {title: 'Secure your code', url: '/features/security/code-scanning', octicon: 'shield-check'},
  {title: 'Security features', url: '/features/security', octicon: 'shield-check'},
  {title: 'Software supply chain', url: '/features/security/software-supply-chain', octicon: 'shield-check'},
  {title: 'Startups', url: '/enterprise/startups', octicon: 'rocket'},
  {title: 'Team', url: '/team', octicon: 'organization'},
  {title: 'The ReadME Project', url: '/readme', octicon: 'book'},
  {title: 'The ReadME Podcast', url: '/readme/podcast', octicon: 'play'},
  {title: 'Feature Previews', url: '/features/preview', octicon: 'gift'},
  {title: 'Code Search', url: '/features/code-search', octicon: 'code-square'},
  {title: 'GitHub Changelog', url: 'https://github.blog/changelog', octicon: 'book'},
  {title: 'GitHub Shop', url: 'https://www.thegithubshop.com/', octicon: 'gift'},
  {title: 'GitHub Desktop', url: 'https://desktop.github.com', octicon: 'device-desktop'},
]
