/*
  This is a function to catch and expect exceptions specific to passing the activeClassName prop in jest tests
  This issue is caused by using TabNav.Link component and passing as={Link} from @github/ui/react-core/link
  This should be resolved in Primer@v36, per https://github.com/primer/react/issues/3741#issuecomment-1723754255
*/
export const wrapActiveClassNameException = async (callback: () => unknown | Promise<unknown>) => {
  try {
    jest.spyOn(console, 'error').mockImplementation()
    await callback()
  } catch (e) {
    expect((e as Error).message).toContain('React does not recognize the `activeClassName` prop on a DOM element.')
  }
}
