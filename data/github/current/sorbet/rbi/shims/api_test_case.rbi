# frozen_string_literal: true

module Api
  class TestCase
    class OAuthAuthzMatrix
      # methods defined via actor_accessor
      def authorized_tokens; end
      def authorized_tokens=(*_); end
      def unauthorized_tokens; end
      def unauthorized_tokens=(*_); end
      def authorized_user; end
      def authorized_user=(*_); end
      def unauthorized_user; end
      def unauthorized_user=(*_); end
    end

    class AppsAuthzMatrix
      # methods defined via actor_accessor
      def authorized_tokens; end
      def authorized_tokens=(*_); end
      def unauthorized_tokens; end
      def unauthorized_tokens=(*_); end
      def tokens; end
      def tokens=(*_); end

      def authorized_user; end
      def authorized_user=(*_); end
      def unauthorized_user; end
      def unauthorized_user=(*_); end

      def installation_with_permissions; end
      def installation_with_permissions=(*_); end
      def random_installation; end
      def random_installation=(*_); end
      def authorized_user_via_authorized_integration_with_permissions_oauth_access; end
      def authorized_user_via_authorized_integration_with_permissions_oauth_access=(*_); end
      def authorized_user_via_unauthorized_integration; end
      def authorized_user_via_unauthorized_integration=(*_); end
      def unauthorized_user_via_authorized_integration_with_permissions; end
      def unauthorized_user_via_authorized_integration_with_permissions=(*_); end
      def unauthorized_user_via_unauthorized_integration; end
      def unauthorized_user_via_unauthorized_integration=(*_); end

      def user_programmatic_access_grant_with_permissions; end
      def user_programmatic_access_grant_with_permissions=(*_); end
      def user_programmatic_access_grant_without_permissions; end
      def user_programmatic_access_grant_without_permissions=(*_); end
      def authorized_user_via_user_programmatic_access_without_grant; end
      def authorized_user_via_user_programmatic_access_without_grant=(*_); end
      def unauthorized_user_via_user_programmatic_access_without_grant; end
      def unauthorized_user_via_user_programmatic_access_without_grant=(*_); end

      def scoped_installation_with_permissions; end
      def scoped_installation_with_permissions=(*_); end
      def authorized_user_via_authorized_integration_with_scoped_permissions; end
      def authorized_user_via_authorized_integration_with_scoped_permissions=(*_); end

      # methods defined via actor_writer
      def installation_without_permissions=(*_); end
      def authorized_user_via_authorized_integration_without_permissions_oauth_access=(*_); end
      def unauthorized_user_via_authorized_integration_without_permissions=(*_); end
      def scoped_installation_without_permissions=(*_); end
    end

    class RemoteAuthzMatrix
      # methods defined via actor_accessor
      def authorized_tokens; end
      def authorized_tokens=(*_); end
      def unauthorized_tokens; end
      def unauthorized_tokens=(*_); end
      def tokens; end
      def tokens=(*_); end
    end
  end
end
