function errorTemplate(title = 'Error loading data', message = 'Unable to render chart.'): string {
  const div = document.createElement('div')
  div.setAttribute(
    'class',
    'blankslate color-bg-tertiary rounded-1 d-flex flex-column flex-items-center flex-justify-center height-full',
  )

  // eslint-disable-next-line github/unescaped-html-literal
  const svg = `<svg
  aria-hidden="true"
  height="24"
  viewBox="0 0 24 24"
  version="1.1"
  width="24"
  class="octicon octicon-graph blankslate-icon"
>
  <path d="M2.5 2.75a.75.75 0 00-1.5 0v18.5c0 .414.336.75.75.75H20a.75.75 0 000-1.5H2.5V2.75z"></path>
  <path
    d="M22.28 7.78a.75.75 0 00-1.06-1.06l-5.72 5.72-3.72-3.72a.75.75 0 00-1.06 0l-6 6a.75.75 0 101.06 1.06l5.47-5.47 3.72 3.72a.75.75 0 001.06 0l6.25-6.25z"
  ></path>
</svg>`

  const h3 = document.createElement('h3')
  h3.setAttribute('class', 'mb-1')
  h3.textContent = title

  const p = document.createElement('p')
  p.textContent = message

  div.innerHTML = svg
  div.appendChild(h3)
  div.appendChild(p)

  return div.outerHTML
}

export default errorTemplate
