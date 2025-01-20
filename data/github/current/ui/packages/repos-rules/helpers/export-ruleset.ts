import {verifiedFetchJSON} from '@github-ui/verified-fetch'

export async function downloadRuleset(url: string, rulesetName: string) {
  try {
    const fetchedJson = await verifiedFetchJSON(url, {method: 'GET'})
    const json = await fetchedJson.json()
    if (Object.keys(json).length === 0) return
    const jsonString = JSON.stringify(json, null, 2)

    const blob = new Blob([jsonString], {type: 'text/json'})
    const fileName = `${rulesetName}.json`

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav = window.navigator as any
    if (nav.msSaveOrOpenBlob) {
      // Manage IE11+ & Edge
      nav.msSaveOrOpenBlob(blob, fileName)
    } else {
      const downloadLink = document.createElement('a')
      downloadLink.href = URL.createObjectURL(blob)
      downloadLink.download = fileName
      downloadLink.click()
      URL.revokeObjectURL(downloadLink.href)
    }
  } catch {
    throw new Error('Error exporting ruleset')
  }
}
