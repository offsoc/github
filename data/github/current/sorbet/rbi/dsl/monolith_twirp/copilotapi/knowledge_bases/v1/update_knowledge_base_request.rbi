# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Copilotapi::KnowledgeBases::V1::UpdateKnowledgeBaseRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Copilotapi::KnowledgeBases::V1::UpdateKnowledgeBaseRequest`.

class MonolithTwirp::Copilotapi::KnowledgeBases::V1::UpdateKnowledgeBaseRequest
  sig do
    params(
      access_token: T.nilable(String),
      description: T.nilable(String),
      ip_address: T.nilable(String),
      knowledge_base_id: T.nilable(String),
      name: T.nilable(String),
      owner_id: T.nilable(Integer),
      repos: T.nilable(T.any(Google::Protobuf::RepeatedField[String], T::Array[String])),
      scoping_query: T.nilable(String),
      source_repos: T.nilable(T.any(Google::Protobuf::RepeatedField[MonolithTwirp::Copilotapi::KnowledgeBases::V1::Repo], T::Array[MonolithTwirp::Copilotapi::KnowledgeBases::V1::Repo])),
      visibility: T.nilable(T.any(Symbol, Integer))
    ).void
  end
  def initialize(access_token: nil, description: nil, ip_address: nil, knowledge_base_id: nil, name: nil, owner_id: nil, repos: T.unsafe(nil), scoping_query: nil, source_repos: T.unsafe(nil), visibility: nil); end

  sig { returns(String) }
  def access_token; end

  sig { params(value: String).void }
  def access_token=(value); end

  sig { void }
  def clear_access_token; end

  sig { void }
  def clear_description; end

  sig { void }
  def clear_ip_address; end

  sig { void }
  def clear_knowledge_base_id; end

  sig { void }
  def clear_name; end

  sig { void }
  def clear_owner_id; end

  sig { void }
  def clear_repos; end

  sig { void }
  def clear_scoping_query; end

  sig { void }
  def clear_source_repos; end

  sig { void }
  def clear_visibility; end

  sig { returns(String) }
  def description; end

  sig { params(value: String).void }
  def description=(value); end

  sig { returns(String) }
  def ip_address; end

  sig { params(value: String).void }
  def ip_address=(value); end

  sig { returns(String) }
  def knowledge_base_id; end

  sig { params(value: String).void }
  def knowledge_base_id=(value); end

  sig { returns(String) }
  def name; end

  sig { params(value: String).void }
  def name=(value); end

  sig { returns(Integer) }
  def owner_id; end

  sig { params(value: Integer).void }
  def owner_id=(value); end

  sig { returns(Google::Protobuf::RepeatedField[String]) }
  def repos; end

  sig { params(value: Google::Protobuf::RepeatedField[String]).void }
  def repos=(value); end

  sig { returns(String) }
  def scoping_query; end

  sig { params(value: String).void }
  def scoping_query=(value); end

  sig { returns(Google::Protobuf::RepeatedField[MonolithTwirp::Copilotapi::KnowledgeBases::V1::Repo]) }
  def source_repos; end

  sig { params(value: Google::Protobuf::RepeatedField[MonolithTwirp::Copilotapi::KnowledgeBases::V1::Repo]).void }
  def source_repos=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def visibility; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def visibility=(value); end
end
