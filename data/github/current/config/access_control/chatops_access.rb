# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :modify_reminder_workspace do |access|
    access.ensure_context :resource, :member
    access.allow :org_reminder_workspace_modifier
  end

  define_access :reader_reminder_workspace do |access|
    access.ensure_context :resource, :member
    access.allow :org_reminder_workspace_reader
  end

  define_access :access_org_reminders do |access|
    access.ensure_context :resource, :member
    access.allow :org_reminders_access
  end

  define_access :access_reminders_cross_org do |access|
    access.allow :authenticated_user
  end

  define_access :access_team_reminders do |access|
    access.ensure_context :resource, :team, :member
    access.allow :team_reminders_access
  end
end
