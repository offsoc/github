# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::DraftIssue`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::DraftIssue`.

class PlatformTypes::DraftIssue < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(PlatformTypes::UserConnection) }
  def assignees; end

  sig { returns(T::Boolean) }
  def assignees?; end

  sig { returns(String) }
  def body; end

  sig { returns(T::Boolean) }
  def body?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def body_html; end

  sig { returns(T::Boolean) }
  def body_html?; end

  sig { returns(String) }
  def body_text; end

  sig { returns(T::Boolean) }
  def body_text?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def created_at; end

  sig { returns(T::Boolean) }
  def created_at?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::InterfaceType)) }
  def creator; end

  sig { returns(T::Boolean) }
  def creator?; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(PlatformTypes::ProjectNext) }
  def project; end

  sig { returns(T::Boolean) }
  def project?; end

  sig { returns(PlatformTypes::ProjectNextItem) }
  def project_item; end

  sig { returns(T::Boolean) }
  def project_item?; end

  sig { returns(PlatformTypes::ProjectV2ItemConnection) }
  def project_v2_items; end

  sig { returns(T::Boolean) }
  def project_v2_items?; end

  sig { returns(PlatformTypes::ProjectV2Connection) }
  def projects_v2; end

  sig { returns(T::Boolean) }
  def projects_v2?; end

  sig { returns(PlatformTypes::UserConnection) }
  def suggested_assignees; end

  sig { returns(T::Boolean) }
  def suggested_assignees?; end

  sig { returns(String) }
  def title; end

  sig { returns(T::Boolean) }
  def title?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def updated_at; end

  sig { returns(T::Boolean) }
  def updated_at?; end
end
