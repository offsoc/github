# typed: true
# frozen_string_literal: true

require "notifyd/client"
require "notifyd/proto"
require "active_support/core_ext/string"

module Tapioca
  module Compilers
    # NotifydClient creates type definitions for all the dynamically created
    # client types on `Notifyd::Client`.
    #
    # It does so by looking for al the subclasses of `Twirp::Client` and then,
    # for each one of them, adding a method with the right name and return
    # type.
    #
    # See: https://github.com/Shopify/tapioca#writing-custom-dsl-compilers
    class NotifydClient < Tapioca::Dsl::Compiler
      extend T::Sig

      # This declares the type of the `constant` in `root.create_path` and
      # allows for type checking it.
      #
      # This is how a generic looks in sorbet.
      ConstantType = type_member { { fixed: T.class_of(::Notifyd::Client) } }

      # gather_constants list the constants that need to be decorated.
      sig { override.returns(T::Enumerable[T.class_of(::Notifyd::Client)]) }
      def self.gather_constants
        [::Notifyd::Client]
      end

      # decorate applies the dynamic type definitions to the `Notifyd::Client`
      # class.
      sig { override.void }
      def decorate
        # We ignore any twirp client that isn't on our namespace.
        clients = ::Twirp::Client.subclasses
          .select { |klass| klass.name&.start_with?("Notifyd::Proto") }

        root.create_path(constant) do |klass|
          clients.each do |client|
            # This makes a cleanup of the full namespaced name for a client
            # into what we use as the method name.
            name = client.to_s.demodulize.underscore.gsub("_client", "")

            # For each one of the method names we create a method that returns
            # the type of client we wanted.
            if name != "twirp"
              klass.create_method(name, return_type: client.to_s)
            end
          end
        end
      end
    end
  end
end
