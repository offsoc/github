// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {Box, Button, Flash, Heading, Dialog, Link, Octicon, Text} from '@primer/react'
import {InfoIcon} from '@primer/octicons-react'
import upperFirst from 'lodash-es/upperFirst'
import {useLocation, useNavigate} from 'react-router-dom'
import {useEffect, useRef, useState} from 'react'
import {useSearchParams} from '@github-ui/use-navigate'
import safeStorage from '@github-ui/safe-storage'

import {ENTERPRISE_OWNER, ENTERPRISE_ORG_OWNER, BILLING_MANAGER} from '../../constants'
import {CostCenterType} from '../../enums/cost-centers'
import {doRequest, HTTPMethod} from '../../hooks/use-request'
import useRoute from '../../hooks/use-route'
import {COST_CENTERS_ROUTE, CREATE_COST_CENTER_ROUTE, UPSERT_COST_CENTER_ROUTE} from '../../routes'
import {pageHeadingStyle, Fonts, Spacing} from '../../utils/style'

import {AzureSubscriptionDetails} from './AzureSubscriptionDetails'
import CostCenterBanner from './CostCenterBanner'
import {CostCenterDetails} from './CostCenterDetails'
import {CostCenterResourceSelector} from './CostCenterResourceSelector'

import type {AdminRole, Customer} from '../../types/common'
import type {
  CostCenter,
  CostCenterPicker,
  Resource,
  Subscription,
  CreateCostCenterRequest,
  UpdateCostCenterRequest,
} from '../../types/cost-centers'

interface CostCenterFormProps {
  action: 'new' | 'edit'
  adminRoles: AdminRole[]
  costCenter: CostCenter
  customer: Customer
  encodedAzureSubscriptionUri: string
  subscriptions: Subscription[]
  isCopilotStandalone: boolean
}

export default function CostCenterForm({
  action,
  adminRoles,
  costCenter,
  customer,
  encodedAzureSubscriptionUri,
  subscriptions,
  isCopilotStandalone,
}: CostCenterFormProps) {
  const {
    costCenterKey: {uuid, targetId: originalTargetId, targetType},
  } = costCenter
  const [params] = useSearchParams()
  const location = useLocation()
  const safeLocalStorage = safeStorage('localStorage')

  const [name, setName] = useState<string>(() => {
    if (params.get('dialog') === 'true') {
      return safeLocalStorage.getItem('costCenterName') || costCenter.name
    }
    return costCenter.name
  })
  const [targetId, setTargetId] = useState<string>(costCenter.costCenterKey.targetId)
  const [resources, setResources] = useState<Resource[]>(() => {
    if (params.get('dialog') === 'true') {
      const storedResources = safeLocalStorage.getItem('costCenterResources')
      return storedResources ? JSON.parse(storedResources) : costCenter.resources
    }
    return costCenter.resources
  })
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const navigate = useNavigate()
  const {path: allCostCentersRoute} = useRoute(COST_CENTERS_ROUTE)
  const {path: createCostCentersPath} = useRoute(CREATE_COST_CENTER_ROUTE)
  const {path: editCostCentersPath} = useRoute(UPSERT_COST_CENTER_ROUTE, {costCenterUUID: uuid})

  const returnFocusRef = useRef(null)

  const resourcesRef = useRef(resources)
  const [initialResources] = useState(() => {
    const storedResources = safeLocalStorage.getItem('costCenterInitialResources')
    return storedResources ? JSON.parse(storedResources) : resourcesRef.current
  })
  const {addToast} = useToastContext()

  const setCostCenterName = (newName: string) => {
    setName(newName)
    safeLocalStorage.setItem('costCenterName', newName)
  }

  const setCostCenterResources = (newResources: Resource[]) => {
    setResources(newResources)
    safeLocalStorage.setItem('costCenterResources', JSON.stringify(newResources))
  }

  const removeFormValuesFromLocalStorage = () => {
    safeLocalStorage.removeItem('costCenterName')
    safeLocalStorage.removeItem('costCenterResources')
    safeLocalStorage.removeItem('costCenterInitialResources')
  }

  useEffect(() => {
    // if we aren't redirected from Azure login, set the initial resources in local storage
    if (params.get('dialog') !== 'true') {
      safeLocalStorage.setItem('costCenterInitialResources', JSON.stringify(costCenter.resources))
    }
    // We only want to run this effect when first loading the page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // cleanup function to remove form values from local storage when we aren't redirected from Azure login
    return () => {
      if (params.get('dialog') !== 'true') {
        removeFormValuesFromLocalStorage()
      }
    }
    // We only want to run this effect when location changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])

  function handleCancel() {
    // we need to clear the local storage values if we added an azure id because the cleanup function won't run
    if (params.get('dialog') === 'true') {
      removeFormValuesFromLocalStorage()
    }
    navigate(allCostCentersRoute)
  }

  const handleSubmit = async (e: React.FormEvent<EventTarget>) => {
    e.preventDefault()
    setIsEditDialogOpen(false)

    if (name === '') {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({
        type: 'error',
        message: 'Unable to save cost center with no name',
        role: 'alert',
      })
      return
    }

    let ok: boolean
    if (action === 'new') {
      ok = await handleCreateCostCenter()
    } else {
      ok = await handleUpdateCostCenter()
    }

    if (ok) {
      // we need to clear the local storage values if we added an azure id because the cleanup function won't run
      if (params.get('dialog') === 'true') {
        removeFormValuesFromLocalStorage()
      }
      navigate(allCostCentersRoute)
    }
  }

  const handleCreateCostCenter = async (): Promise<boolean> => {
    const createRequest: CreateCostCenterRequest = {
      name,
      resources,
      targetId,
    }

    const {ok, data} = await doRequest<CreateCostCenterRequest>(HTTPMethod.POST, createCostCentersPath, createRequest)
    if (!ok) {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({
        type: 'error',
        message: data.error ?? 'There was an issue creating your cost center',
        role: 'alert',
      })
    } else {
      if (resources.length === 0) {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'success',
          message: 'Successfully created cost center. Please add some resources via the API to start tracking costs.',
          role: 'status',
        })
      }
    }

    return ok
  }

  const handleUpdateCostCenter = async (): Promise<boolean> => {
    // Resources to add: in `resources` but not in `initialResources`
    const resourcesToAdd = resources.filter(
      r => !initialResources.some((ir: Resource) => r.id === ir.id && r.type === ir.type),
    )
    // Resources to remove: in `initialResources` but not in `resources`
    const resourcesToRemove = initialResources.filter(
      (r: Resource) => !resources.some(ir => r.id === ir.id && r.type === ir.type),
    )

    const updateRequest: UpdateCostCenterRequest = {
      name,
      originalTargetId,
      resourcesToAdd,
      resourcesToRemove,
      targetId,
    }

    const {ok, data} = await doRequest<UpdateCostCenterRequest>(HTTPMethod.PUT, editCostCentersPath, updateRequest)
    if (!ok) {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({
        type: 'error',
        message: data.error,
        role: 'alert',
      })
    } else {
      if (resources.length === 0) {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'success',
          message: 'Successfully updated cost center. Please add some resources via the API to start tracking costs.',
          role: 'status',
        })
      }
    }

    return ok
  }

  const disablePicker: CostCenterPicker[] = []
  // Push both org and repo to disablePicker if non-GHE Enterprise
  if (isCopilotStandalone) {
    disablePicker.push('org', 'repo')
  } else {
    if (!adminRoles.includes(ENTERPRISE_OWNER) && !adminRoles.includes(BILLING_MANAGER)) {
      disablePicker.push('org')
    }

    if (
      !adminRoles.includes(ENTERPRISE_ORG_OWNER) &&
      (adminRoles.includes(ENTERPRISE_OWNER) || adminRoles.includes(BILLING_MANAGER))
    ) {
      disablePicker.push('repo')
    }
  }

  const membersStyle = {
    mb: Spacing.CardMargin,
    p: 3,
  }

  return (
    <>
      <header className="Subhead">
        <Heading as="h2" className="Subhead-heading" sx={pageHeadingStyle}>
          <Link href={allCostCentersRoute}>Cost centers</Link>
          <span aria-hidden="true">&nbsp;/&nbsp;</span>
          {upperFirst(action)} cost center
        </Heading>
      </header>

      <CostCenterBanner />

      <Box sx={{maxWidth: '70ch'}}>
        <form onSubmit={handleSubmit}>
          <CostCenterDetails name={name} setCostCenterName={setCostCenterName} />
          {targetType === CostCenterType.AzureSubscription && (
            <AzureSubscriptionDetails
              subscriptions={subscriptions}
              targetId={targetId}
              encodedAzureSubscriptionUri={encodedAzureSubscriptionUri}
              setAzureTargetId={setTargetId}
            />
          )}
          <CostCenterResourceSelector
            customer={customer}
            resources={resources}
            setCostCenterResources={setCostCenterResources}
            disablePicker={disablePicker}
          />
          <Box className="Box" data-testid="members-wrapper" sx={membersStyle}>
            <Heading as="h4" sx={{mb: Spacing.StandardPadding, fontSize: Fonts.CardHeadingFontSize}}>
              Members
            </Heading>

            <Flash>
              <Octicon aria-label="Alert icon" icon={InfoIcon} />
              You can add users to a cost center{' '}
              <Link
                href="https://docs.github.com/en/enterprise-cloud@latest/rest/enterprise-admin/billing?apiVersion=2022-11-28#add-users-to-a-cost-center"
                target="_blank"
                inline
                sx={{color: 'fg.default'}}
              >
                using the API
              </Link>
              .
            </Flash>
          </Box>
          <Box sx={{display: 'flex'}}>
            {action === 'new' && (
              <Button type="submit" variant="primary">
                Create cost center
              </Button>
            )}
            {action === 'edit' && (
              <Button variant="primary" onClick={() => setIsEditDialogOpen(true)}>
                Save changes
              </Button>
            )}
            <Button sx={{ml: 2}} onClick={() => handleCancel()}>
              Cancel
            </Button>
          </Box>
          {isEditDialogOpen && (
            <Dialog
              aria-labelledby="delete-cost-center-header"
              data-testid="delete-cost-center-dialog"
              isOpen={isEditDialogOpen}
              onDismiss={() => setIsEditDialogOpen(false)}
              returnFocusRef={returnFocusRef}
              sx={{width: 320}}
            >
              <Dialog.Header sx={{border: 0, bg: 'transparent'}}>Confirm editing cost center</Dialog.Header>
              <Box sx={{px: 3}}>
                <Text as="p" sx={{mb: 2}}>
                  <strong>Are you sure you want to save changes made to this cost center?</strong>
                </Text>
              </Box>
              {/* TODO: Use Dialog.Footer
            As of 2024-01-25 Dialog.Footer is not yet implemented in Primer React
          */}
              <Box sx={{display: 'flex', justifyContent: 'flex-end', p: 3}}>
                <Button
                  onClick={() => {
                    setIsEditDialogOpen(false)
                  }}
                  sx={{mr: 2}}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="danger">
                  Confirm
                </Button>
              </Box>
            </Dialog>
          )}
        </form>
      </Box>
    </>
  )
}
