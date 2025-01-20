import {DatePicker} from '@github-ui/date-picker'
import type {RangeSelection} from '@github-ui/date-picker'
import {SearchIcon} from '@primer/octicons-react'
import {useState, useRef} from 'react'
import {Box, Button, Dialog, Flash, FormControl, Heading, Radio, RadioGroup, Text, TextInput} from '@primer/react'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {formatISO} from 'date-fns'
import type {AuditLogExport} from './AuditLogExport'

export enum ExportType {
  Web = 1,
  Git,
}

export type RadioRange = readonly [string, string, string]

export interface ExportSubmitResponse {
  errors: string[]
  exports: AuditLogExport[]
}

export interface ExportButtonProps {
  exportUrl: string
  exportType: ExportType
  radioRange: RadioRange
  onSubmit: (response: ExportSubmitResponse) => void
}

export function ExportButton({exportUrl, exportType, radioRange, onSubmit}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef(null)
  const [visibleErrorMessage, setVisibleErrorMessage] = useState<string>('')
  const [formatType, setFormatType] = useState('json')
  const [queryPhrase, setPhrase] = useState('')
  const [first, second, third] = radioRange
  const [exportRange, setExportRange] = useState(first)

  const calculateDate = (value: number) => {
    const d = new Date()
    d.setDate(d.getDate() - value)
    return d
  }

  const formatDateQuery = (value: number) => {
    return `created:>${formatISO(calculateDate(value), {representation: 'date'})}`
  }

  const formatDateRangeQuery = (startDate: string, endDate: string) => {
    return `created:${startDate}..${endDate}`
  }

  const [dateQuery, setDateQuery] = useState(formatDateQuery(Number(first)))

  const handleFormatChange = (selectedValue: string | null) => {
    if (selectedValue === null) {
      setFormatType('json')
    } else {
      setFormatType(selectedValue)
    }
  }

  const handleDateQueryChange = (selectedValue: string | null) => {
    if (selectedValue === null) {
      setDateQuery('')
    } else if (selectedValue !== 'custom') {
      setExportRange(selectedValue)
      setDateQuery(formatDateQuery(parseInt(selectedValue)))
    }
  }

  const handleDatePicker = (range: RangeSelection | null) => {
    if (!range) return
    setExportRange('custom')
    const startDate = formatISO(range.from, {representation: 'date'})
    const endDate = formatISO(range.to, {representation: 'date'})
    setDateQuery(formatDateRangeQuery(startDate, endDate))
  }

  const handleClose = () => {
    setVisibleErrorMessage('')
    setIsOpen(false)
  }

  const extractDateRangeFromQuery = (dq: string) => {
    let start
    let end
    const prefix = 'created:'
    if (dq.startsWith(prefix)) {
      dq = dq.substring(prefix.length)
      if (dq.startsWith('>')) {
        start = dq.substring(1).trim()
        end = formatISO(Date.now(), {representation: 'date'})
      } else {
        const r = dq.split('..')
        if (r.length > 1) {
          start = r[0]
          end = r[1]
        }
      }
    }
    return {start, end}
  }

  const handleSubmit = async () => {
    setVisibleErrorMessage('')
    const formData = new FormData()
    if (exportType === ExportType.Git) {
      const {start, end} = extractDateRangeFromQuery(dateQuery)
      if (start && end) {
        formData.append('start', start.toString())
        formData.append('end', end.toString())
      }
    } else {
      const q = queryPhrase === '' ? dateQuery : `${dateQuery} ${queryPhrase}`
      formData.append('q', q)
      formData.append('export_format', formatType)
    }
    const response = await verifiedFetch(exportUrl, {
      method: 'POST',
      body: formData,
      headers: {Accept: 'application/json'},
    })
    const jsonData = await response.json()
    if (jsonData && jsonData.errors.length > 0) {
      setVisibleErrorMessage(jsonData.errors.join(','))
    } else {
      setIsOpen(false)
      onSubmit(jsonData)
    }
    return jsonData
  }

  let dialogTestId = ''
  let buttonTestId = ''
  let buttonTitle = ''
  let dialogTitle = ''
  let dialogSubtitle = ''
  let isWebExport = false
  let dateRangePadding = 0
  switch (exportType) {
    case ExportType.Git:
      buttonTitle = 'Configure Git Export'
      dialogTitle = 'Export Git Activity'
      dialogSubtitle = 'Git activity data is limited to activity from the last 7 days'
      dialogTestId = 'git-export-dialog-button'
      buttonTestId = 'git-export-button'
      dateRangePadding = 3
      break
    case ExportType.Web:
    default:
      buttonTitle = 'Configure App Export'
      dialogTitle = 'Export Application Events'
      dialogSubtitle = 'App events data is limited to activity from the last 180 days'
      isWebExport = true
      dialogTestId = 'web-export-dialog-button'
      buttonTestId = 'web-export-button'
      dateRangePadding = 0
      break
  }

  return (
    <>
      <Button ref={buttonRef} onClick={() => setIsOpen(true)} data-testid={dialogTestId}>
        {buttonTitle}
      </Button>
      <Dialog
        title="Start export"
        onDismiss={handleClose}
        returnFocusRef={returnFocusRef}
        isOpen={isOpen}
        area-labelledby="header"
        sx={{overflow: 'hidden'}}
      >
        <div>
          <Dialog.Header id="header">
            <Box sx={{display: 'flex', flexDirection: 'column'}}>
              <Heading as="h3" sx={{fontSize: 2, fontWeight: 'bold'}}>
                {dialogTitle}
              </Heading>
              <span>{dialogSubtitle}</span>
            </Box>
          </Dialog.Header>
          {isWebExport && (
            <Box sx={{padding: 3}}>
              <FormControl>
                <FormControl.Label>Filter events to export</FormControl.Label>
                <TextInput
                  sx={{width: '100%'}}
                  placeholder="Search the audit logs"
                  leadingVisual={SearchIcon}
                  onChange={e => setPhrase(e.target.value)}
                  data-testid="search-bar"
                />
              </FormControl>
            </Box>
          )}
          <Box
            sx={{
              paddingLeft: 3,
              paddingRight: 3,
              paddingBottom: 3,
              borderBottomWidth: 1,
              borderBottomStyle: 'solid',
              borderBottomColor: 'border.default',
            }}
          >
            {isWebExport && (
              <RadioGroup name="exportFormat" onChange={handleFormatChange} sx={{paddingBottom: 2}}>
                <RadioGroup.Label>Select an export format</RadioGroup.Label>
                <FormControl>
                  <Radio value="json" defaultChecked />
                  <FormControl.Label>JSON</FormControl.Label>
                </FormControl>
                <FormControl>
                  <Radio value="csv" data-testid="csv-radio" />
                  <FormControl.Label>CSV</FormControl.Label>
                </FormControl>
              </RadioGroup>
            )}
            <RadioGroup name="exportRange" onChange={handleDateQueryChange}>
              <RadioGroup.Label sx={{paddingTop: dateRangePadding}}>Select an export range</RadioGroup.Label>
              <FormControl>
                <Radio value={first} checked={exportRange === first} />
                <FormControl.Label>
                  Last {first} day{first === '1' ? '' : 's'}
                </FormControl.Label>
              </FormControl>
              <FormControl>
                <Radio value={second} checked={exportRange === second} data-testid="second-radio" />
                <FormControl.Label>Last {second} days</FormControl.Label>
              </FormControl>
              <FormControl>
                <Radio value={third} checked={exportRange === third} />
                <FormControl.Label>Last {third} days</FormControl.Label>
              </FormControl>
              <FormControl>
                <Radio value="custom" checked={exportRange === 'custom'} />
                <FormControl.Label>
                  <Box sx={{display: 'flex', flexDirection: 'column'}}>
                    <Text sx={{paddingBottom: 1}}>Custom range...</Text>
                    <DatePicker
                      variant="range"
                      maxDate={new Date()}
                      minDate={calculateDate(Number(third))}
                      showTodayButton={true}
                      showClearButton={true}
                      value={null}
                      onChange={range => handleDatePicker(range)}
                    />
                  </Box>
                </FormControl.Label>
              </FormControl>
            </RadioGroup>
          </Box>
          <Box sx={{display: 'flex', justifyContent: 'flex-end', margin: 3}}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="primary" sx={{marginLeft: 2}} onClick={handleSubmit} data-testid={buttonTestId}>
              Start export
            </Button>
          </Box>
          {visibleErrorMessage && (
            <Box sx={{color: 'red', mt: '2px', fontSize: '12px', alignSelf: 'flex-start', alignItems: 'flex-start'}}>
              <Flash variant="danger">{visibleErrorMessage}</Flash>
            </Box>
          )}
        </div>
      </Dialog>
    </>
  )
}
