export const withDisabledCharacterKeys = (testFn: () => Promise<void>) => {
  const meta = document.createElement('meta')
  meta.name = 'keyboard-shortcuts-preference'
  meta.content = 'no_character_key'
  document.head.appendChild(meta)

  void testFn()

  meta.remove()
}
