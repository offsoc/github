# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Search::V0::UiEvent`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Search::V0::UiEvent`.

class Hydro::Schemas::Github::Search::V0::UiEvent
  sig do
    params(
      actor_id: T.nilable(Google::Protobuf::Int64Value),
      actor_login: T.nilable(Google::Protobuf::StringValue),
      browser_languages: T.nilable(String),
      browser_width: T.nilable(Integer),
      context: T.nilable(T.any(Google::Protobuf::Map[String, String], T::Hash[String, String])),
      interaction: T.nilable(String),
      page_index: T.nilable(Google::Protobuf::Int64Value),
      performed_at: T.nilable(Google::Protobuf::Timestamp),
      query_id: T.nilable(Google::Protobuf::StringValue),
      react_app: T.nilable(String),
      result_blob_sha: T.nilable(Google::Protobuf::StringValue),
      result_commit_sha: T.nilable(Google::Protobuf::StringValue),
      result_index: T.nilable(Google::Protobuf::Int64Value),
      result_language: T.nilable(Google::Protobuf::StringValue),
      result_line_number: T.nilable(Google::Protobuf::Int64Value),
      result_path: T.nilable(Google::Protobuf::StringValue),
      result_ref_name: T.nilable(Google::Protobuf::StringValue),
      result_repo_nwo: T.nilable(Google::Protobuf::StringValue),
      result_type: T.nilable(Google::Protobuf::StringValue),
      target: T.nilable(String),
      url: T.nilable(String),
      user_agent: T.nilable(String)
    ).void
  end
  def initialize(actor_id: nil, actor_login: nil, browser_languages: nil, browser_width: nil, context: T.unsafe(nil), interaction: nil, page_index: nil, performed_at: nil, query_id: nil, react_app: nil, result_blob_sha: nil, result_commit_sha: nil, result_index: nil, result_language: nil, result_line_number: nil, result_path: nil, result_ref_name: nil, result_repo_nwo: nil, result_type: nil, target: nil, url: nil, user_agent: nil); end

  sig { returns(T.nilable(Google::Protobuf::Int64Value)) }
  def actor_id; end

  sig { params(value: T.nilable(Google::Protobuf::Int64Value)).void }
  def actor_id=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def actor_login; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def actor_login=(value); end

  sig { returns(String) }
  def browser_languages; end

  sig { params(value: String).void }
  def browser_languages=(value); end

  sig { returns(Integer) }
  def browser_width; end

  sig { params(value: Integer).void }
  def browser_width=(value); end

  sig { void }
  def clear_actor_id; end

  sig { void }
  def clear_actor_login; end

  sig { void }
  def clear_browser_languages; end

  sig { void }
  def clear_browser_width; end

  sig { void }
  def clear_context; end

  sig { void }
  def clear_interaction; end

  sig { void }
  def clear_page_index; end

  sig { void }
  def clear_performed_at; end

  sig { void }
  def clear_query_id; end

  sig { void }
  def clear_react_app; end

  sig { void }
  def clear_result_blob_sha; end

  sig { void }
  def clear_result_commit_sha; end

  sig { void }
  def clear_result_index; end

  sig { void }
  def clear_result_language; end

  sig { void }
  def clear_result_line_number; end

  sig { void }
  def clear_result_path; end

  sig { void }
  def clear_result_ref_name; end

  sig { void }
  def clear_result_repo_nwo; end

  sig { void }
  def clear_result_type; end

  sig { void }
  def clear_target; end

  sig { void }
  def clear_url; end

  sig { void }
  def clear_user_agent; end

  sig { returns(Google::Protobuf::Map[String, String]) }
  def context; end

  sig { params(value: Google::Protobuf::Map[String, String]).void }
  def context=(value); end

  sig { returns(String) }
  def interaction; end

  sig { params(value: String).void }
  def interaction=(value); end

  sig { returns(T.nilable(Google::Protobuf::Int64Value)) }
  def page_index; end

  sig { params(value: T.nilable(Google::Protobuf::Int64Value)).void }
  def page_index=(value); end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def performed_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def performed_at=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def query_id; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def query_id=(value); end

  sig { returns(String) }
  def react_app; end

  sig { params(value: String).void }
  def react_app=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def result_blob_sha; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def result_blob_sha=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def result_commit_sha; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def result_commit_sha=(value); end

  sig { returns(T.nilable(Google::Protobuf::Int64Value)) }
  def result_index; end

  sig { params(value: T.nilable(Google::Protobuf::Int64Value)).void }
  def result_index=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def result_language; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def result_language=(value); end

  sig { returns(T.nilable(Google::Protobuf::Int64Value)) }
  def result_line_number; end

  sig { params(value: T.nilable(Google::Protobuf::Int64Value)).void }
  def result_line_number=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def result_path; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def result_path=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def result_ref_name; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def result_ref_name=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def result_repo_nwo; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def result_repo_nwo=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def result_type; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def result_type=(value); end

  sig { returns(String) }
  def target; end

  sig { params(value: String).void }
  def target=(value); end

  sig { returns(String) }
  def url; end

  sig { params(value: String).void }
  def url=(value); end

  sig { returns(String) }
  def user_agent; end

  sig { params(value: String).void }
  def user_agent=(value); end
end
