import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {
  // eslint-disable-next-line no-restricted-imports
  Avatar,
  type AvatarProps,
} from '@primer/react'
import {forwardRef, useMemo} from 'react'

export type GitHubAvatarProps = AvatarProps

export const GitHubAvatar = forwardRef<HTMLImageElement, GitHubAvatarProps>(function GitHubAvatar(
  {src, size = 20, ...otherProps}: GitHubAvatarProps,
  ref,
) {
  const avatarUrl = useMemo(() => {
    // src maybe be relative, e.g. `/mona.png`, in which case the instances main origin should be used,
    // e.g. "https://github.com" for dotcom. If src is a fully quallified URL then the origin argument is ignored.
    const url = new URL(src, ssrSafeLocation.origin)

    // do not override size if it's already set as query parameter
    if (!url.searchParams.has('size') && !url.searchParams.has('s')) {
      // we double size for better rendering on high density pixel screens
      url.searchParams.set('size', String(Number(size) * 2))
    }

    return url.toString()
  }, [src, size])

  return <Avatar ref={ref} src={avatarUrl} size={size} data-testid="github-avatar" {...otherProps} />
})
