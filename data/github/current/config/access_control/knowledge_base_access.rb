# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl

  # The resource is ignored, check for a current user
  define_access :list_current_user_accessible_knowledge_bases do |access|
    access.ensure_context :user
    access.allow :knowledge_base_lister
  end

  # The resource is the knowledge base owner.
  # If the owner is an organization, any user who is a member of the org
  # can view a knowledge base the org owns
  # If the owner is the user, the user can view their knowledge base
  define_access :get_knowledge_base do |access|
    access.ensure_context :resource
    access.allow(:org_knowledge_base_viewer) { |context| context[:resource].try(:organization?) }
    access.allow(:user_self_reader) { |context| context[:resource].try(:user?) }
  end

  # The resource is the organization, any user who can
  # administer the org can administer a knowledge base the org owns
  define_access :administer_knowledge_base do |access|
    access.ensure_context :resource
    access.allow(:knowledge_base_admin) { |context| context[:resource].try(:organization?) }
    access.allow(:user_self_reader) { |context| context[:resource].try(:user?) }
  end
end
