# frozen_string_literal: true

require_relative "base"

module GitHubChatopsExtensions
  module Checks
    module Includable
      module Entitlements
        def require_ldap_entitlement(path, username: nil)
          banner = ".#{self.class.chatops_namespace} #{params[:action]}"
          checker = GitHubChatopsExtensions::Checks::Entitlements.new(params, banner, logger)
          begin
            checker.require_ldap_entitlement(path, username:)
          rescue GitHubChatopsExtensions::Errors::NotEntitledError => exc
            jsonrpc_response(result: exc.message)
          end
        end

        def member_of_entitlement?(path, username: nil)
          banner = ".#{self.class.chatops_namespace} #{params[:action]}"
          checker = GitHubChatopsExtensions::Checks::Entitlements.new(params, banner, logger)
          checker.member_of_entitlement?(path, username:)
        end
      end
    end

    class Entitlements < Base
      PEOPLE_OU = "ou=People,dc=github,dc=net"
      ENTITLEMENTS_OU = "ou=Entitlements,ou=Groups,dc=github,dc=net"
      ENTITLEMENTS_BASEDIR = "ldap"

      def require_ldap_entitlement(path, username: nil)
        paths = [path].flatten.compact

        # No paths? Something isn't right.
        if paths.empty?
          raise GitHubChatopsExtensions::HandledError, "No valid paths given to `require_ldap_entitlement`! This is a setup error in the application. Please contact the owner of the application for assistance."
        end

        # Are they in any entitlement? They're good.
        return true if paths.any? { |check_path| member_of_entitlement?(check_path, username:) }

        # If we get here the person is not authorized. Point them toward the correct entitlement.
        # Note, this assumes .txt extension, but if the entitlement is a YAML or RB and the extension is
        # passed as part of the path, it'll be recognized here.
        message = if paths.size == 1
                    message_one_entitlement(paths.first, username:)
        else
          message_multi_entitlement(paths, username:)
        end
        raise GitHubChatopsExtensions::Errors::NotEntitledError, message.join("\n\n")
      end

      def member_of_entitlement?(path, username: nil)
        group_dn = dn_from_entitlement(path)
        target_dn_to_check = target_dn(username)

        attrs = %w[uniquemember memberuid member]
        ldap = GitHubChatopsExtensions::Service::LDAP.new
        ldap.search(base: group_dn, attrs:, scope: Net::LDAP::SearchScope_BaseObject) do |entry|
          attrs.select { |member_attr| entry[member_attr].is_a?(Array) }.each do |member_attr|
            return true if entry[member_attr].any? { |member_dn| member_dn.downcase == target_dn_to_check }
          end
        end

        false
      end

      private

      def header
        "@#{user}: `#{banner}` entitlements check failed:"
      end

      def message_one_entitlement(path, username: nil)
        github_path = github_path_for_entitlement(path)
        group_dn = dn_from_entitlement(path)
        username ||= user
        [
          header,
          "`@#{username}` must be a member of `#{group_dn}` to run this command.",
          "Please make a pull request against [`#{path}` in entitlements](#{github_path}) if you believe you should have access."
        ]
      end

      def message_multi_entitlement(paths, username: nil)
        acceptable_entitlements = paths.map { |path| "`#{path}`" }.join(", ")
        repo = "[entitlements](https://github.com/github/entitlements)"
        username ||= user
        [
          header,
          "`@#{username}` must be a member of one of these entitlements to run this command: #{acceptable_entitlements}",
          "Please make a pull request against one of these in #{repo} if you believe you should have access."
        ]
      end

      def dn_from_entitlement(path)
        path_parts = path.split("/").compact.reverse
        first_part = path_parts.shift
        ["cn=#{first_part}", path_parts.map { |part| "ou=#{part}" }, ENTITLEMENTS_OU].flatten.join(",")
      end

      def github_path_for_entitlement(path)
        file_basename = File.basename(path)
        filename = file_basename =~ /\.(txt|yaml|rb)\z/ ? file_basename : [file_basename, "txt"].join(".")
        File.join("https://github.com/github/entitlements/blob/master", ENTITLEMENTS_BASEDIR, File.dirname(path), filename)
      end

      def target_dn(username = nil)
        username ||= user
        "uid=#{username},#{PEOPLE_OU}".downcase
      end
    end
  end
end
