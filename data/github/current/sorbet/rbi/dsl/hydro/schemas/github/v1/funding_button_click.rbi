# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::FundingButtonClick`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::FundingButtonClick`.

class Hydro::Schemas::Github::V1::FundingButtonClick
  sig do
    params(
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      clicked_at: T.nilable(Google::Protobuf::Timestamp),
      is_mobile: T.nilable(T::Boolean),
      owner_id: T.nilable(Integer),
      repo_id: T.nilable(Integer),
      repo_platforms: T.nilable(T.any(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Entities::FundingPlatform], T::Array[Hydro::Schemas::Github::V1::Entities::FundingPlatform])),
      request_context: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)
    ).void
  end
  def initialize(actor: nil, clicked_at: nil, is_mobile: nil, owner_id: nil, repo_id: nil, repo_platforms: T.unsafe(nil), request_context: nil); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_clicked_at; end

  sig { void }
  def clear_is_mobile; end

  sig { void }
  def clear_owner_id; end

  sig { void }
  def clear_repo_id; end

  sig { void }
  def clear_repo_platforms; end

  sig { void }
  def clear_request_context; end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def clicked_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def clicked_at=(value); end

  sig { returns(T::Boolean) }
  def is_mobile; end

  sig { params(value: T::Boolean).void }
  def is_mobile=(value); end

  sig { returns(Integer) }
  def owner_id; end

  sig { params(value: Integer).void }
  def owner_id=(value); end

  sig { returns(Integer) }
  def repo_id; end

  sig { params(value: Integer).void }
  def repo_id=(value); end

  sig { returns(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Entities::FundingPlatform]) }
  def repo_platforms; end

  sig { params(value: Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::Entities::FundingPlatform]).void }
  def repo_platforms=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)) }
  def request_context; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)).void }
  def request_context=(value); end
end
