# typed: true
# frozen_string_literal: true

require "notifyd/proto"
require "tapioca/dsl/compilers/protobuf"

module Tapioca
  module Compilers
    # NotifydTwirpClients creates RBI definitions for each one of our twirp
    # clients so that their return types are correct. Otherwise we would be
    # relying on `tapioca gem` which treats them as `T.untyped`.
    #
    # See: https://github.com/Shopify/tapioca#writing-custom-dsl-compilers
    class NotifydTwirpClients < Tapioca::Dsl::Compiler
      extend T::Sig

      # This declares the type of the `constant` in `root.create_path` and
      # allows for type checking it.
      #
      # This is how a generic looks in sorbet.
      ConstantType = type_member { { fixed: T.class_of(::Twirp::Client) } }


      # gather_constants list the constants that need to be decorated.
      sig { override.returns(T::Enumerable[T.class_of(::Twirp::Client)]) }
      def self.gather_constants
        # Collect all the Twirp clients on the notifyd namespace
        ::Twirp::Client.subclasses
          .select { |klass| klass.name&.start_with?("Notifyd::Proto") }
      end

      sig { override.void }
      def decorate
        root.create_path(constant) do |klass|
          # For each one of the RPC calls on a client, we create method that has:
          #
          # - A return type of `Twirp::ClientResp[MethodRespType]`. For
          #   example, for the `devicetokens.get` it would be
          #   `Twirp::ClientResp[GetResponse]`
          #
          #   That way, when we call the `#data` method on the response, it has
          #   the right type, in this case `GetResponse`
          # - An argument of the correct `Request` type. In the previous
          #   example it would be `GetRequest.`
          #
          # See the proto definition for the device tokens service for more
          # context in this example.
          #
          # The RPC related methods come from the protobuf definitions
          # themselves as they already have really good reflection mechanisms.
          constant.rpcs.each do |rpc_name, rpc_config|
            klass.create_method(
              rpc_config[:ruby_method],
              return_type: "::Twirp::ClientResp[#{rpc_config[:output_class]}]",
              parameters:  [create_param("request", type: rpc_config[:input_class].to_s)]
            )
          end
        end
      end
    end
  end
end
