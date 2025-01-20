// eslint-disable-next-line github/unescaped-html-literal
const moon = `<svg aria-hidden="true" role="img" class="octicon octicon-moon" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" style="display: inline-block; user-select: none; vertical-align: text-bottom; overflow: visible;"><path fill-rule="evenodd" d="M9.598 1.591a.75.75 0 01.785-.175 7 7 0 11-8.967 8.967.75.75 0 01.961-.96 5.5 5.5 0 007.046-7.046.75.75 0 01.175-.786zm1.616 1.945a7 7 0 01-7.678 7.678 5.5 5.5 0 107.678-7.678z"></path></svg>`
// eslint-disable-next-line github/unescaped-html-literal
const sun = `<svg aria-hidden="true" role="img" class="octicon octicon-sun" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" style="display: inline-block; user-select: none; vertical-align: text-bottom; overflow: visible;"><path fill-rule="evenodd" d="M8 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM8 12a4 4 0 100-8 4 4 0 000 8zM8 0a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V.75A.75.75 0 018 0zm0 13a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 018 13zM2.343 2.343a.75.75 0 011.061 0l1.06 1.061a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zm9.193 9.193a.75.75 0 011.06 0l1.061 1.06a.75.75 0 01-1.06 1.061l-1.061-1.06a.75.75 0 010-1.061zM16 8a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0116 8zM3 8a.75.75 0 01-.75.75H.75a.75.75 0 010-1.5h1.5A.75.75 0 013 8zm10.657-5.657a.75.75 0 010 1.061l-1.061 1.06a.75.75 0 11-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zm-9.193 9.193a.75.75 0 010 1.06l-1.06 1.061a.75.75 0 11-1.061-1.06l1.06-1.061a.75.75 0 011.061 0z"></path></svg>`

const getMode = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const mode = urlParams.get('mode')

  if (mode !== null) {
    return mode
  }

  const isDarkInside =
    mode === 'dark' || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
  return isDarkInside ? 'dark' : 'light'
}

const getTheme = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const theme = urlParams.get('theme')

  return theme ? theme : 'default'
}

// eslint-disable-next-line unused-imports/no-unused-vars
function initThemeOptions() {
  const mode = getMode()
  const theme = getTheme()

  document.documentElement.setAttribute('data-color-mode', mode)

  // reset theme attributes
  document.documentElement.removeAttribute('data-light-theme')
  document.documentElement.removeAttribute('data-dark-theme')

  if (theme && theme !== 'default') {
    document.documentElement.setAttribute(`data-${mode}-theme`, `${mode}_${theme}`)
  } else {
    document.documentElement.setAttribute(`data-${mode}-theme`, mode)
  }

  const colorMode = document.getElementById('color-mode-selector')
  colorMode.innerHTML = mode === 'dark' ? moon : sun

  colorMode.onclick = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark'
    const newTheme = theme === 'dimmed' && newMode === 'light' ? 'default' : theme

    changeMode(newMode, newTheme)
  }

  const themeOptions = document.getElementById('theme-options')
  themeOptions.textContent = ''
  const themes = ['default', 'colorblind', 'high_contrast', 'tritanopia']

  if (mode === 'dark') {
    themes.push('dimmed')
  }

  for (const name of themes) {
    const option = document.createElement('option')
    option.value = name
    option.textContent = name
    option.selected = name === theme

    themeOptions.appendChild(option)
  }

  themeOptions.onchange = () => {
    changeMode(mode, themeOptions.value)
  }
}

function changeMode(mode, theme) {
  const settings = new URLSearchParams({mode, theme})
  window.location.href = `?${settings.toString()}`
}
