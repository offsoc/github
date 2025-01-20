# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :import_api_create_repo do |access|
    access.ensure_context :resource
    access.allow(:org_repo_creator) { |context| context[:resource].organization? }
    access.allow(:repo_creator) { |context| context[:resource].user? }
  end
end
