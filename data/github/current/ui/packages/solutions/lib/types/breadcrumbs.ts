export const CategoryBreadcrumbs = {
  ['use-case']: {label: 'By use case', url: '/use-case'},
  ['company-size']: {label: 'By company size', url: '/company-size'},
  industry: {label: 'By industry', url: '/industry'},
}

type CategoryKeys = keyof typeof CategoryBreadcrumbs

export const SolutionsBreadcrumb = {
  label: 'Solutions',
  url: '/solutions',
}

export const isCategory = (categoryName: string): categoryName is CategoryKeys => {
  return Object.keys(CategoryBreadcrumbs).includes(categoryName)
}
