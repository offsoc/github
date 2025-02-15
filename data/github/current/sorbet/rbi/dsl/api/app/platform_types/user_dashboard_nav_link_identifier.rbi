# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::UserDashboardNavLinkIdentifier`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::UserDashboardNavLinkIdentifier`.

module Api::App::PlatformTypes::UserDashboardNavLinkIdentifier
  sig { returns(T::Boolean) }
  def discussions?; end

  sig { returns(T::Boolean) }
  def issues?; end

  sig { returns(T::Boolean) }
  def organizations?; end

  sig { returns(T::Boolean) }
  def projects?; end

  sig { returns(T::Boolean) }
  def pull_requests?; end

  sig { returns(T::Boolean) }
  def repositories?; end

  sig { returns(T::Boolean) }
  def starred?; end

  DISCUSSIONS = T.let("DISCUSSIONS", String)
  ISSUES = T.let("ISSUES", String)
  ORGANIZATIONS = T.let("ORGANIZATIONS", String)
  PROJECTS = T.let("PROJECTS", String)
  PULL_REQUESTS = T.let("PULL_REQUESTS", String)
  REPOSITORIES = T.let("REPOSITORIES", String)
  STARRED = T.let("STARRED", String)
end
