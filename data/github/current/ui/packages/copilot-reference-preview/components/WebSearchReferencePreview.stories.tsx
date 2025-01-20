import type {Meta} from '@storybook/react'

import {WebSearchReferencePreview} from './WebSearchReferencePreview'

type WebSearchReferencePreviewProps = React.ComponentProps<typeof WebSearchReferencePreview>

const meta = {
  title: 'Apps/Copilot/WebSearchReferencePreview',
  component: WebSearchReferencePreview,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof WebSearchReferencePreview>

export default meta

const reference = {
  query: 'latest release of Perl',
  results: [
    {
      title: 'Perl Download - www.perl.org',
      excerpt:
        "We recommend that you always run the latest stable version, currently 5.38.2. If you're running a version older than 5.8.3, you may find that the latest version of CPAN modules will not work. Unix/Linux Included (may not be latest) Get Started macOS Included (may not be latest) Get Started Windows Strawberry Perl & ActiveState Perl Get Started Unix",
      url: 'https://www.perl.org/get.html',
    },
    {
      title: 'Announcing Perl 7',
      excerpt:
        'This morning at The Perl Conference in the Cloud, Sawyer X announced that Perl has a new plan moving forward. Work on Perl 7 is already underway, but it’s not going to be a huge change in code or syntax. It’s Perl 5 with modern defaults and it sets the stage for bigger changes later. My latest book Preparing for Perl 7 goes into much more detail.',
      url: 'https://www.perl.com/article/announcing-perl-7/?ref=alian.info',
    },
    {
      title: 'Perl Releases - dev.perl.org',
      excerpt:
        'Perl Releases. perl-5.39.7 (2024-01-20T12:44:12) perl-5.39.6 (2023-12-30T21:59:20) perl-5.38.2 (2023-11-29T16:10:36) perl-5.36.3 (2023-11-29T16:08:59) perl-5.34.3 (2023-11-29T13:10:30) perl-5.38.1a (2023-11-25T15:59:13) perl-5.36.2a (2023-11-25T15:59:01) perl-5 ...',
      url: 'https://dev.perl.org/perl5/news/',
    },
    {
      title: 'The Perl Programming Language - www.perl.org',
      excerpt:
        'Docs Core documentation, FAQs and translations. Contribute Perl is being actively developed. There are many ways to get involved CPAN The Comprehensive Perl Archive Network (CPAN) has over 25,000 open source distributions available for download. Events',
      url: 'https://www.perl.org/',
    },
  ],
  status: 'success',
  type: 'web-search' as const,
}

const defaultArgs: WebSearchReferencePreviewProps = {
  reference,
}

export const WebSearchReferencePreviewExample = {
  args: {
    ...defaultArgs,
  },
  render: (props: WebSearchReferencePreviewProps) => {
    return <WebSearchReferencePreview {...props} />
  },
}
