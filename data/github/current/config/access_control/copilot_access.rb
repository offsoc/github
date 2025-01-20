# typed: strict
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :generate_copilot_token do |access|
    access.ensure_context :resource
    access.allow :copilot_user
  end

  define_access :copilot_notification do |access|
    access.ensure_context :resource
    access.allow :copilot_user
  end

  define_access :copilot_repository_check do |access|
    access.ensure_context :resource
    access.allow :copilot_user
  end

  define_access :copilot_user_status do |access|
    access.ensure_context :resource
    access.allow :copilot_user
  end

  define_access :copilot_org_seat_management_writer do |access|
    access.ensure_context :resource
    access.allow :copilot_org_admin_writer
  end

  define_access :copilot_org_seat_management_reader do |access|
    access.ensure_context :resource
    access.allow :copilot_org_admin_reader
  end

  define_access :copilot_enterprise_seat_management_reader do |access|
    access.ensure_context :resource
    access.allow :copilot_enterprise_admin_reader
  end

  define_access :copilot_org_usage_metrics do |access|
    access.ensure_context :resource
    access.allow :copilot_org_usage_metrics_reader
  end

  define_access :copilot_enterprise_usage_metrics do |access|
    access.ensure_context :resource
    access.allow :copilot_enterprise_admin_reader
  end

  define_access :copilot_content_exclusion do |access|
    access.ensure_context :resource
    access.allow :copilot_user
  end
end
