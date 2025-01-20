/**
 * Returns different image sizes to optimize for performance.
 **/
export const getImageSources = (
  url: string,
): Array<{
  srcset: string
  media: string
}> => {
  const sources = [480, 768, 1280].map(size => {
    return {
      srcset: `${url}?w=${size}&fm=webp 1x, ${url}?w=${size * 2}&fm=webp 2x`,
      media: `(max-width: ${size}px)`,
    }
  })

  return [...sources, {srcset: `${url}?fm=webp`, media: `(min-width: 1280px)`}]
}
