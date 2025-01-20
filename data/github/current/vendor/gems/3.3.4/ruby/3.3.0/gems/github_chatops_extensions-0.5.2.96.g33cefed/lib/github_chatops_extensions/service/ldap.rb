# frozen_string_literal: true

# GitHubChatopsExtensions::Service::LDAP
#
# This class provides a thin wrapper around the ruby net-ldap gem.
# https://rubygems.org/gems/net-ldap/versions/0.16.0
# http://github.com/ruby-ldap/ruby-net-ldap
#
# Note that the following environment variables are expected:
# - ENTITLEMENTS_LDAP_BINDDN or LDAP_BINDDN: Should be the distinguished name of a read-only "scout account"
# - ENTITLEMENTS_LDAP_BINDPW or LDAP_BINDPW: The password for the scout account named by LDAP_BINDDN
# - ENTITLEMENTS_LDAP_URI or LDAP_URI: How to connect to LDAP (e.g. ldaps://some-host-name.example.net)
#
# In addition this class uses the hard-coded CA certificate in `data/ca.crt` because at the
# time of this writing, this CA certificate is not populated correctly into kube containers.

# frozen_string_literal: true

require "net/ldap"
require "uri"

module GitHubChatopsExtensions
  module Service
    class LDAP
      SSL_CA_FILE = File.expand_path("../../../data/ca.crt", __dir__)

      def initialize(uri: ldap_uri, bind_dn: ldap_binddn, bind_pw: ldap_bindpw)
        final_uri = URI(uri)

        ldap_options = {
          host: final_uri.host,
          port: final_uri.port,
          auth: {
            method: :simple,
            username: bind_dn,
            password: bind_pw
          },
          encryption: {
            method: :simple_tls,
            tls_options: {
              ca_file: SSL_CA_FILE,
              verify_mode: OpenSSL::SSL::VERIFY_PEER
            }
          }
        }

        @ldap = Net::LDAP.new(ldap_options)
        raise GitHubChatopsExtensions::Errors::LDAPWTFError, "FATAL: can't create LDAP connection object" if @ldap.nil?

        @ldap.bind
        operation_result = @ldap.get_operation_result
        if operation_result["code"] != 0
          raise GitHubChatopsExtensions::Errors::LDAPConnectionError, "FATAL: can't bind to LDAP: #{operation_result['message']}"
        end
      end

      def method_missing(m, *args, &block)
        @ldap.send(m, *args, &block)
      end

      private

      def ldap_binddn
        ENV["ENTITLEMENTS_LDAP_BINDDN"] || ENV.fetch("LDAP_BINDDN")
      end

      def ldap_bindpw
        ENV["ENTITLEMENTS_LDAP_BINDPW"] || ENV.fetch("LDAP_BINDPW")
      end

      def ldap_uri
        ENV["ENTITLEMENTS_LDAP_URI"] || ENV.fetch("LDAP_URI")
      end
    end
  end
end
