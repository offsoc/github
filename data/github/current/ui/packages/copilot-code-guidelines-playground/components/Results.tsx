export default function Results() {
  // TODO: Refactor the component to use the `results` prop and pass in real data
  const results = [
    {
      lineNumber: 1,
      details: 'Officia ut aliqua irure duis dolore occaecat mollit aliqua sit nisi deserunt exercitation.',
    },
    {
      lineNumber: 2,
      details:
        'Mollit ipsum duis dolore. Culpa aliqua eu cillum fugiat eu irure reprehenderit reprehenderit consectetur adipisicing reprehenderit commodo proident ut.',
    },
    {
      lineNumber: 3,
      details: 'Minim occaecat cillum qui laboris mollit non magna deserunt est laborum nisi irure ut.',
    },
  ]

  return (
    <div>
      <h4 className="sr-only">Results</h4>
      {results.map((result, index) => (
        <div key={index}>
          <h5 className="text-normal fgColor-muted">
            Line <span className="text-bold fgColor-default">{result.lineNumber}</span>
          </h5>
          <p>{result.details}</p>
        </div>
      ))}
    </div>
  )
}
