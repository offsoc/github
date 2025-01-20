export function UnifiedDiffTable(props: React.PropsWithChildren<{lineWidth: string}>) {
  return (
    <>
      <thead className="sr-only">
        <tr>
          <th scope="col">Original file line number</th>
          <th scope="col">Diff line number</th>
          <th scope="col">Diff line change</th>
        </tr>
      </thead>
      <colgroup>
        <col width={props.lineWidth} />
        <col width={props.lineWidth} />
        <col width="100%" />
      </colgroup>
      <tbody>{props.children}</tbody>
    </>
  )
}
