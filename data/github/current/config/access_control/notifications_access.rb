# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :list_repo_notifications,
                :update_repo_notifications,
                :get_thread,
                :mark_thread_as_read,
                :mark_thread_as_done,
                :mark_thread_as_unread,
                :get_thread_subscription,
                :subscribe_to_thread,
                :unsubscribe_from_thread,
                :get_repo_subscription,
                :subscribe_to_repo,
                :unsubscribe_from_repo do |access|
    access.ensure_context :resource
    access.allow :notification_reader
  end

  define_access :v4_update_repo_notifications do |access|
    access.allow :v4_repo_notification_writer
  end

  define_access :v4_update_thread_notifications do |access|
    access.allow :v4_thread_notification_writer
  end

  define_access :v4_get_thread do |access|
    access.ensure_context :resource
    access.allow :v4_user_notification_reader
  end

  define_access :notification_dashboard do |access|
    access.ensure_context :user
    access.allow :notification_dashboard_reader
  end

  define_access :read_user_notification_settings do |access|
    access.ensure_context :resource
    access.allow :user_notification_settings_reader
  end

  define_access :update_user_notification_settings do |access|
    access.ensure_context :resource
    access.allow :user_notification_settings_writer
  end

  define_access :mark_notification,
                :mark_notification_subject_as_read,
                :create_custom_inbox,
                :update_custom_inbox,
                :delete_custom_inbox do |access|
    access.ensure_context :resource
    access.allow :v4_user_notification_writer
  end

  define_access :show_notification_filter do |access|
    access.ensure_context :resource
    access.allow :notification_filter_reader
  end

  define_access :show_notification_list_with_thread_count do |access|
    access.ensure_context :resource
    access.allow :notification_list_with_thread_count_reader
  end

  define_access :show_notification_thread do |access|
    access.ensure_context :resource
    access.allow :notification_thread_reader
  end
end
