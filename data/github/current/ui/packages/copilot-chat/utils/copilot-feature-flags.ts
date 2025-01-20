import {isFeatureEnabled} from '@github-ui/feature-flags'

class CopilotFeatureFlags {
  /**
   * Returns a boolean indicating whether the Copilot conversational UX embedding update feature is enabled.
   * @returns {boolean} Whether the feature is enabled.
   */
  public get embedding() {
    return isFeatureEnabled('copilot_conversational_ux_embedding_update')
  }

  public get copyMessage() {
    return isFeatureEnabled('copilot_copy_message')
  }

  public get formatDiff() {
    return isFeatureEnabled('copilot_format_diff')
  }

  public get unstickyReferences() {
    return isFeatureEnabled('copilot_conversational_ux_history_refs')
  }

  public get vulnerabilityAnnotations() {
    return isFeatureEnabled('code_vulnerability_scanning')
  }

  public get implicitContext() {
    return isFeatureEnabled('COPILOT_IMPLICIT_CONTEXT')
  }

  public get issueCreation() {
    return isFeatureEnabled('copilot_issue_creation')
  }

  public get staticThreadSuggestions() {
    return isFeatureEnabled('copilot_chat_static_thread_suggestions')
  }

  public get followUpThreadSuggestions() {
    return isFeatureEnabled('copilot_chat_follow_up_thread_suggestions')
  }

  public get followupToAgent() {
    return isFeatureEnabled('copilot_followup_to_agent')
  }

  public get customInstructions() {
    return isFeatureEnabled('copilot_chat_custom_instructions')
  }

  public get reactMarkdown() {
    return isFeatureEnabled('copilot_react_markdown')
  }

  public get dotcomUserServerTokens() {
    return isFeatureEnabled('copilot_chat_dotcom_user_server_tokens')
  }

  public get copilotFloatingButton() {
    return isFeatureEnabled('copilot_floating_button')
  }
}

export const copilotFeatureFlags = new CopilotFeatureFlags()
export type {CopilotFeatureFlags}
