# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Copilotapi::KnowledgeBases::V1::GetKnowledgeBaseRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Copilotapi::KnowledgeBases::V1::GetKnowledgeBaseRequest`.

class MonolithTwirp::Copilotapi::KnowledgeBases::V1::GetKnowledgeBaseRequest
  sig do
    params(
      access_token: T.nilable(String),
      ip_address: T.nilable(String),
      knowledge_base_id: T.nilable(String)
    ).void
  end
  def initialize(access_token: nil, ip_address: nil, knowledge_base_id: nil); end

  sig { returns(String) }
  def access_token; end

  sig { params(value: String).void }
  def access_token=(value); end

  sig { void }
  def clear_access_token; end

  sig { void }
  def clear_ip_address; end

  sig { void }
  def clear_knowledge_base_id; end

  sig { returns(String) }
  def ip_address; end

  sig { params(value: String).void }
  def ip_address=(value); end

  sig { returns(String) }
  def knowledge_base_id; end

  sig { params(value: String).void }
  def knowledge_base_id=(value); end
end
