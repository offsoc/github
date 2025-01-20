import {Box} from '@primer/react'
import type {Meta, StoryObj} from '@storybook/react'
import type React from 'react'

import {
  BingFunctionButton,
  CodeSearchButton,
  GetIssueButton,
  PathSearchButton,
  SymbolSearchButton,
} from './FunctionCallButton'

type PropsOf<T> = T extends React.ComponentType<infer P> ? P : never
type BingFunctionButtonProps = PropsOf<typeof BingFunctionButton>
type CodeSearchButtonProps = PropsOf<typeof CodeSearchButton>
type GetIssueButtonProps = PropsOf<typeof GetIssueButton>
type PathSearchButtonProps = PropsOf<typeof PathSearchButton>
type SymbolSearchButtonProps = PropsOf<typeof SymbolSearchButton>

const meta = {
  title: 'Apps/Copilot/FunctionCallButton',
  component: GetIssueButton,
  parameters: {},
  argTypes: {},
} satisfies Meta<typeof GetIssueButton>

export default meta

const Wrapper = ({children}: {children?: React.ReactNode | undefined}) => <Box sx={{width: '400px'}}>{children}</Box>

export const GetIssue: StoryObj<GetIssueButtonProps> = {
  args: {
    functionCall: {
      slug: 'getissue',
      status: 'completed',
      arguments: '{\n  "issueNumber": 322188,\n  "repo": "github/github"\n}',
      references: [
        {
          id: 2257264363,
          number: 322188,
          repository: {
            id: 3,
            name: 'github',
            owner: 'github',
          },
          title: '[FF] copilot_updated_function_buttons',
          body: '### What is the name of your feature flag?\n\n[copilot_updated_function_buttons](https://devportal.githubapp.com/feature-flags/copilot_updated_function_buttons/overview)\n\n### What is its purpose?\n\nShows updated function invocation buttons in copilot chat.\n\n### What observability will be used during rollout?\n\n<!-- Add links to relevant dashboards and/or notebooks used to monitor the rollout -->\n\n### Is there a Planned Event?\n\nno\n\n### Feature Flag Rollout Checklist\n\n_See feature flag documentation [here](https://thehub.github.com/epd/engineering/products-and-services/dotcom/features/feature-flags/)._\n\n\n<!-- The following checklist is from the documentation linked above. Use this as a starting point for your rollout plan. Add additional steps if necessary -->\n\n- [x] Develop and test your changes locally. You can enable the feature flag in local developer environments for test purposes.\n- [x] Create a feature flag that is fully disabled for everyone and use it to control access to your new feature.\n- [x] Make sure that you test your code with the feature flag enabled and disabled to make sure both sides of the flag operate as expected with your changes. Add these tests to your test suite.\n- [x] Deploy to review-lab and repeat tests as above.\n- [ ] Follow [safe deployment guidelines](https://thehub.github.com/epd/engineering/products-and-services/dotcom/features/feature-flags/) for your feature flag rollout.\n- [ ] Deploy your software to all environments with the feature flag fully disabled.\n- [ ] Enable your feature flag for a limited testing audience to build confidence. Examples are staff shipping the feature or directly assigning access to a small subset of users/repos/businesses.\n- [ ] Slowly roll out your flag across environments by slowly incrementing access to wider audiences. This can be done with percentage of users or percentage of calls increases (e.g. 2%, 10%, 30%, 50%, etc.). If you detect any problems you can immediately reduce your rollout percentage or fully disable the feature flag. Various rollout strategies are possible using the different capabilities of the feature flag control gates (percentages, actors, custom groups, targeting specific environments like dotcom/proxima stamps).\n- [ ] At each stage of rollout monitor your changes for impacts to defects, error rates, performance and resource demands.\n- [ ] Once you have confidence in your feature and no reported or observed issues fully enable your feature flag for all environments.\n- [ ] For a period of time monitor the feature flag for stability and schedule removal of the feature flag after a minimum of two weeks of stability. First remove the conditional code that uses the feature flag and once all of it is deployed and showing no impacts, remove the feature flag itself.\n',
          state: 'open',
          authorLogin: 'dwilsonactual',
          url: 'https://github.com/github/github/issues/322188',
          type: 'issue',
        },
      ],
    },
    skillArgs: {
      kind: 'getissue',
      issueNumber: 322188,
      repo: 'github/github',
    },
  },
  render: (args: GetIssueButtonProps) => (
    <Wrapper>
      <GetIssueButton {...args} />
    </Wrapper>
  ),
}

export const GetIssueInProgress: StoryObj<GetIssueButtonProps> = {
  args: {
    functionCall: {
      slug: 'getissue',
      status: 'started',
      arguments: '{\n  "issueNumber": 322188,\n  "repo": "github/github"\n}',
      references: [],
    },
    skillArgs: {
      kind: 'getissue',
      issueNumber: 322188,
      repo: 'github/github',
    },
  },
  render: (args: GetIssueButtonProps) => (
    <Wrapper>
      <GetIssueButton {...args} />
    </Wrapper>
  ),
}

export const GetIssueError: StoryObj<GetIssueButtonProps> = {
  args: {
    functionCall: {
      slug: 'getissue',
      status: 'completed',
      arguments: '{\n  "issueNumber": 3221889,\n  "repo": "github/github"\n}',
      references: [
        {
          type: 'text',
          text: 'There was an error executing the getissue function.',
        },
      ],
    },
    skillArgs: {
      kind: 'getissue',
      issueNumber: 3221889,
      repo: 'github/github',
    },
  },
  render: (args: GetIssueButtonProps) => (
    <Wrapper>
      <GetIssueButton {...args} />
    </Wrapper>
  ),
}

export const WebSearch: StoryObj<BingFunctionButtonProps> = {
  args: {
    functionCall: {
      slug: 'bing-search',
      status: 'completed',
      arguments: '{\n  "query": "latest release of Ruby on Rails"\n}',
      references: [
        {
          query: 'latest release of Ruby on Rails',
          results: [
            {
              title: 'Ruby on Rails — Releases',
              excerpt:
                'So, following the script We are releasing a new release candidate, Rails 3.2.14.rc2. If no regressions are found we will... July 12, 2013 [ANN] Rails 3.2.14.rc1 has been released! ... We’ve released Ruby on Rails 2.3.6: six months of bug fixes, a handful of new features, and a strong bridge to Rails 3. We deprecated some obscure and ancient ...',
              url: 'https://rubyonrails.org/category/releases',
            },
            {
              title: 'Ruby on Rails — A web-app framework that includes everything needed to ...',
              excerpt:
                'Ruby on Rails scales from HELLO WORLD to IPO. Rails 7.1.3.2 — released February 21, 2024. You’re in good company. ... The latest releases and updates on development. Learn more about Hotwire, the default front-end framework for Rails. Stay up to date with Rails on Twitter, ...',
              url: 'https://rubyonrails.org/',
            },
            {
              title: 'Ruby on Rails | A web-application framework that includes everything ...',
              excerpt:
                'Latest version — Rails 6.1.4.1 released August 19, 2021. Released August 19, 2021. You’ve probably already used many of the applications that were built with Ruby on Rails: Basecamp, HEY, GitHub, ... but there are literally hundreds of thousands of applications built with the framework since its release in 2004. Ruby on Rails is open source ...',
              url: 'https://rails.github.io/homepage/',
            },
            {
              title: 'Ruby on Rails — Rails 7.0: Fulfilling a vision',
              excerpt:
                'Rails 7.0: Fulfilling a vision. Posted by dhh. This version of Rails has been years in the conceptual making. It’s the fulfillment of a vision to present a truly full-stack approach to web development that tackles both the front- and back-end challenges with equal vigor. An omakase menu that includes everything from the aperitif to the dessert.',
              url: 'https://rubyonrails.org/2021/12/15/Rails-7-fulfilling-a-vision',
            },
            {
              title: 'Rails Contributors - Rails Releases - Ruby on Rails',
              excerpt:
                'Listing of Ruby on Rails releases. Rails Releases Showing 304 releases. Tag Date Release Contributors Commits; v7.1.3.2: 21 Feb 2024',
              url: 'https://www.rubyonrails.org/releases',
            },
          ],
          status: 'success',
          type: 'web-search',
        },
      ],
    },
    skillArgs: {
      kind: 'bing-search',
      query: 'latest release of Ruby on Rails',
    },
  },
  render: (args: BingFunctionButtonProps) => (
    <Wrapper>
      <BingFunctionButton {...args} />
    </Wrapper>
  ),
}

export const WebSearchInProgress: StoryObj<BingFunctionButtonProps> = {
  args: {
    functionCall: {
      slug: 'bing-search',
      status: 'started',
      arguments: '{\n  "query": "latest release of Ruby on Rails"\n}',
      references: [],
    },
    skillArgs: {
      kind: 'bing-search',
      query: 'latest release of Ruby on Rails',
    },
  },
  render: (args: BingFunctionButtonProps) => (
    <Wrapper>
      <BingFunctionButton {...args} />
    </Wrapper>
  ),
}

export const CodeSearch: StoryObj<CodeSearchButtonProps> = {
  args: {
    functionCall: {
      slug: 'codesearch',
      status: 'completed',
      arguments: '{\n  "query": "list of reserved usernames",\n  "scopingQuery": "repo:github/github"\n}',
      references: [
        {
          type: 'snippet',
          ref: 'refs/heads/master',
          repoID: 3,
          repoName: 'github',
          repoOwner: 'github',
          url: 'https://github.com/github/github/blob/4155ea68824b691d6c90dbb25afcaceecc5b1bef/app/helpers/reactions_helper.rb#L1-L51',
          path: 'app/helpers/reactions_helper.rb',
          commitOID: '4155ea68824b691d6c90dbb25afcaceecc5b1bef',
          languageName: 'Ruby',
          languageID: 326,
          range: {
            start: 1,
            end: 51,
          },
        },
        {
          type: 'snippet',
          ref: 'refs/heads/master',
          repoID: 3,
          repoName: 'github',
          repoOwner: 'github',
          url: 'https://github.com/github/github/blob/4155ea68824b691d6c90dbb25afcaceecc5b1bef/script/seeds/runners/sponsors.rb#L475-L551',
          path: 'script/seeds/runners/sponsors.rb',
          commitOID: '4155ea68824b691d6c90dbb25afcaceecc5b1bef',
          languageName: 'Ruby',
          languageID: 326,
          range: {
            start: 475,
            end: 551,
          },
        },
        {
          type: 'snippet',
          ref: 'refs/heads/master',
          repoID: 3,
          repoName: 'github',
          repoOwner: 'github',
          url: 'https://github.com/github/github/blob/4155ea68824b691d6c90dbb25afcaceecc5b1bef/config/initializers/denylist.rb#L1-L189',
          path: 'config/initializers/denylist.rb',
          commitOID: '4155ea68824b691d6c90dbb25afcaceecc5b1bef',
          languageName: 'Ruby',
          languageID: 326,
          range: {
            start: 1,
            end: 189,
          },
        },
        {
          type: 'snippet',
          ref: 'refs/heads/master',
          repoID: 3,
          repoName: 'github',
          repoOwner: 'github',
          url: 'https://github.com/github/github/blob/4155ea68824b691d6c90dbb25afcaceecc5b1bef/lib/github/database_structure.rb#L194-L322',
          path: 'lib/github/database_structure.rb',
          commitOID: '4155ea68824b691d6c90dbb25afcaceecc5b1bef',
          languageName: 'Ruby',
          languageID: 326,
          range: {
            start: 194,
            end: 322,
          },
        },
        {
          type: 'snippet',
          ref: 'refs/heads/master',
          repoID: 3,
          repoName: 'github',
          repoOwner: 'github',
          url: 'https://github.com/github/github/blob/4155ea68824b691d6c90dbb25afcaceecc5b1bef/app/helpers/suggested_usernames_helper.rb#L37-L156',
          path: 'app/helpers/suggested_usernames_helper.rb',
          commitOID: '4155ea68824b691d6c90dbb25afcaceecc5b1bef',
          languageName: 'Ruby',
          languageID: 326,
          range: {
            start: 37,
            end: 156,
          },
        },
        {
          type: 'snippet',
          ref: 'refs/heads/master',
          repoID: 3,
          repoName: 'github',
          repoOwner: 'github',
          url: 'https://github.com/github/github/blob/4155ea68824b691d6c90dbb25afcaceecc5b1bef/packages/community_and_safety/test/models/reserved_login_test.rb#L161-L246',
          path: 'packages/community_and_safety/test/models/reserved_login_test.rb',
          commitOID: '4155ea68824b691d6c90dbb25afcaceecc5b1bef',
          languageName: 'Ruby',
          languageID: 326,
          range: {
            start: 161,
            end: 246,
          },
        },
      ],
    },
    skillArgs: {
      kind: 'codesearch',
      query: 'list of reserved usernames',
      scopingQuery: 'repo:github/github',
    },
  },
  render: (args: CodeSearchButtonProps) => (
    <Wrapper>
      <CodeSearchButton {...args} />
    </Wrapper>
  ),
}

export const CodeSearchInProgress: StoryObj<CodeSearchButtonProps> = {
  args: {
    functionCall: {
      slug: 'codesearch',
      status: 'started',
      arguments: '{\n  "query": "list of reserved usernames",\n  "scopingQuery": "repo:github/github"\n}',
      references: [],
    },
    skillArgs: {
      kind: 'codesearch',
      query: 'list of reserved usernames',
      scopingQuery: 'repo:github/github',
    },
  },
  render: (args: CodeSearchButtonProps) => (
    <Wrapper>
      <CodeSearchButton {...args} />
    </Wrapper>
  ),
}

export const PathSearch: StoryObj<PathSearchButtonProps> = {
  args: {
    functionCall: {
      slug: 'pathsearch',
      status: 'completed',
      arguments:
        '{\n  "filename": "src/__tests__/blackbird.test.ts",\n  "scopingQuery": "repo:github/blackbird-parser"\n}',
      references: [
        {
          type: 'snippet',
          ref: 'refs/heads/main',
          repoID: 482949784,
          repoName: 'blackbird-parser',
          repoOwner: 'github',
          url: 'http://github.localhost/github/blackbird-parser/blob/f19fdb6370232d218bfee545c4ad1e809c78af7b/src/__tests__/blackbird.test.ts#L1-L140',
          path: 'src/__tests__/blackbird.test.ts',
          commitOID: 'f19fdb6370232d218bfee545c4ad1e809c78af7b',
          languageName: 'TypeScript',
          languageID: 378,
          range: {
            start: 1,
            end: 140,
          },
        },
      ],
    },
    skillArgs: {
      kind: 'pathsearch',
      filename: 'src/__tests__/blackbird.test.ts',
      scopingQuery: 'repo:github/blackbird-parser',
    },
  },
  render: (args: PathSearchButtonProps) => (
    <Wrapper>
      <PathSearchButton {...args} />
    </Wrapper>
  ),
}

export const PathSearchInProgress: StoryObj<PathSearchButtonProps> = {
  args: {
    functionCall: {
      slug: 'pathsearch',
      status: 'started',
      arguments:
        '{\n  "filename": "src/__tests__/blackbird.test.ts",\n  "scopingQuery": "repo:github/blackbird-parser"\n}',
      references: [],
    },
    skillArgs: {
      kind: 'pathsearch',
      filename: 'src/__tests__/blackbird.test.ts',
      scopingQuery: 'repo:github/blackbird-parser',
    },
  },
  render: (args: PathSearchButtonProps) => (
    <Wrapper>
      <PathSearchButton {...args} />
    </Wrapper>
  ),
}

export const PathSearchError: StoryObj<PathSearchButtonProps> = {
  args: {
    functionCall: {
      slug: 'pathsearch',
      status: 'completed',
      arguments:
        '{\n  "filename": "ui/packages/copilot-chat/components/FunctionCallItem.tsx",\n  "scopingQuery": "repo:github/github"\n}',
      references: [
        {
          type: 'text',
          text: 'No results found.',
        },
      ],
    },
    skillArgs: {
      kind: 'pathsearch',
      filename: 'ui/packages/copilot-chat/components/FunctionCallItem.tsx',
      scopingQuery: 'repo:github/github',
    },
  },
  render: (args: PathSearchButtonProps) => (
    <Wrapper>
      <PathSearchButton {...args} />
    </Wrapper>
  ),
}

export const SymbolSearch: StoryObj<SymbolSearchButtonProps> = {
  args: {
    functionCall: {
      slug: 'show-symbol-definition',
      status: 'completed',
      arguments: '{\n  "scopingQuery": "repo:github/blackbird-parser",\n  "symbolName": "convertGlobToRegex"\n}',
      references: [
        {
          type: 'snippet',
          ref: 'refs/heads/main',
          repoID: 482949784,
          repoName: 'blackbird-parser',
          repoOwner: 'github',
          url: 'https://github.com/github/blackbird-parser/blob/f19fdb6370232d218bfee545c4ad1e809c78af7b/src/glob.ts#L1-L49',
          path: 'src/glob.ts',
          commitOID: 'f19fdb6370232d218bfee545c4ad1e809c78af7b',
          languageName: 'TypeScript',
          languageID: 378,
          range: {
            start: 1,
            end: 49,
          },
        },
      ],
    },
    skillArgs: {
      kind: 'show-symbol-definition',
      symbolName: 'convertGlobToRegex',
      scopingQuery: 'repo:github/blackbird-parser',
    },
  },
  render: (args: SymbolSearchButtonProps) => (
    <Wrapper>
      <SymbolSearchButton {...args} />
    </Wrapper>
  ),
}

export const SymbolSearchInProgress: StoryObj<SymbolSearchButtonProps> = {
  args: {
    functionCall: {
      slug: 'show-symbol-definition',
      status: 'started',
      arguments: '{\n  "scopingQuery": "repo:github/blackbird-parser",\n  "symbolName": "convertGlobToRegex"\n}',
      references: [],
    },
    skillArgs: {
      kind: 'show-symbol-definition',
      symbolName: 'convertGlobToRegex',
      scopingQuery: 'repo:github/blackbird-parser',
    },
  },
  render: (args: SymbolSearchButtonProps) => (
    <Wrapper>
      <SymbolSearchButton {...args} />
    </Wrapper>
  ),
}
