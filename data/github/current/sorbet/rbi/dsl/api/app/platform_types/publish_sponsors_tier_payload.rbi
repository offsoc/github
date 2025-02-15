# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::PublishSponsorsTierPayload`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::PublishSponsorsTierPayload`.

class Api::App::PlatformTypes::PublishSponsorsTierPayload < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(String)) }
  def client_mutation_id; end

  sig { returns(T::Boolean) }
  def client_mutation_id?; end

  sig { returns(T.nilable(Api::App::PlatformTypes::SponsorsTier)) }
  def sponsors_tier; end

  sig { returns(T::Boolean) }
  def sponsors_tier?; end
end
