# typed: true

class Oauth::AuthorizeView

  # dynamically defined scope reader methods

  sig { returns(T::Boolean) }
  def audit_log_access?; end

  sig { returns(T::Boolean) }
  def audit_log_read_access?; end

  sig { returns(T::Boolean) }
  def biztools_access?; end

  sig { returns(T::Boolean) }
  def codespace_access?; end

  sig { returns(T::Boolean) }
  def codespace_secrets_access?; end

  sig { returns(T::Boolean) }
  def copilot_access?; end

  sig { returns(T::Boolean) }
  def copilot_manage_billing_access?; end

  sig { returns(T::Boolean) }
  def discussion_read_access?; end

  sig { returns(T::Boolean) }
  def discussion_write_access?; end

  sig { returns(T::Boolean) }
  def enterprise_manage_billing_access?; end

  sig { returns(T::Boolean) }
  def enterprise_manage_runners_access?; end

  sig { returns(T::Boolean) }
  def enterprise_admin_access?; end

  sig { returns(T::Boolean) }
  def enterprise_read_access?; end

  sig { returns(T::Boolean) }
  def gist_access?; end

  sig { returns(T::Boolean) }
  def gpg_key_admin_access?; end

  sig { returns(T::Boolean) }
  def gpg_key_read_access?; end

  sig { returns(T::Boolean) }
  def gpg_key_write_access?; end

  sig { returns(T::Boolean) }
  def network_configurations_read_access?; end

  sig { returns(T::Boolean) }
  def network_configurations_write_access?; end

  sig { returns(T::Boolean) }
  def no_repo_access?; end

  sig { returns(T::Boolean) }
  def notifications_access?; end

  sig { returns(T::Boolean) }
  def org_hook_admin_access?; end

  sig { returns(T::Boolean) }
  def org_admin_access?; end

  sig { returns(T::Boolean) }
  def org_read_access?; end

  sig { returns(T::Boolean) }
  def org_write_access?; end

  sig { returns(T::Boolean) }
  def packages_read_access?; end

  sig { returns(T::Boolean) }
  def packages_write_access?; end

  sig { returns(T::Boolean) }
  def pre_receive_hook_admin_access?; end

  sig { returns(T::Boolean) }
  def project_access?; end

  sig { returns(T::Boolean) }
  def project_read_access?; end

  sig { returns(T::Boolean) }
  def public_key_admin_access?; end

  sig { returns(T::Boolean) }
  def public_key_read_access?; end

  sig { returns(T::Boolean) }
  def public_key_write_access?; end

  sig { returns(T::Boolean) }
  def public_repo_access?; end

  sig { returns(T::Boolean) }
  def repo_access?; end

  sig { returns(T::Boolean) }
  def repo_deployment_access?; end

  sig { returns(T::Boolean) }
  def repo_hook_admin_access?; end

  sig { returns(T::Boolean) }
  def repo_hook_read_access?; end

  sig { returns(T::Boolean) }
  def repo_hook_write_access?; end

  sig { returns(T::Boolean) }
  def repo_invite_access?; end

  sig { returns(T::Boolean) }
  def repo_status_access?; end

  sig { returns(T::Boolean) }
  def security_events_access?; end

  sig { returns(T::Boolean) }
  def ssh_signing_key_admin_access?; end

  sig { returns(T::Boolean) }
  def ssh_signing_key_read_access?; end

  sig { returns(T::Boolean) }
  def ssh_signing_key_write_access?; end

  sig { returns(T::Boolean) }
  def user_access?; end

  sig { returns(T::Boolean) }
  def user_email_access?; end

  sig { returns(T::Boolean) }
  def user_follow_access?; end

  sig { returns(T::Boolean) }
  def user_read_access?; end

  sig { returns(T::Boolean) }
  def workflow_access?; end
end
