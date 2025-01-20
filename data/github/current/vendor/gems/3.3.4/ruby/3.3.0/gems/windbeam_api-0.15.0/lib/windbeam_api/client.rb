# frozen_string_literal: true

require "faraday"
require "google/protobuf"
require "proto/api/v1/privacy_api_twirp"
require_relative "utils/hmac_middleware"

module WindbeamApi
  class Client
    Status = Struct.new(:request_id, :created_at, :status, :start_date)
    UserRequest = Struct.new(:request_id, :request_type, :status, :created_at)
    Export = Struct.new(:request_id, :participant_name, :status, :created_at)

    def initialize(host, faraday_options: {}, hmac_key: ENV["WINDBEAM_HMAC_KEY"])
      raise ArgumentError.new("hmac_key cannot be nil") unless hmac_key

      @host = host
      @hmac_key = hmac_key
      @faraday_options = {
        open_timeout: 1,
        timeout: 10,
        params_encoder: Faraday::FlatParamsEncoder
      }.merge(faraday_options)
    end

    def ping
      empty = Google::Protobuf::Empty.new

      response = twirp_client.ping empty
      raise Errors::CommunicationError, response.error.msg if response.error
    end

    def delete_user(account_id, email, atid, login, identity_id: "", identity_type: :EMAIL, slug: nil, shortcode: nil, participants: ["none"])
      req = Windbeam::Api::V1::DeleteUserReq.new(
        account_id: account_id,
        account_type: :USER,
        identity_id: identity_id,
        identity_type: identity_type,
        login: login,
        analytics_tracking_id: atid,
        email: email,
        shortcode: shortcode,
        slug: slug
      )
      req.participants = Google::Protobuf::RepeatedField.new(:string)
      req.participants += participants

      response = twirp_client.delete_user(req)
      raise Errors::CommunicationError, response.error.msg if response.error

      response.data.request_id
    end

    def export_user(account_id, email, atid, login, identity_id: "", identity_type: :EMAIL, slug: nil, shortcode: nil, participants: ["none"])
      req = Windbeam::Api::V1::ExportUserReq.new(
        account_id: account_id,
        account_type: :USER,
        identity_id: identity_id,
        identity_type: identity_type,
        login: login,
        analytics_tracking_id: atid,
        email: email,
        slug: slug,
        shortcode: shortcode
      )
      req.participants = Google::Protobuf::RepeatedField.new(:string)
      req.participants += participants

      response = twirp_client.export_user(req)
      raise Errors::CommunicationError, response.error.msg if response.error

      response.data.request_id
    end

    def request_status(request_id)
      req = Windbeam::Api::V1::RequestStatusReq.new(request_id: request_id)

      response = twirp_client.request_status(req)
      raise Errors::CommunicationError, response.error.msg if response.error

      created_at = response.data.created_at ? Time.at(response.data.created_at.seconds) : nil
      start_date = response.data.start_date ? Time.at(response.data.start_date.seconds) : nil
      Status.new(response.data.request_id, created_at, response.data.status.to_sym, start_date)
    end

    def list_exports(request_id)
      req = Windbeam::Api::V1::ListExportsReq.new(request_id: request_id)

      response = twirp_client.list_exports(req)
      raise Errors::CommunicationError, response.error.msg if response.error

      response.data.exports.map do |e|
        created_at = e.created_at ? Time.at(e.created_at.seconds) : nil
        Export.new(e.request_id, e.participant_name, e.status.to_sym, created_at)
      end
    end

    def get_download_url(request_id, participant_name)
      req = Windbeam::Api::V1::GetDownloadUrlReq.new(request_id: request_id, participant_name: participant_name)

      response = twirp_client.get_download_url(req)
      raise Errors::CommunicationError, response.error.msg if response.error

      response.data.sas_url
    end

    def get_user_requests(username, status: nil)
      req = Windbeam::Api::V1::GetUserRequestsReq.new(user: username)
      req.status = Windbeam::Api::V1::Status.const_get(status) if status

      response = twirp_client.get_user_requests(req)
      raise Errors::CommunicationError, response.error.msg if response.error

      response.data.requests.map do |r|
        created_at = r.created_at ? Time.at(r.created_at.seconds) : nil
        UserRequest.new(r.request_id, r.request_type.to_sym, r.status.to_sym, created_at)
      end
    end

    private

    def twirp_client
      faraday = Faraday.new([@host, "twirp"].join("/")) do |conn|
        conn.options.merge!(@faraday_options)
        conn.use(WindbeamApi::Utils::HMACMiddleware, @hmac_key)
        conn.adapter(Faraday.default_adapter)
      end
      Windbeam::Api::V1::PrivacyAPIClient.new(faraday)
    end
  end
end
