# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::RecordMarketplaceRetargetingNotificationsPayload`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::RecordMarketplaceRetargetingNotificationsPayload`.

class Api::App::PlatformTypes::RecordMarketplaceRetargetingNotificationsPayload < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(String)) }
  def client_mutation_id; end

  sig { returns(T::Boolean) }
  def client_mutation_id?; end

  sig { returns(T.nilable(Integer)) }
  def records_processed; end

  sig { returns(T::Boolean) }
  def records_processed?; end
end
