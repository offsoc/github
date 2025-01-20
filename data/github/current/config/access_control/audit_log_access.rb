# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :read_org_audit_log_via_api do |access|
    access.allow :org_admin
    access.allow :v4_organization_administration_reader
    access.allow :org_audit_log_reader
  end

  define_access :get_audit_log_stream_key do |access|
    access.ensure_context :resource
    access.allow :audit_log_stream_config_writer
  end

  define_access :list_audit_log_streams do |access|
    access.ensure_context :resource
    access.allow :audit_log_stream_config_writer
  end

  define_access :delete_audit_log_stream do |access|
    access.ensure_context :resource
    access.allow :audit_log_stream_config_writer
  end

  define_access :edit_audit_log_stream do |access|
    access.ensure_context :resource
    access.allow :audit_log_stream_config_writer
  end

  define_access :create_audit_log_stream do |access|
    access.ensure_context :resource
    access.allow :audit_log_stream_config_writer
  end
end
