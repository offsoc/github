import {Link} from '@primer/react'

export type FirstTimeContributionBannerDisplayProps = {
  repoNameWithOwner: string
  contributingGuidelinesUrl?: string
  hasGoodFirstIssueIssues: boolean
  contributeUrl: string
}

export const FirstTimeContributionBannerDisplay = ({
  repoNameWithOwner,
  contributingGuidelinesUrl,
  hasGoodFirstIssueIssues,
  contributeUrl,
}: FirstTimeContributionBannerDisplayProps) => {
  return (
    <div className="mt-2 p-4 text-center rounded-2 border color-border-muted">
      <div className="col-8 mx-auto">
        <h4 className="mb-2">👋 Want to contribute to {repoNameWithOwner}?</h4>
        <span>
          {contributingGuidelinesUrl ? (
            <>
              <span>If you have a bug or an idea, read the </span>
              <Link href={contributingGuidelinesUrl} target="_blank" data-testid="repo-contributing-guidelines">
                contributing guidelines
              </Link>
              <span> before opening an issue.</span>
            </>
          ) : (
            <>
              <span>If you have a bug or an idea, browse the open issues before opening a new one.</span>
              <br />
              <span> You can also take a look at the </span>
              <Link href="https://opensource.guide" target="_blank" data-testid="open-source-guide">
                Open Source Guide
              </Link>
              <span>.</span>
            </>
          )}
        </span>
        {hasGoodFirstIssueIssues && (
          <>
            <br />
            <span>
              <span>If you&apos;re ready to tackle some open issues, </span>
              <Link href={contributeUrl} target="_blank" data-testid="repo-good-first-issues">
                we&apos;ve collected some good first issues for you.
              </Link>
            </span>
          </>
        )}
      </div>
    </div>
  )
}
