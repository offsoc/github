# frozen_string_literal: true

require_relative "github_chatops_extensions/checks/entitlements"
require_relative "github_chatops_extensions/checks/fido"
require_relative "github_chatops_extensions/checks/room"
require_relative "github_chatops_extensions/command/arguments"
require_relative "github_chatops_extensions/command/base_command"
require_relative "github_chatops_extensions/command/help_builder"
require_relative "github_chatops_extensions/helpers/chatterbox"
require_relative "github_chatops_extensions/helpers/output"
require_relative "github_chatops_extensions/helpers/statsd"
require_relative "github_chatops_extensions/service/ldap"
require_relative "github_chatops_extensions/util/validation"

require "failbot"
require "shellwords"

module GitHubChatopsExtensions
  class CommandError < StandardError; end
  class ExitError < StandardError; end
  class HandledError < StandardError; end

  class Errors
    class FidoFailure < GitHubChatopsExtensions::HandledError; end
    class FidoSetupFailure < GitHubChatopsExtensions::HandledError; end
    class FidoUnauthorized < GitHubChatopsExtensions::CommandError; end
    class LDAPConnectionError < GitHubChatopsExtensions::HandledError; end
    class LDAPWTFError < GitHubChatopsExtensions::HandledError; end
    class MissingArgumentError < GitHubChatopsExtensions::HandledError; end
    class NotEntitledError < GitHubChatopsExtensions::CommandError; end
    class RoomRestrictionError < GitHubChatopsExtensions::CommandError; end
  end
end
