export function slugify(heading: string) {
  return (
    heading
      .toLowerCase()
      /**
       * We keep only alphanumeric characters, spaces, and hyphens.
       */
      .replace(/[^\w\s-]/g, '')
      /**
       * We replace spaces with hyphens.
       */
      .replace(/\s+/g, '-')
  )
}
