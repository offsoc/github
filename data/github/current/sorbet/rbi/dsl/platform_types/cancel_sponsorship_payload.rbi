# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::CancelSponsorshipPayload`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::CancelSponsorshipPayload`.

class PlatformTypes::CancelSponsorshipPayload < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(String)) }
  def client_mutation_id; end

  sig { returns(T::Boolean) }
  def client_mutation_id?; end

  sig { returns(T.nilable(PlatformTypes::SponsorsTier)) }
  def sponsors_tier; end

  sig { returns(T::Boolean) }
  def sponsors_tier?; end
end
