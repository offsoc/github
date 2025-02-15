# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::SubscriptionItem`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::SubscriptionItem`.

class PlatformTypes::SubscriptionItem < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig do
    returns(T.nilable(T.any(PlatformTypes::User, PlatformTypes::Organization, PlatformTypes::Enterprise, PlatformTypes::Bot, PlatformTypes::Mannequin, PlatformTypes::ProgrammaticAccessBot)))
  end
  def account; end

  sig { returns(T::Boolean) }
  def account?; end

  sig { returns(T::Boolean) }
  def account_has_been_charged; end

  sig { returns(T::Boolean) }
  def account_has_been_charged?; end

  sig { returns(T::Boolean) }
  def authorization_required; end

  sig { returns(T::Boolean) }
  def authorization_required?; end

  sig { returns(String) }
  def billing_cycle; end

  sig { returns(T::Boolean) }
  def billing_cycle?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::ScalarType)) }
  def created_at; end

  sig { returns(T::Boolean) }
  def created_at?; end

  sig { returns(T.nilable(Integer)) }
  def database_id; end

  sig { returns(T::Boolean) }
  def database_id?; end

  sig { returns(String) }
  def formatted_prorated_total_price; end

  sig { returns(T::Boolean) }
  def formatted_prorated_total_price?; end

  sig { returns(String) }
  def formatted_total_price; end

  sig { returns(T::Boolean) }
  def formatted_total_price?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::ScalarType)) }
  def free_trial_ends_on; end

  sig { returns(T::Boolean) }
  def free_trial_ends_on?; end

  sig { returns(T::Boolean) }
  def has_pending_cycle_change; end

  sig { returns(T::Boolean) }
  def has_pending_cycle_change?; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(T::Boolean) }
  def is_installed; end

  sig { returns(T::Boolean) }
  def is_installed?; end

  sig { returns(T.nilable(PlatformTypes::MarketplaceListing)) }
  def marketplace_listing; end

  sig { returns(T::Boolean) }
  def marketplace_listing?; end

  sig { returns(T.nilable(PlatformTypes::PendingMarketplaceChange)) }
  def marketplace_pending_change; end

  sig { returns(T::Boolean) }
  def marketplace_pending_change?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::ScalarType)) }
  def next_billing_date; end

  sig { returns(T::Boolean) }
  def next_billing_date?; end

  sig { returns(T::Boolean) }
  def on_free_trial; end

  sig { returns(T::Boolean) }
  def on_free_trial?; end

  sig { returns(T::Boolean) }
  def paid; end

  sig { returns(T::Boolean) }
  def paid?; end

  sig { returns(T.nilable(Integer)) }
  def pending_change_id; end

  sig { returns(T::Boolean) }
  def pending_change_id?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def post_trial_bill_date; end

  sig { returns(T::Boolean) }
  def post_trial_bill_date?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::ScalarType)) }
  def post_trial_prorated_price; end

  sig { returns(T::Boolean) }
  def post_trial_prorated_price?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def price; end

  sig { returns(T::Boolean) }
  def price?; end

  sig { returns(Integer) }
  def prorated_total_price_in_cents; end

  sig { returns(T::Boolean) }
  def prorated_total_price_in_cents?; end

  sig { returns(Integer) }
  def quantity; end

  sig { returns(T::Boolean) }
  def quantity?; end

  sig { returns(T.any(PlatformTypes::MarketplaceListingPlan, PlatformTypes::SponsorsTier)) }
  def subscribable; end

  sig { returns(T::Boolean) }
  def subscribable?; end

  sig { returns(T.nilable(PlatformTypes::PendingSubscribableChange)) }
  def subscribable_pending_change; end

  sig { returns(T::Boolean) }
  def subscribable_pending_change?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::ScalarType)) }
  def updated_at; end

  sig { returns(T::Boolean) }
  def updated_at?; end

  sig { returns(T::Boolean) }
  def viewer_can_admin; end

  sig { returns(T::Boolean) }
  def viewer_can_admin?; end
end
