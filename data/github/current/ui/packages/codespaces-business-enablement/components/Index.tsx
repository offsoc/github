import {
  Button,
  Box,
  Dialog,
  Text,
  Octicon,
  Flash,
  Pagination,
  TextInput,
  Radio,
  RadioGroup,
  FormControl,
} from '@primer/react'
import {AlertIcon, SearchIcon} from '@primer/octicons-react'
import {useRef, useState, useCallback} from 'react'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {OrgSelect} from './OrgSelect'
import {debounce} from '@github/mini-throttle'
import type {CodespacesBusinessEnablementProps, PolicyInput} from '../types'

export function Index({
  policy_input_list,
  submit_url,
  initalOrganizations,
  search_url,
  initialPageCount,
  disable_form,
}: CodespacesBusinessEnablementProps) {
  const returnFocusRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedEnablement, setSelectedEnablement] = useState<PolicyInput>(
    policy_input_list.find(p => p.checked) as PolicyInput,
  )
  const [flashMessage, setFlashMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [orgsToUpdate, setOrgsToUpdate] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageCount, setPageCount] = useState(initialPageCount)
  const [organizations, setOrganizations] = useState()
  const [query, setQuery] = useState('')

  const handleSubmit = async () => {
    const postForm = new FormData()

    postForm.append('enablement', selectedEnablement.value)

    if (selectedEnablement.value === 'selected_entities') {
      postForm.append('orgs_to_update', JSON.stringify(orgsToUpdate))
    }

    try {
      const response = await verifiedFetch(submit_url, {
        method: 'PUT',
        body: postForm,
        headers: {
          Accept: 'application/json',
        },
      })
      if (response.ok) {
        setIsOpen(false)
        const data = await response.json()
        setFlashMessage(data.message)
        setErrorMessage('') // clear error
        return response
      } else {
        return new Error('Failed to update')
      }
    } catch (error) {
      return error
    }
  }

  const handleEnablementClick = (policy_input: PolicyInput) => {
    setFlashMessage('') // clear flash
    setErrorMessage('') // clear error
    setSelectedEnablement(policy_input)
  }

  const errorHandler = () => {
    setFlashMessage('') // clear flash
    setErrorMessage('Something went wrong. Please try again.')
  }

  const onPageChange = async (evt: React.MouseEvent, page: number) => {
    evt.preventDefault()
    await fetchOrganizationsFromServer(query, page)
  }

  const fetchOrganizationsFromServer = async (queryString: string, page = 1) => {
    try {
      const result = await verifiedFetch(`${search_url}?page=${page}&query=${queryString}`, {
        headers: {
          Accept: 'application/json',
        },
      })

      if (result.ok) {
        const data = await result.json()

        setCurrentPage(page)
        setPageCount(data.pageCount)
        setOrganizations(data.orgs)
      } else {
        errorHandler()
      }
    } catch (e) {
      errorHandler()
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceFetchOrganiztionsFromServer = useCallback(
    debounce(async (value: string) => {
      setQuery(value)
      await fetchOrganizationsFromServer(value)
    }, 200),
    [setQuery, fetchOrganizationsFromServer],
  )

  return (
    <div data-testid="codespaces-settings-index">
      {flashMessage && <Flash>{flashMessage}</Flash>}
      {errorMessage && <Flash variant={'danger'}>{errorMessage}</Flash>}
      <h3 className="text-normal pb-2 mt-6">Manage organization access to GitHub Codespaces</h3>
      <p>Assign which organizations will have access to GitHub Codespaces inside your enterprise.</p>
      <div className="py-3">
        <form>
          <RadioGroup aria-labelledby="enablementChoice" name="choiceGroup">
            {policy_input_list.map((policy_input: PolicyInput) => (
              <FormControl key={policy_input.value} disabled={policy_input.disabled}>
                <Radio
                  name={policy_input.name}
                  value={policy_input.value}
                  defaultChecked={policy_input.checked}
                  onClick={() => handleEnablementClick(policy_input)}
                  data-testid={`codespaces-settings-${policy_input.value}`}
                />
                <FormControl.Label>
                  {policy_input.text}
                  <p className="note">{policy_input.description}</p>
                </FormControl.Label>
              </FormControl>
            ))}
          </RadioGroup>
        </form>
      </div>
      <Button sx={{mb: 3}} ref={returnFocusRef} onClick={() => setIsOpen(true)}>
        Save
      </Button>
      <Dialog
        isOpen={isOpen}
        returnFocusRef={returnFocusRef}
        onDismiss={() => setIsOpen(false)}
        aria-labelledby="update-codespaces-settings"
      >
        <Dialog.Header id="update-codespaces-settings">Update GitHub Codespaces settings?</Dialog.Header>
        <Box sx={{p: 3}}>
          <Text id="label" sx={{fontFamily: 'sans-serif'}}>
            <Octicon icon={AlertIcon} sx={{mr: 2, color: 'danger.fg'}} />
            {selectedEnablement.confirm_message}
          </Text>
          <Box sx={{display: 'flex', mt: 3, justifyContent: 'flex-end'}}>
            <Button sx={{mr: 1}} onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleSubmit}>
              Submit
            </Button>
          </Box>
        </Box>
      </Dialog>
      {selectedEnablement.value === 'selected_entities' && (
        <div className="mt-2 mb-2">
          <OrgSelect
            organizations={organizations || initalOrganizations}
            orgsToUpdate={orgsToUpdate}
            setOrgsToUpdate={setOrgsToUpdate}
            disableForm={disable_form}
          >
            <TextInput
              className="formControl input-block mb-3"
              leadingVisual={SearchIcon}
              placeholder="Find an organization…"
              aria-label="Find a organization"
              data-testid="query-text-input"
              onChange={e => debounceFetchOrganiztionsFromServer(e.target.value)}
            />
          </OrgSelect>
          <Pagination pageCount={pageCount} currentPage={currentPage} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  )
}
