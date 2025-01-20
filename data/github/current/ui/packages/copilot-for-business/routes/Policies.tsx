import {clsx} from 'clsx'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {ShieldLockIcon} from '@primer/octicons-react'
import {Box, Label, Link, Text, FormControl, Checkbox} from '@primer/react'
import {useCallback, useDebugValue, useMemo, useState} from 'react'
import {ActionMenuButton, type ActionMenuButtonOption} from '../traditional/components/ActionMenuButton'
import {BoxSection, PageHeading, SubtleHeading} from '../traditional/components/Ui'
import type {CopilotForBusinessPoliciesPayload, MenuItem} from '../types'
import styles from './Policies.module.css'
import {seatManagementEndpoint} from '../traditional/helpers/api-endpoints'
import {useCreateMutator} from '../hooks/use-fetchers'
import {isFeatureEnabled} from '@github-ui/feature-flags'

function PreviewFeatureHeading(props: {title: React.ReactNode; beta: boolean}) {
  return (
    <SubtleHeading>
      <span>{props.title}</span>
      {props.beta && (
        <Label variant="success" sx={{marginLeft: 2}}>
          Beta
        </Label>
      )}
    </SubtleHeading>
  )
}

function FeaturesForDataRetention({copilot_for_dotcom_visible}: {copilot_for_dotcom_visible: boolean | null}) {
  const features = []
  features.push('Copilot in the CLI')
  if (copilot_for_dotcom_visible) features.push('Copilot in github.com')
  features.push('Copilot Chat in GitHub Mobile')
  let message = ''
  if (features.length === 1) {
    message = `Enabling ${features[0]} will collect additional data and updated`
  } else if (features.length === 2) {
    message = `Enabling ${features[0]} and ${features[1]} will collect additional data and updated`
  } else if (features.length === 3) {
    message = `Enabling ${features[0]}, ${features[1]} and ${features[2]} will collect additional data and updated`
  }

  return (
    <>
      {message && (
        <>
          {message}{' '}
          <Link
            href="https://github.com/customer-terms/github-copilot-product-specific-terms"
            className="Link--inTextBlock"
            inline
          >
            Product Terms
          </Link>{' '}
          apply.{' '}
        </>
      )}
    </>
  )
}

export default function PoliciesPage() {
  const copilot_for_dotcom_visible = useUIAspectFromRoute('copilot_for_dotcom').visible
  const copilot_bing_visible = useUIAspectFromRoute('bing_github_chat').visible
  const show_copilot_extensions_policy = useFeatureFlag('copilot_extension_access')
  const show_copilot_telemetry_policy = useFeatureFlag('copilot_private_telemetry_access')
  const showCopilotMetricsPolicy = useFeatureFlag('copilot_usage_metrics_policy')
  const payload = useRoutePayload<CopilotForBusinessPoliciesPayload>()
  const {enterprise_name, enterprise_slug, copilot_plan: plan, docsUrls} = payload

  return (
    <>
      <PageHeading name="GitHub Copilot policies" />
      <div className={clsx(styles.topBox, 'mb-3')}>
        <span className={clsx(styles.muted, 'mb-3')}>
          You can manage policies and grant access to Copilot features for all members with access. <br />
          Note that users from other organizations may gain access if permitted by their administrators.
        </span>
        {enterprise_name && enterprise_slug && (
          <span className={clsx(styles.muted, 'mr-2', 'mb-3')} data-testid="cfb-managed-organization-enterprise">
            <ShieldLockIcon /> Managed by{' '}
            <Link inline href={`/enterprises/${enterprise_slug}`}>
              {enterprise_name}
            </Link>
          </span>
        )}
      </div>
      <Box
        data-hpc
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--stack-gap-normal)',
        }}
      >
        <BoxSection>
          {copilot_for_dotcom_visible && <CopilotForDotcomPolicy />}
          <EditorChatPolicy />
          <MobileChatPolicy />
          <CopilotCLIPolicy />
          {show_copilot_extensions_policy && <CopilotExtensionsPolicy />}
          <SnippyPolicy />
          {copilot_bing_visible && <BingGitHubChatPolicy />}
          {show_copilot_telemetry_policy && <CopilotTelemetryPolicy />}
          {showCopilotMetricsPolicy && <CopilotUsageMetricsPolicy />}
        </BoxSection>
        <Text as="p" sx={{color: 'fg.muted'}} data-testid="cb-policies-footnotes">
          {' '}
          {plan !== 'enterprise' && (
            <FeaturesForDataRetention copilot_for_dotcom_visible={copilot_for_dotcom_visible} />
          )}
          If beta features are enabled, you agree to{' '}
          <Link href="https://docs.github.com/site-policy/github-terms/github-copilot-pre-release-license-terms" inline>
            pre-release terms
          </Link>
          . For more information about the data your organization receives regarding your use of GitHub Copilot, please
          review{' '}
          <Link href={docsUrls.generalPrivacyStatement} inline>
            GitHub&apos;s Privacy Statement
          </Link>
          .
        </Text>
      </Box>
    </>
  )
}

function CopilotForDotcomPolicy() {
  const show_beta_features_policy = isFeatureEnabled('COPILOT_BETA_FEATURES_OPT_IN')
  const data = useUIAspectFromRoute('copilot_for_dotcom')

  const {onSelect, options, selected, loading} = useOptions({
    items: data.options,
    controls: data.manages,
  })

  const disabled = !data.configurable

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', width: '100%'}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
        <div data-testid="cfb-policies-dotcom-bundle-feature">
          <PreviewFeatureHeading title="Copilot in github.com" beta={false} />
          <>
            <div>
              If enabled, members of this organization can use{' '}
              <Link
                href="https://docs.github.com/copilot/github-copilot-enterprise/copilot-chat-in-github/about-github-copilot-chat"
                inline
              >
                Copilot Chat in github.com
              </Link>
              ,
            </div>
            <div>
              <Link
                href="https://docs.github.com/copilot/github-copilot-enterprise/copilot-pull-request-summaries/about-copilot-pull-request-summaries"
                inline
              >
                Copilot for pull requests
              </Link>
              ,{' '}
              <Link
                href="https://docs.github.com/enterprise-cloud@latest/copilot/github-copilot-enterprise/copilot-docset-management/about-copilot-docset-management"
                inline
              >
                knowledge base search
              </Link>
              .
            </div>
          </>
          {selected?.value === 'enabled' && <UserFeedbackPolicy />}
          {selected?.value === 'enabled' && show_beta_features_policy && <BetaFeaturesPolicy />}
        </div>
        <div className={clsx(styles.shieldWidth, 'mt-2')}>
          {disabled ? (
            <span data-testid="cfb-policies-dotcom-feature-locked">
              <ShieldLockIcon /> {selected?.title ?? 'Disabled'}
            </span>
          ) : (
            <ActionMenuButton
              title={selected?.title ?? 'Disabled'}
              options={options}
              onSelect={onSelect}
              disabled={disabled}
              loading={loading}
              data-testid="cfb-policies-dotcom-bundle-feature-button"
            />
          )}
        </div>
      </Box>
    </Box>
  )
}

function BingGitHubChatPolicy() {
  const data = useUIAspectFromRoute('bing_github_chat')

  const {onSelect, options, selected, loading} = useOptions({
    items: data.options,
    controls: data.manages,
  })

  const disabled = !data.configurable
  if (!data.visible) return null

  return (
    <>
      <div data-testid="cfb-policies-bing-feature">
        <PreviewFeatureHeading title="Copilot access to Bing" beta={false} />
        {disabled ? (
          <>
            Learn more about using{' '}
            <Link
              href="https://docs.github.com/enterprise-cloud@latest/copilot/github-copilot-enterprise/copilot-chat-in-github/using-github-copilot-chat-in-githubcom"
              inline
            >
              Bing for GitHub Copilot in github.com Copilot Chat in github.com
            </Link>{' '}
            to improve responses.
          </>
        ) : (
          <>
            <>
              If enabled, Copilot in github.com and GitHub Mobile can answer questions about new trends and give
              improved answers.{' '}
            </>
            <Link href="https://privacy.microsoft.com/en-us/privacystatement" target="_blank" rel="noreferrer" inline>
              See Microsoft Privacy Statement
            </Link>
            .
          </>
        )}
      </div>
      {disabled ? (
        <span data-testid="cfb-policies-bing-feature-locked">
          <ShieldLockIcon /> {selected?.title ?? 'Disabled'}
        </span>
      ) : (
        <ActionMenuButton
          title={selected?.title ?? 'Disabled'}
          options={options}
          onSelect={onSelect}
          disabled={disabled}
          loading={loading}
          data-testid="cfb-policies-bing-feature-button"
        />
      )}
    </>
  )
}

function UserFeedbackPolicy() {
  const org = useEnsureOrgName()
  const data = useUIAspectFromRoute('copilot_user_feedback_opt_in')

  const {addToast} = useToastContext()
  const useCopilotSettingsMutation = useCreateMutator(seatManagementEndpoint, {org})
  const [updateOption, loading] = useCopilotSettingsMutation<Record<string, string>, {success: boolean}>({
    resource: 'policies',
    method: 'PUT',
  })

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const isFeedbackEnabled = event.target.checked
      updateOption({
        payload: {[data.manages]: isFeedbackEnabled ? 'enabled' : 'disabled'},
        onError(e) {
          let message = 'Something went wrong. Please try again later.'
          if (e && typeof e === 'object' && 'message' in e) message = String(e.message)

          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({message, role: 'alert', type: 'error'})
        },
        onComplete(res) {
          if (res && res.success) {
            // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
            addToast({
              message: `User feedback is now ${isFeedbackEnabled ? 'enabled' : 'disabled'}`,
              role: 'alert',
              type: 'success',
            })
          }
        },
      })
    },
    [updateOption, addToast, data.manages],
  )

  const disabled = !data.configurable
  if (!data.visible) return null

  return (
    <Box as="form" sx={{mt: 2, pl: 3}}>
      <FormControl disabled={disabled || loading}>
        <Checkbox onChange={onChange} defaultChecked={data.enabled} data-testid="cfb-policies-feedback-checkbox" />
        <FormControl.Label sx={{display: 'flex', alignItems: 'center', mb: 2}}>
          Opt in to user feedback collection
        </FormControl.Label>
        <FormControl.Caption>
          <p>
            Enables user feedback collection on Copilot features in github.com. This feedback may include sensitive
            information such as pull request summaries.
          </p>
        </FormControl.Caption>
      </FormControl>
    </Box>
  )
}

function CopilotCLIPolicy() {
  const data = useUIAspectFromRoute('cli')

  const {onSelect, options, selected, loading} = useOptions({
    items: data.options,
    controls: data.manages,
  })

  const disabled = !data.configurable

  return (
    <>
      <div data-testid="cfb-policies-cli-feature">
        <PreviewFeatureHeading title="Copilot in the CLI" beta={false} />
        <>
          If enabled, members of this organization will get{' '}
          <Link href="https://docs.github.com/copilot/github-copilot-in-the-cli/using-github-copilot-in-the-cli" inline>
            GitHub Copilot assistance in terminal
          </Link>
          .
        </>
      </div>
      {disabled ? (
        <span data-testid="cfb-policies-cli-feature-locked">
          <ShieldLockIcon /> {selected?.title ?? 'Disabled'}
        </span>
      ) : (
        <ActionMenuButton
          title={selected?.title ?? 'Disabled'}
          options={options}
          onSelect={onSelect}
          disabled={disabled}
          loading={loading}
          data-testid="cfb-policies-cli-feature-button"
        />
      )}
    </>
  )
}

function EditorChatPolicy() {
  const data = useUIAspectFromRoute('editor_chat')

  const {onSelect, options, selected, loading} = useOptions({
    items: data.options,
    controls: data.manages,
  })

  const disabled = !data.configurable

  return (
    <>
      <div data-testid="cfb-policies-editor-chat-feature">
        <SubtleHeading>
          <span>Copilot Chat in the IDE</span>
        </SubtleHeading>
        <>
          If enabled, members of this organization will have access to{' '}
          <Link href="https://docs.github.com/copilot/github-copilot-chat/using-github-copilot-chat-in-your-ide" inline>
            Copilot Chat in the IDE
          </Link>
          .
        </>
      </div>
      {disabled ? (
        <span data-testid="cfb-policies-editor-chat-feature-locked">
          <ShieldLockIcon /> {selected?.title ?? 'Disabled'}
        </span>
      ) : (
        <ActionMenuButton
          title={selected?.title ?? 'Unknown'}
          options={options}
          onSelect={onSelect}
          disabled={disabled}
          loading={loading}
          data-testid="cfb-policies-editor-chat-feature-button"
        />
      )}
    </>
  )
}

function MobileChatPolicy() {
  const data = useUIAspectFromRoute('mobile_chat')

  const {onSelect, options, selected, loading} = useOptions({
    items: data.options,
    controls: data.manages,
  })

  const disabled = !data.configurable

  return (
    <>
      <div data-testid="cfb-policies-mobile-chat-feature">
        <PreviewFeatureHeading title="Copilot Chat in GitHub Mobile" beta={false} />
        <>
          If enabled, members of this organization will have access to{' '}
          <Link href="https://github.co/copilot-chat-mobile-docs" inline>
            Copilot Chat in GitHub Mobile
          </Link>
          .
        </>
      </div>
      {disabled ? (
        <span data-testid="cfb-policies-mobile-feature-locked">
          <ShieldLockIcon /> {selected?.title ?? 'Disabled'}
        </span>
      ) : (
        <ActionMenuButton
          title={selected?.title ?? 'Unknown'}
          options={options}
          onSelect={onSelect}
          disabled={disabled}
          loading={loading}
          data-testid="cfb-policies-mobile-chat-feature-button"
        />
      )}
    </>
  )
}

function SnippyPolicy() {
  const data = useUIAspectFromRoute('snippy')

  const {onSelect, options, selected, loading} = useOptions({
    items: data.options,
    controls: data.manages,
    defaultOption: {
      value: 'NA',
      id: 'unconfigured',
      title: 'Unconfigured',
    },
  })

  const disabled = !data.configurable

  return (
    <>
      <div data-testid="cfb-policies-snippy-feature">
        <SubtleHeading>Suggestions matching public code (duplication detection filter)</SubtleHeading>
        Copilot can allow or block suggestions matching public code.
      </div>
      {disabled ? (
        <span>
          <ShieldLockIcon /> {selected?.title ?? 'Disabled'}
        </span>
      ) : (
        <ActionMenuButton
          title={selected?.title ?? 'Unknown'}
          options={options}
          onSelect={onSelect}
          disabled={disabled}
          loading={loading}
        />
      )}
    </>
  )
}

function CopilotExtensionsPolicy() {
  const data = useUIAspectFromRoute('copilot_extensions')

  const {onSelect, options, selected, loading} = useOptions({
    items: data.options,
    controls: data.manages,
  })

  const disabled = !data.configurable

  return (
    <>
      <div data-testid="cfb-policies-copilot-extensions-feature">
        <PreviewFeatureHeading title="Copilot Extensions" beta />
        If enabled, members of this organization can use Copilot extensions in the chat.
      </div>
      {disabled ? (
        <span>
          <ShieldLockIcon /> {selected?.title ?? 'Disabled'}
        </span>
      ) : (
        <ActionMenuButton
          title={selected?.title ?? 'Disabled'}
          options={options}
          onSelect={onSelect}
          disabled={disabled}
          loading={loading}
          data-testid="cfb-policies-copilot_extensions-feature-button"
        />
      )}
    </>
  )
}

function CopilotTelemetryPolicy() {
  const data = useUIAspectFromRoute('private_telemetry')

  const {onSelect, options, selected, loading} = useOptions({
    items: data.options,
    controls: data.manages,
  })

  // Always enable this until we support managing Copilot Custom Models from
  // enterprises.
  const disabled = false // !data.configurable

  return (
    <>
      <div data-testid="cfb-policies-copilot-org-private-telemetry-feature">
        <PreviewFeatureHeading title="Telemetry data collection" beta />
        Copilot will securely collect data from developers&apos; prompts and returned suggestions for custom model
        training.
      </div>
      {disabled ? (
        <span>
          <ShieldLockIcon /> {selected?.title ?? 'Disabled'}
        </span>
      ) : (
        <ActionMenuButton
          title={selected?.title ?? 'Disabled'}
          options={options}
          onSelect={onSelect}
          disabled={disabled}
          loading={loading}
          data-testid="cfb-policies-copilot-org-private-telemetry-feature-button"
        />
      )}
    </>
  )
}

function BetaFeaturesPolicy() {
  const org = useEnsureOrgName()
  const data = useUIAspectFromRoute('copilot_beta_features_opt_in')

  const {addToast} = useToastContext()
  const useCopilotSettingsMutation = useCreateMutator(seatManagementEndpoint, {org})
  const [updateOption, loading] = useCopilotSettingsMutation<Record<string, string>, {success: boolean}>({
    resource: 'policies',
    method: 'PUT',
  })

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const isBetaFeatureEnabled = event.target.checked
      updateOption({
        payload: {[data.manages]: isBetaFeatureEnabled ? 'enabled' : 'disabled'},
        onError(e) {
          let message = 'Something went wrong. Please try again later.'
          if (e && typeof e === 'object' && 'message' in e) message = String(e.message)

          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({message, role: 'alert', type: 'error'})
        },
        onComplete(res) {
          if (res && res.success) {
            // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
            addToast({
              message: `Preview features are now ${isBetaFeatureEnabled ? 'enabled' : 'disabled'}`,
              role: 'alert',
              type: 'success',
            })
          }
        },
      })
    },
    [updateOption, addToast, data.manages],
  )

  const disabled = !data.configurable
  if (!data.visible) return null

  return (
    <Box as="form" sx={{mt: 2, pl: 3}}>
      <FormControl disabled={disabled || loading}>
        <Checkbox onChange={onChange} defaultChecked={data.enabled} data-testid="cfb-policies-beta-features-checkbox" />
        <FormControl.Label sx={{display: 'flex', alignItems: 'center', mb: 2}}>
          Opt in to preview features
        </FormControl.Label>
        <FormControl.Caption>
          <p>
            If enabled, members of this organization can use previews of{' '}
            <Link
              href="https://docs.github.com/en/enterprise-cloud@latest/copilot/managing-copilot/managing-copilot-for-your-enterprise/managing-policies-and-features-for-copilot-in-your-enterprise#copilot-in-githubcom"
              inline
            >
              {'new Copilot in github.com features'}
            </Link>
            . Use is subject to{' '}
            <Link
              href="https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features#previews"
              inline
            >
              {"GitHub's preview terms"}
            </Link>
            .
          </p>
        </FormControl.Caption>
      </FormControl>
    </Box>
  )
}

function CopilotUsageMetricsPolicy() {
  const data = useUIAspectFromRoute('copilot_usage_metrics_policy')
  const {onSelect, options, selected, loading} = useOptions({
    items: data.options,
    controls: data.manages,
  })

  const disabled = !data.configurable

  if (!data.visible) {
    return null
  }

  return (
    <>
      <div data-testid="cfb-policies-copilot-usage-metrics-feature">
        <PreviewFeatureHeading title="Usage Metrics API Access" beta />
        If enabled, organization administrations can use the Copilot Metrics API to query org member&#39;s usage
        statistics.
      </div>
      {disabled ? (
        <span data-testid="cfb-policies-copilot-usage-metrics-feature-locked">
          <ShieldLockIcon /> {selected?.title ?? 'Disabled'}
        </span>
      ) : (
        <ActionMenuButton
          title={selected?.title ?? 'Disabled'}
          options={options}
          onSelect={onSelect}
          disabled={disabled}
          loading={loading}
          data-testid="cfb-policies-copilot-usage-metrics-control"
        />
      )}
    </>
  )
}

// --

function useOptions(config: {items: MenuItem[]; controls: string; defaultOption?: ActionMenuButtonOption}) {
  const org = useEnsureOrgName()
  const {addToast} = useToastContext()

  // options
  const [options, setOptions] = useState<ActionMenuButtonOption[]>(config.items)

  const normalizedOptions = useMemo(() => {
    return options.map(item => ({
      ...item,
      testId: `cfb-policy-option-${item.title}`,
    }))
  }, [options])

  // derrived selected
  const selected = useMemo(() => {
    return options.find(option => option.selected) ?? config.defaultOption
  }, [options, config.defaultOption])

  // mutations
  const useCopilotSettingsMutation = useCreateMutator(seatManagementEndpoint, {org})
  const [updateOption, loading] = useCopilotSettingsMutation<Record<string, string>, {success: boolean}>({
    resource: 'policies',
    method: 'PUT',
  })

  const onSelect = useCallback(
    async (item: ActionMenuButtonOption) => {
      updateOption({
        payload: {
          [config.controls]: item.value as string,
        },
        onError(e) {
          let message = 'Something went wrong. Please try again later.'
          if (e && typeof e === 'object' && 'message' in e) message = String(e.message)

          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            message,
            role: 'alert',
            type: 'error',
          })
        },
        onComplete(data) {
          if (data && data.success) {
            setOptions(prev => {
              return prev.map(option => {
                option.selected = option.id === item.id
                return option
              })
            })
          }
        },
      })
    },
    [config.controls, updateOption, addToast],
  )

  return {
    loading,
    ///
    selected,
    onSelect,
    ///
    options: normalizedOptions,
  }
}

/**
 * Ensures an org name is present. The source of this may change in the future, but allows callsites to remain unaware.
 */
function useEnsureOrgName() {
  const org_name = useRoutePayload<CopilotForBusinessPoliciesPayload>().org_name
  useDebugValue(org_name)
  return org_name
}
/**
 * Lets pick a certain `aspect` from the payload. An aspect is an isolated piece of data from the route payload.
 * Allowing us to seperate the concerns, so we can iterate on them independently, and confidently.
 */
function useUIAspectFromRoute<T extends keyof CopilotForBusinessPoliciesPayload>(
  aspect: T,
): CopilotForBusinessPoliciesPayload[T] {
  return useRoutePayload<CopilotForBusinessPoliciesPayload>()[aspect]
}
