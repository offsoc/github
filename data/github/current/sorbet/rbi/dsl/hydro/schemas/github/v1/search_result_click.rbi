# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::SearchResultClick`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::SearchResultClick`.

class Hydro::Schemas::Github::V1::SearchResultClick
  sig do
    params(
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      client_timestamp: T.nilable(Google::Protobuf::Timestamp),
      originating_request_id: T.nilable(String),
      page_number: T.nilable(Integer),
      per_page: T.nilable(Integer),
      query: T.nilable(String),
      request_context: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext),
      result: T.nilable(Hydro::Schemas::Github::V1::Entities::SearchResult),
      result_position: T.nilable(Integer),
      server_timestamp: T.nilable(Google::Protobuf::Timestamp)
    ).void
  end
  def initialize(actor: nil, client_timestamp: nil, originating_request_id: nil, page_number: nil, per_page: nil, query: nil, request_context: nil, result: nil, result_position: nil, server_timestamp: nil); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_client_timestamp; end

  sig { void }
  def clear_originating_request_id; end

  sig { void }
  def clear_page_number; end

  sig { void }
  def clear_per_page; end

  sig { void }
  def clear_query; end

  sig { void }
  def clear_request_context; end

  sig { void }
  def clear_result; end

  sig { void }
  def clear_result_position; end

  sig { void }
  def clear_server_timestamp; end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def client_timestamp; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def client_timestamp=(value); end

  sig { returns(String) }
  def originating_request_id; end

  sig { params(value: String).void }
  def originating_request_id=(value); end

  sig { returns(Integer) }
  def page_number; end

  sig { params(value: Integer).void }
  def page_number=(value); end

  sig { returns(Integer) }
  def per_page; end

  sig { params(value: Integer).void }
  def per_page=(value); end

  sig { returns(String) }
  def query; end

  sig { params(value: String).void }
  def query=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)) }
  def request_context; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)).void }
  def request_context=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::SearchResult)) }
  def result; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::SearchResult)).void }
  def result=(value); end

  sig { returns(Integer) }
  def result_position; end

  sig { params(value: Integer).void }
  def result_position=(value); end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def server_timestamp; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def server_timestamp=(value); end
end
