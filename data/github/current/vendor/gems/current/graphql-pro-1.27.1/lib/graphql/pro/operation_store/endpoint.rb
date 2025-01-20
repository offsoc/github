# frozen_string_literal: true
require "openssl"
require "json"

module GraphQL
  module Pro
    class OperationStore
      # One route to receive and maybe save GraphQL
      # @api private
      class Endpoint
        def initialize(schema: nil, schema_class_name: nil)
          if schema.nil? && schema_class_name.nil?
            raise ArgumentError, "either `schema:` or `schema_class_name:` is required"
          end

          @schema = schema
          @schema_class_name = schema_class_name
          @operation_store = nil
        end

        def call(env)
          if @operation_store.nil?
            if @schema.nil?
              @schema = Object.const_get(@schema_class_name)
            end
            @operation_store = @schema.operation_store || raise("Can't mount #{self.class}; Schema is not configured for OperationStore")
          end

          request = Rack::Request.new(env)
          if request.path_info == "/" && request.post?
            body = request.body
            if body.respond_to?(:rewind)
              request.body.rewind
            end
            payload_json = body.read
            auth_header = request.env["HTTP_AUTHORIZATION"] || ""
            authed, message = authenticated_request?(auth_header, payload_json)
            if !authed
              OperationStore.debug { "Failed to authorize body, header: #{auth_header.inspect} (#{message})" }
              [401, {}, [""]]
            else
              client_name = message
              payload = begin
                JSON.parse(payload_json)
              rescue JSON::ParserError
                return [422, {}, ["Invalid JSON"]]
              end
              changeset_version = request.env["HTTP_CHANGESET_VERSION"]
              begin
                begin
                  operations = payload.fetch("operations")
                rescue KeyError => error
                  return [422, {}, ["Invalid input structure, missing JSON key: #{error.key.inspect}"]]
                end
                response_data = GraphQL::Pro::OperationStore::AddOperationBatch.call(
                  operation_store: @operation_store,
                  client_name: client_name,
                  operations: operations,
                  changeset_version: changeset_version,
                )
              rescue AddOperationBatch::BatchFailedError => error
                return [422, {}, [error.message]]
              end

              response_code = response_data[:committed] == false ? 422 : 200

              json_response = JSON.dump(response_data)

              headers = {
                "Content-Type" => "application/json",
                "Content-Length" => json_response.bytesize.to_s,
              }
              [response_code, headers, [json_response]]
            end
          else
            [404, {}, [""]]
          end


        end

        # Better rendering in Rails Routes output
        def inspect
          schema = @schema.is_a?(Class) ? @schema.inspect : @schema.class.inspect
          "#<#{self.class.name}[#{schema}]>"
        end

        private

        # @return [false, String] False if unauthenticated, client_name if authenticated
        def authenticated_request?(header_value, body_string)
          # Check that the header has the expected parts
          prelude, client_name, provided_hmac = header_value.split(" ")
          if prelude.nil? || client_name.nil? || provided_hmac.nil?
            # The header is not the expected format; definitely invalid.
            [false, "Invalid header format"]
          else
            # Calculate the _expected_ message authentication code
            client = @schema.operation_store.get_client(client_name)
            if client.nil?
              [false, "No client found for '#{client_name}'"]
            else
              expected_hmac = OpenSSL::HMAC.hexdigest("SHA256", client.secret, body_string)
              # Does the provided code match the expected code?
              if provided_hmac == expected_hmac
                [true, client_name]
              else
                [false, "Invalid HMAC digest, expected #{expected_hmac.inspect}"]
              end
            end
          end
        end
      end
    end
  end
end
