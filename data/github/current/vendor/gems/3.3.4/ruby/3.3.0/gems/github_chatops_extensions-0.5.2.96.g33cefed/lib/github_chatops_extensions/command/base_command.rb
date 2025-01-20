# frozen_string_literal: true

module GitHubChatopsExtensions
  module Command
    class BaseCommand
      def self.run(argv:, namespace:, params: {}, response:, logger:)
        arguments = GitHubChatopsExtensions::Command::Arguments.new(argv:, params:, spec:)
        cmd = new(arguments, namespace, params, response, logger)
        cmd.run
      end

      def initialize(args, namespace, params, response, logger)
        @args = args
        @params = params
        @response = response
        @logger = logger

        # params is something like:
        # <ActionController::Parameters {"mention_slug"=>"bob", "params"=><ActionController::Parameters {"raw_arguments"=>"tom"} permitted: false>,
        # "room_id"=>"123", "user"=>"bob", "chatop"=>"status_other", "controller"=>"vpn", "action"=>"status_other", "raw_arguments"=>"tom"} permitted: false>
        @user = params["user"]
        @room_id = params["room_id"]
        @jsonrpc_params = params["params"] || {}
        @command = namespace
      end

      def command
        # :nocov:
        @command
        # :nocov:
      end

      def self.spec
        {}
      end

      def self.regex
        Regexp.new("(?<command>#{subcommand})(?:\\s+(?<raw_arguments>.+))?")
      end

      def self.subcommand
        self.to_s.split("::").last.downcase
      end

      def subcommand
        # :nocov:
        self.class.subcommand
        # :nocov:
      end

      def self.banner; end

      def self.base_help; end

      # slug is used internally by chatops controller and should be declared as
      # "<command name> - <some brief header message>" to register with the handler.
      # Returns nil so the message is not registered with the handler if no header
      # details are given. (This should not be used within commands, so there is no
      # corresponding instance method of this defined.)
      def self.slug
        header ? "#{subcommand} - #{header}" : nil
      end

      # header is for a one-liner about how to use the command or what it does in
      # general. This is shown in summary displays that often include multiple commands.
      def self.header; end

      def header
        # :nocov:
        self.class.header
        # :nocov:
      end

      # help is for a more detailed explanation. A longer wall of text is appropriate.
      def self.help; end

      def help
        # :nocov:
        self.class.help
        # :nocov:
      end

      def validate; end

      def execute; end

      def run
        statsd.increment("run.increment")
        statsd.time("run.time") do
          validate
          require_in_room(self.class._require_in_room) if self.class._require_in_room
          require_entitlement(self.class._require_entitlement, username: self.class._require_entitlement_username) if self.class._require_entitlement
          require_fido_2fa if self.class._require_fido_2fa?
          response = execute

          statsd.increment("run.success.increment")
          response
        end
      rescue StandardError => e
        statsd.increment("run.failure.increment")
        raise e
      end

      private

      attr_reader :args, :jsonrpc_params, :logger, :params, :response, :user, :room_id

      def banner
        self.class.banner || ".#{command} #{subcommand}"
      end

      # -------------------------------------------------------------------------------------
      # Prevents a command from being registered twice.
      # -------------------------------------------------------------------------------------

      # :nocov:
      def self.registerable?
        self.to_s.split("::").last.downcase != "base"
      end

      def self.registered?
        @registered || false
      end

      def self.set_registered
        @registered = true
      end

      def self.reset!
        @registered = nil
      end
      # :nocov:

      # -------------------------------------------------------------------------------------
      # Reflecting some methods from helper classes for convenience.
      # -------------------------------------------------------------------------------------

      def say_in_direct_message(message, user: nil)
        user ||= params[:user]
        GitHubChatopsExtensions::Helpers::Chatterbox.say_in_direct_message(user:, message:)
      end

      def say_out_of_band(message, user: params["user"], room_id: params["room_id"], mention: nil)
        GitHubChatopsExtensions::Helpers::Chatterbox.say_out_of_band(
          user:, room_id:, message:, mention:
        )
      end

      def statsd
        @statsd ||= GitHubChatopsExtensions::Helpers::Statsd.new(command, subcommand, user, room_id).client
      end

      # -------------------------------------------------------------------------------------
      # Helper methods to invoke FIDO 2FA. This will only actually call FIDO once (per
      # command) even if it's called multiple times, to avoid annoyance.
      # -------------------------------------------------------------------------------------

      # Called from within an instantiated instance.
      def require_fido_2fa(banner_in = nil)
        #@require_fido_2fa ||= begin
        require_fido_2fa = begin
          banner_in ||= banner
          fido_check = GitHubChatopsExtensions::Checks::Fido.new(params, banner_in, logger)

          fido_check.check_2fa # Raises if 2FA fails
          true
        end
      end

      # Class method for FIDO 2FA, to allow "require_fido_2fa" to be declared in a class.
      def self.require_fido_2fa
        @require_fido_2fa = true
      end

      # Allow methods within the instance non-hacky access to the class variable.
      def self._require_fido_2fa?
        @require_fido_2fa || false
      end

      # -------------------------------------------------------------------------------------
      # Helper methods to verify that a user is a member of the named entitlement.
      # -------------------------------------------------------------------------------------

      # Called from within an instantiated instance.
      def require_entitlement(entitlement, banner_in: nil, username: nil)
        banner_in ||= banner
        e_check = GitHubChatopsExtensions::Checks::Entitlements.new(params, banner_in, logger)
        e_check.require_ldap_entitlement(entitlement, username:) # Raises if not entitled
        true
      end

      def member_of_entitlement?(entitlement, banner_in: nil, username: nil)
        banner_in ||= banner
        e_check = GitHubChatopsExtensions::Checks::Entitlements.new(params, banner_in, logger)
        e_check.member_of_entitlement?(entitlement, username:)
      end

      # Class method to allow "require_entitlement" to be declared in a class.
      def self.require_entitlement(entitlement, username: nil)
        @require_entitlement = entitlement
        @require_entitlement_username = username
      end

      # Allow methods within the instance non-hacky access to the class variable.
      def self._require_entitlement
        @require_entitlement || nil
      end

      def self._require_entitlement_username
        @require_entitlement_username || nil
      end

      # -------------------------------------------------------------------------------------
      # Helper methods to verify that a command is run in an acceptable room.
      # -------------------------------------------------------------------------------------

      # Called from within an instantiated instance.
      def require_in_room(room_id_or_list = nil, banner_in = banner)
        @require_in_room ||= begin
          room_check = GitHubChatopsExtensions::Checks::Room.new(params, banner_in, logger)
          room_check.require_in_room(room_id_or_list) # Raises if not permitted
          true
        end
      end

      # Class method to allow "require_in_room" to be declared in a class.
      def self.require_in_room(room_id_or_list = :any)
        @require_in_room = room_id_or_list
      end

      # Allow methods within the instance non-hacky access to the class variable.
      def self._require_in_room
        @require_in_room || nil
      end
    end
  end
end
