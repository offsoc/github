# typed: true
# frozen_string_literal: true

require "fileutils"
require "kusto/auth"

module Kusto
  module Auth
    class DeviceCodeAuth < AuthBase
      sig { params(tenant_id: String, client_id: String, use_persistent_storage: T::Boolean).void }
      def initialize(tenant_id, client_id, use_persistent_storage: false)
        super tenant_id, client_id

        @device_code_uri = URI.parse("#{oauth_base_url}/devicecode")
        @use_persistent_storage = use_persistent_storage
      end

      sig { override.params(cluster_url: String).returns(T::Hash[String, T.untyped]) }
      def get_access_token(cluster_url)
        device_code_request = Net::HTTP::Post.new(@device_code_uri)
        device_code_request.set_form_data(
          client_id: client_id,
          scope: "#{cluster_url}/.default"
        )

        device_code_response = Net::HTTP.start(@device_code_uri.hostname, @device_code_uri.port, use_ssl: @device_code_uri.scheme == "https") do |http|
          http.request(device_code_request)
        end

        raise Errors.create_error("An error occurred while acquiring an access token.", device_code_response) if device_code_response.code.to_i != 200

        device_code_hash = JSON.parse(device_code_response.body)

        puts "Please go to #{device_code_hash["verification_uri"]} and enter the code #{device_code_hash["user_code"]}"

        get_token_hash_from_device_code(device_code_hash)
      end

      private

      sig { params(device_code_hash: T::Hash[String, T.untyped]).returns(T::Hash[String, T.untyped]) }
      def get_token_hash_from_device_code(device_code_hash)
        loop do
          begin
            token_request = Net::HTTP::Post.new(token_uri)
            token_request.set_form_data(
              grant_type: "urn:ietf:params:oauth:grant-type:device_code",
              device_code: device_code_hash["device_code"],
              client_id: client_id,
            )

            token_response = Net::HTTP.start(token_uri.hostname, token_uri.port, use_ssl: token_uri.scheme == "https") do |http|
              http.request(token_request)
            end

            case token_response.code.to_i
            when 200
              token_hash = JSON.parse(token_response.body)
              save_token_hash_to_file(token_hash) if @use_persistent_storage
              return token_hash
            when 400
              error_json = JSON.parse(token_response.body)
              if error_json["error"] == "authorization_pending"
                sleep(device_code_hash["interval"])
                next
              end
            end

            raise Errors.create_error("An error occurred while acquiring an access token.", token_response) if token_response.code.to_i != 200
          end
        end
      end

      TOKEN_SAVE_PATH = File.expand_path("~/.kusto/token.json")

      def save_token_hash_to_file(token_hash)
        token_hash["expiry"] = Time.now.utc.to_i + token_hash["expires_in"].to_i
        FileUtils.mkdir_p(File.dirname(TOKEN_SAVE_PATH))
        File.write(TOKEN_SAVE_PATH, JSON.pretty_generate(token_hash))
      end

      def load_token_hash_from_file
        JSON.parse(File.read(TOKEN_SAVE_PATH)) rescue nil
      end

      def token_valid?(token_hash)
        return false if token_hash.nil? || !token_hash.key?("expiry")
        return Time.now.utc.to_i < token_hash["expiry"].to_i
      end
    end
  end
end
