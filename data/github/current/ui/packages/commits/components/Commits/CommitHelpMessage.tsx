import {Link} from '@primer/react'

export function CommitHelpMessage({url}: {url: string}) {
  return (
    <>
      <div className="text-center">
        <p className="color-fg-muted f6 mt-4">
          Seeing something unexpected? Take a look at the
          <Link inline href={url}>
            {' '}
            GitHub commits guide
          </Link>
          .
        </p>
      </div>
    </>
  )
}
