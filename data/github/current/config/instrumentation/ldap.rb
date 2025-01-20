# frozen_string_literal: true

## ATTENTION! Before making changes to this instrumentation
#
# This file contains diagnostic logs for LDAP Sync Jobs in GHES
#
# The message and attributes are critical for Supportocats to troubleshoot LDAP issues.
#
# Any changes made to the logs _must_ be reviewed by the Enterprise Support team as well as
# accompanied by a PR to the GitHub Enterprise documentation on The Hub:
#
# https://thehub.github.com/support/access/ldap/GHES-LDAP-overview/
#
#
# Related issues:
#
# https://github.com/github/external-identities/issues/218
# https://github.com/github/external-identities/issues/4291

if GitHub.enterprise? && GitHub.auth.ldap?
  def debug_logging
    return unless GitHub::LDAP.debug_logging_enabled?
    yield if block_given?
  end

  GitHub.subscribe "bind.net_ldap" do |*args|
    debug_logging do
      event = ActiveSupport::Notifications::Event.new(*args)
      GitHub.stats.timing("ldap.bind", event.duration)
      GitHub::Authentication::LDAP.logger.info(
        "Bind result",
        "ldap.transaction_id" => event.transaction_id,
        "code.namespace" => "Net::LDAP",
        "code.function" => "bind",
        "ldap.bind.result" => event.payload[:result],
        "ldap.bind.duration" => event.duration)
    end
  end

  GitHub.subscribe "bind.net_ldap_connection" do |*args|
    debug_logging do
      event = ActiveSupport::Notifications::Event.new(*args)
      GitHub.stats.timing("ldap.bind", event.duration)
      GitHub::Authentication::LDAP.logger.info(
        "Bind result",
        "ldap.transaction_id" => event.transaction_id,
        "code.namespace" => "Net::LDAP::Connection",
        "code.function" => "bind",
        "ldap.bind.result" => event.payload[:result].result,
        "ldap.bind.duration" => event.duration)
    end
  end

  GitHub.subscribe "search.net_ldap" do |*args|
    debug_logging do
      event = ActiveSupport::Notifications::Event.new(*args)

      if event.payload[:result].nil?
        GitHub.stats.timing("ldap.search", event.duration)
        GitHub::Authentication::LDAP.logger.error("Search failed",
          "ldap.transaction_id" => event.transaction_id,
          "code.namespace" => "Net::LDAP",
          "code.function" => "search",
          "ldap.search.duration" => event.duration)
      else
        # log server capabilities
        if (event.payload[:attributes] || []).include?(:namingContexts)
          result = event.payload[:result].first
          capabilities = [
            :namingContexts,          result[:namingcontexts],
            :supportedControl,        result[:supportedcontrol],
            :supportedExtension,      result[:supportedextension],
            :supportedFeatures,       result[:supportedfeatures],
            :supportedLdapVersion,    result[:supportedldapversion],
            :supportedsaslmechanisms, result[:supportedsaslmechanisms]
          ]
          GitHub::Authentication::LDAP.logger.info(
            "Search Root DSE",
            "ldap.transaction_id" => event.transaction_id,
            "code.namespace" => "Net::LDAP",
            "code.function" => "search",
            "ldap.search.capabilities" => capabilities)
        else
          GitHub.stats.timing("ldap.search", event.duration)
          GitHub::Authentication::LDAP.logger.info("Search result",
            "ldap.transaction_id" => event.transaction_id,
            "code.namespace" => "Net::LDAP",
            "code.function" => "search",
            "ldap.search.filter" => event.payload[:filter],
            "ldap.search.attributes" => event.payload[:attributes])
        end
      end
    end
  end

  GitHub.subscribe "search.net_ldap_connection" do |*args|
    debug_logging do
      event = ActiveSupport::Notifications::Event.new(*args)
      GitHub::Authentication::LDAP.logger.with_named_tags("ldap.transaction_id" => event.transaction_id, "code.namespace" => "Net::LDAP::Connection", "code.function" => "search") do
        if event.payload[:result].present? && event.payload[:result].failure?
          result = event.payload[:result]
          GitHub::Authentication::LDAP.logger.error("Search failed",
            "ldap.search.result.code" => result.result_code,
            "exception.message" => result.error_message,
            "ldap.search.matched_dn" => result.result[:matchedDN])
        end

        # ignore rootDSE query
        next if (event.payload[:attributes] || []).include?(:namingContexts.to_s.to_ber)
        GitHub.stats.timing("ldap.search", event.duration)
        GitHub::Authentication::LDAP.logger.info("Search",
          "ldap.search.filter" => event.payload[:filter],
          "ldap.search_attributes" => event.payload[:attributes],
          "ldap.search.result.count" => event.payload[:result_count],
          "ldap.search.page.count" => event.payload[:page_count],
          "ldap.search.limit" => event.payload[:limit],
          "ldap.search.base" => event.payload[:base],
          "ldap.search.duration" => event.duration)
      end

      # ignore rootDSE query
      next if (event.payload[:attributes] || []).include?(:namingContexts.to_s.to_ber)
      GitHub.stats.timing("ldap.search", event.duration)
      GitHub::Authentication::LDAP.logger.info("Search",
        "ldap.transaction_id" => event.transaction_id,
        "code.namespace" => "Net::LDAP::Connection",
        "code.function" => "search",
        "ldap.search.filter" => event.payload[:filter],
        "ldap.search.attributes" => event.payload[:attributes],
        "ldap.search.result.count" => event.payload[:result_count],
        "ldap.search.page.count" => event.payload[:page_count],
        "ldap.search.limit" => event.payload[:limit],
        "ldap.search.base" => event.payload[:base],
        "ldap.search.scope" => event.payload[:scope],
        "ldap.search.duration" => event.duration)
    end
  end

  ##### LDAP Sync
  # New user sync on first login
  GitHub.subscribe "ldap_new_member_sync.perform" do |*args|
    event = ActiveSupport::Notifications::Event.new(*args)
    GitHub.stats.increment("ldap.sync.new_members.total")
    GitHub.stats.timing("ldap.sync.new_members.runtime", event.duration)
    GitHub::Authentication::LDAPSync.logger.info("New user sync",
      "ldap.sync.new_members.runtime" => event.duration
    )
  end

  GitHub.subscribe "team_sync.member_search" do |*args|
    event = ActiveSupport::Notifications::Event.new(*args)
    GitHub.stats.increment("ldap.sync.team_member_search.total")
    GitHub.stats.timing("ldap.sync.team_member_search.runtime", event.duration)
    GitHub::Authentication::LDAPSync.logger.info("Team member search",
      "ldap.sync.team_member_search.result.count" => event.payload[:result_count],
      "ldap.sync.team_member_search.runtime" => event.duration
    )
  end

  # Single team sync error
  GitHub.subscribe "ldap_sync_error" do |*args|
    event = ActiveSupport::Notifications::Event.new(*args)
    GitHub.stats.timing("ldap.team_sync_error", event.duration)
    GitHub::Authentication::LDAPSync.logger.tagged("ldap.dn" => event.payload[:dn], "ldap.team_sync_error.runtime" => event.duration) do
      if event.payload[:error].is_a?(Exception)
        GitHub::Authentication::LDAPSync.logger.error("Team sync error", exception: event.payload[:error])
      else
        GitHub::Authentication::LDAPSync.logger.error("Team sync error", "exception.message" => event.payload[:error])
      end
    end
  end

  # Team sync
  GitHub.subscribe "ldap_team_sync.perform" do |*args|
    event = ActiveSupport::Notifications::Event.new(*args)
    GitHub.stats.increment("ldap.sync.teams.total")
    GitHub.stats.timing("ldap.sync.teams.runtime", event.duration)
    GitHub::Authentication::LDAPSync.logger.info("Bulk team sync",
      "ldap.sync.teams.total" => event.payload[:count],
      "ldap.sync.teams.runtime" => event.duration
    )
  end

  # User sync
  GitHub.subscribe "user.ldap_sync" do |*args|
    event = ActiveSupport::Notifications::Event.new(*args)
    GitHub.stats.increment("ldap.sync.user.total")
    GitHub.stats.timing("ldap.sync.user.runtime", event.duration)
    GitHub::Authentication::LDAPSync.logger.info("User sync", event.payload.merge("ldap.sync.user.runtime" => event.duration))
  end

  GitHub.subscribe "ldap_user_sync.perform" do |*args|
    event = ActiveSupport::Notifications::Event.new(*args)
    GitHub.stats.increment("ldap.sync.users.total")
    GitHub.stats.timing("ldap.sync.users.runtime", event.duration)
    GitHub::Authentication::LDAPSync.logger.info("Bulk user sync",
      "ldap.sync.users.runtime" => event.duration
    )
  end

  GitHub.subscribe "ldap.authenticate" do |*args|
    event = ActiveSupport::Notifications::Event.new(*args)
    if event.payload[:user]
      GitHub.stats.timing("ldap.authenticate.success.runtime", event.duration)
    else
      GitHub.stats.timing("ldap.authenticate.failure.runtime", event.duration)
    end
  end

  # Single team sync
  GitHub.subscribe "team.ldap_sync" do |*args|
    event = ActiveSupport::Notifications::Event.new(*args)
    GitHub.stats.increment("ldap.sync.team.total")
    GitHub.stats.timing("ldap.sync.team.runtime", event.duration)
    GitHub::Authentication::LDAPSync.logger.info("Team sync", event.payload.merge("ldap.sync.teams.runtime" => event.duration))
  end

  GitHub.subscribe "ldap.authenticate.timeout" do
    GitHub.stats.increment("ldap.authenticate.timeout.total")
  end
end
