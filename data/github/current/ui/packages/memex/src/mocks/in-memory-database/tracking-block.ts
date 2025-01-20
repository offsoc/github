/**
 * Using a tagged template literal to generate the HTML for the tracking block
 *
 * This is totally useless for this case, but it makes the html syntax highlighting
 * work in vscode which is nice for updating this when necessary
 */
const html = (strings: TemplateStringsArray, ...values: Array<unknown>) => {
  return strings.reduce((acc, str, i) => {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return `${acc}${str}${values[i] || ''}`
  }, '')
}

/**
 * straight up copy/pasted from the P&T Roadmap
 * Then removed the excess stuff so we can avoid styling here, which is likely to break if we update the component
 * or dotcom does some stuff
 */
export const mockTasklistBlockHtml = html`
  <tracking-block
    data-uuid="b45027d0-cc1f-44d7-9e0b-cad263b70ad9"
    data-query-type=""
    data-catalyst=""
    data-response-source-type=""
    data-completion-completed="0"
    data-completion-total="0"
  >
    <div>
      <div>
        <div>
          <h3>
            Tasks (
            <span title="I look fake, because I am, but I have the necessary attributes to kinda work">MOCKED</span>
            )
          </h3>
        </div>
      </div>

      <ol>
        <li
          data-repository-name="planning-tracking"
          data-repository-id="197476416"
          data-display-number="1047"
          data-item-id="1264650376"
          data-item-position="100"
          data-item-state="closed"
          data-item-title="Tracking: (M0.1 - prototype / spike) Build a React-based Issues experience"
          data-item-uuid="fda8352d-c680-46c2-8987-302eac56b354"
          data-issue=""
        >
          <a href="https://github.com/github/planning-tracking/issues/1047" target="_blank" rel="noopener noreferrer">
            <span>Tracking: (M0.1 - prototype / spike) Build a React-based Issues experience</span>
            <span>#1047</span>
          </a>
        </li>

        <li
          data-repository-name="planning-tracking"
          data-repository-id="197476416"
          data-display-number="1097"
          data-item-id="1300203817"
          data-item-position="200"
          data-item-state="closed"
          data-item-title="Tracking: (M0.2 Prototype) Build a React-based Issues experience"
          data-item-uuid="7679b72a-d9a2-415b-aecb-2c98acdae9fc"
          data-issue=""
        >
          <a href="https://github.com/github/planning-tracking/issues/1097" target="_blank" rel="noopener noreferrer">
            <span>Tracking: (M0.2 Prototype) Build a React-based Issues experience</span>
            <span>#1097</span>
          </a>
        </li>

        <li
          data-repository-name="planning-tracking"
          data-repository-id="197476416"
          data-display-number="1143"
          data-item-id="1337128503"
          data-item-position="300"
          data-item-state="closed"
          data-item-title="Tracking: [Hyperlist Web] Access built-in views"
          data-item-uuid="53650062-a6d3-42f8-816b-3291ab6a3c68"
          data-issue=""
        >
          <a href="https://github.com/github/planning-tracking/issues/1143" target="_blank" rel="noopener noreferrer">
            <span>Tracking: [Hyperlist Web] Access built-in views</span>
            <span>#1143</span>
          </a>
        </li>

        <li
          data-repository-name="planning-tracking"
          data-repository-id="197476416"
          data-display-number="1152"
          data-item-id="1340194194"
          data-item-position="400"
          data-item-state="closed"
          data-item-title="Tracking: [Hyperlist Web] Improvements to Issue show"
          data-item-uuid="bf15103b-d908-44cb-b3a1-0d48e64fd5bc"
          data-issue=""
        >
          <a href="https://github.com/github/planning-tracking/issues/1152" target="_blank" rel="noopener noreferrer">
            <span>Tracking: [Hyperlist Web] Improvements to Issue show</span>
            <span>#1152</span>
          </a>
        </li>

        <li
          data-repository-name="planning-tracking"
          data-repository-id="197476416"
          data-display-number="1497"
          data-item-id="1407735728"
          data-item-position="600"
          data-item-state="closed"
          data-item-title="Tracking: [Hyperlist Web] Define and implement a testing strategy"
          data-item-uuid="45262d82-407d-47dd-a237-5b7890617274"
          data-issue=""
        >
          <a href="https://github.com/github/planning-tracking/issues/1497" target="_blank" rel="noopener noreferrer">
            <span>Tracking: [Hyperlist Web] Define and implement a testing strategy</span>
            <span>#1497</span>
          </a>
        </li>

        <li
          data-repository-name="planning-tracking"
          data-repository-id="197476416"
          data-display-number="1498"
          data-item-id="1407735853"
          data-item-position="800"
          data-item-state="closed"
          data-item-title="Tracking: [Hyperlist Web] Timeline events: M1"
          data-item-uuid="d1357579-32c9-4375-a778-9779ca1ce05e"
          data-issue=""
        >
          <a href="https://github.com/github/planning-tracking/issues/1498" target="_blank" rel="noopener noreferrer">
            <span>Tracking: [Hyperlist Web] Timeline events: M1</span>
            <span>#1498</span>
          </a>
        </li>

        <li
          data-repository-name="planning-tracking"
          data-repository-id="197476416"
          data-display-number="1474"
          data-item-id="1398014093"
          data-item-position="900"
          data-item-state="closed"
          data-item-title="Tracking: [Hyperlist Web] Issues list"
          data-item-uuid="c6020812-54b5-4c0d-801c-1c6ba52cb6c9"
          data-issue=""
        >
          <a href="https://github.com/github/planning-tracking/issues/1474" target="_blank" rel="noopener noreferrer">
            <span>Tracking: [Hyperlist Web] Issues list</span>
            <span>#1474</span>
          </a>
        </li>

        <li
          data-repository-name="planning-tracking"
          data-repository-id="197476416"
          data-display-number="1416"
          data-item-id="1361987090"
          data-item-position="1000"
          data-item-state="closed"
          data-item-title="Tracking: [Hyperlist Web] Issue Creation"
          data-item-uuid="a0aee92a-0375-4f3d-b503-b656ec817e0b"
          data-issue=""
        >
          <a href="https://github.com/github/planning-tracking/issues/1416" target="_blank" rel="noopener noreferrer">
            <span>Tracking: [Hyperlist Web] Issue Creation</span>
            <span>#1416</span>
          </a>
        </li>

        <li
          data-repository-name="planning-tracking"
          data-repository-id="197476416"
          data-display-number="1417"
          data-item-id="1361988114"
          data-item-position="1100"
          data-item-state="closed"
          data-item-title="Tracking: [Hyperlist Web] Saved Views"
          data-item-uuid="eb2b580e-5718-4dcf-8b30-535a50b9030f"
          data-issue=""
        >
          <a href="https://github.com/github/planning-tracking/issues/1417" target="_blank" rel="noopener noreferrer">
            <span>Tracking: [Hyperlist Web] Saved Views</span>
            <span>#1417</span>
          </a>
        </li>

        <li
          data-repository-name="planning-tracking"
          data-repository-id="197476416"
          data-display-number="1467"
          data-item-id="1390802130"
          data-item-position="1150"
          data-item-state="closed"
          data-item-title="Tracking: [Hyperlist Web] Shared views"
          data-item-uuid="57c45b04-0ac2-48ef-ac76-842c4267d432"
          data-issue=""
        >
          <a href="https://github.com/github/planning-tracking/issues/1467" target="_blank" rel="noopener noreferrer">
            <span>Tracking: [Hyperlist Web] Shared views</span>
            <span>#1467</span>
          </a>
        </li>

        <li
          data-repository-name="planning-tracking"
          data-repository-id="197476416"
          data-display-number="1574"
          data-item-id="1463424094"
          data-item-position="1175"
          data-item-state="closed"
          data-item-title="Tracking: [Hyperlist] Performance"
          data-item-uuid="b0efee6d-97d6-5346-ac99-fa19b08e0a61"
          data-issue=""
        >
          <a href="https://github.com/github/planning-tracking/issues/1574" target="_blank" rel="noopener noreferrer">
            <span>Tracking: [Hyperlist] Performance</span>
            <span>#1574</span>
          </a>
        </li>

        <li
          data-repository-name="planning-tracking"
          data-repository-id="197476416"
          data-display-number="1542"
          data-item-id="1434292212"
          data-item-position="1200"
          data-item-state="open"
          data-item-title="[Tracking] Hyperlist: Issue Creation with Templates"
          data-item-uuid="71b7758d-888c-4662-b9e5-ea780af3c7c7"
          data-issue=""
        >
          <a href="https://github.com/github/planning-tracking/issues/1542" target="_blank" rel="noopener noreferrer">
            <span>[Tracking] Hyperlist: Issue Creation with Templates</span>
            <span>#1542</span>
          </a>
        </li>

        <li
          data-repository-name="issues"
          data-repository-id="98946937"
          data-display-number="3986"
          data-item-id="1451687348"
          data-item-position="1250"
          data-item-state="closed"
          data-item-title="Tracking: [Hyperlist] Improved filter bar"
          data-item-uuid="55e44ecf-c4af-5441-84fd-1983984d5a16"
          data-issue=""
        >
          <a href="https://github.com/github/issues/issues/3986" target="_blank" rel="noopener noreferrer">
            <span>Tracking: [Hyperlist] Improved filter bar</span>
            <span>#3986</span>
          </a>
        </li>

        <li
          data-repository-name="issues"
          data-repository-id="98946937"
          data-display-number="4179"
          data-item-id="1467791778"
          data-item-position="1300"
          data-item-state="closed"
          data-item-title="[Batch] Private alpha (Shopify + VSCode)"
          data-item-uuid="f0e37c06-7181-50d0-93d0-fad81d2bbce4"
          data-issue=""
        >
          <a href="https://github.com/github/issues/issues/4179" target="_blank" rel="noopener noreferrer">
            <span>[Batch] Private alpha (Shopify + VSCode)</span>
            <span>#4179</span>
          </a>
        </li>

        <li
          data-repository-name="planning-tracking"
          data-repository-id="197476416"
          data-display-number="1632"
          data-item-id="1504559027"
          data-item-position="1400"
          data-item-state="open"
          data-item-title="Tracking: [Hyperlist]&nbsp;Issue Viewer M2"
          data-item-uuid="32d859b8-2686-5065-8f5a-2c0d59c51613"
          data-issue=""
        >
          <a href="https://github.com/github/planning-tracking/issues/1632" target="_blank" rel="noopener noreferrer">
            <span>Tracking: [Hyperlist]&nbsp;Issue Viewer M2</span>
            <span>#1632</span>
          </a>
        </li>
      </ol>
    </div>
  </tracking-block>
`
