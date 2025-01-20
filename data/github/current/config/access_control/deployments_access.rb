# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :list_deployments do |access|
    access.ensure_context :resource
    access.allow(:everyone) { |context| context[:resource].public? }
    access.allow :deployment_lister
  end

  define_access :read_deployment do |access|
    access.ensure_context :resource
    access.allow(:everyone) { |context| context[:resource].public? }
    access.allow :deployment_reader
  end

  define_access :write_deployment do |access|
    access.ensure_context :resource
    access.allow :deployment_writer
  end

  define_access :read_deployment_status do |access|
    access.ensure_context :resource
    access.allow(:everyone) { |context| context[:resource].repository.public? }
    access.allow :deployment_reader
  end

  define_access :write_deployment_status do |access|
    access.ensure_context :resource
    access.allow :deployment_writer
  end

  define_access :delete_deployment do |access|
    access.ensure_context :resource
    access.allow :deployment_writer
  end

  define_access :approve_custom_gate do |access|
    access.ensure_context :resource
    access.allow :deployment_writer
  end
end
