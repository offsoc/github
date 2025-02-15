# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::MarketplaceListingInsight`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::MarketplaceListingInsight`.

class Api::App::PlatformTypes::MarketplaceListingInsight < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(Integer) }
  def cancellations; end

  sig { returns(T::Boolean) }
  def cancellations?; end

  sig { returns(Integer) }
  def cancelled_seats; end

  sig { returns(T::Boolean) }
  def cancelled_seats?; end

  sig { returns(Integer) }
  def checkout_uniques; end

  sig { returns(T::Boolean) }
  def checkout_uniques?; end

  sig { returns(Integer) }
  def downgraded_seats; end

  sig { returns(T::Boolean) }
  def downgraded_seats?; end

  sig { returns(Integer) }
  def downgrades; end

  sig { returns(T::Boolean) }
  def downgrades?; end

  sig { returns(Integer) }
  def free_trial_cancellations; end

  sig { returns(T::Boolean) }
  def free_trial_cancellations?; end

  sig { returns(Integer) }
  def free_trial_conversions; end

  sig { returns(T::Boolean) }
  def free_trial_conversions?; end

  sig { returns(Integer) }
  def installs; end

  sig { returns(T::Boolean) }
  def installs?; end

  sig { returns(Integer) }
  def landing_uniques; end

  sig { returns(T::Boolean) }
  def landing_uniques?; end

  sig { returns(Integer) }
  def mrr_gained; end

  sig { returns(T::Boolean) }
  def mrr_gained?; end

  sig { returns(Integer) }
  def mrr_lost; end

  sig { returns(T::Boolean) }
  def mrr_lost?; end

  sig { returns(Integer) }
  def mrr_recurring; end

  sig { returns(T::Boolean) }
  def mrr_recurring?; end

  sig { returns(Integer) }
  def new_free_subscriptions; end

  sig { returns(T::Boolean) }
  def new_free_subscriptions?; end

  sig { returns(Integer) }
  def new_free_trial_subscriptions; end

  sig { returns(T::Boolean) }
  def new_free_trial_subscriptions?; end

  sig { returns(Integer) }
  def new_paid_subscriptions; end

  sig { returns(T::Boolean) }
  def new_paid_subscriptions?; end

  sig { returns(Integer) }
  def new_purchases; end

  sig { returns(T::Boolean) }
  def new_purchases?; end

  sig { returns(Integer) }
  def new_seats; end

  sig { returns(T::Boolean) }
  def new_seats?; end

  sig { returns(Integer) }
  def page_views; end

  sig { returns(T::Boolean) }
  def page_views?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def recorded_on; end

  sig { returns(T::Boolean) }
  def recorded_on?; end

  sig { returns(Integer) }
  def upgraded_seats; end

  sig { returns(T::Boolean) }
  def upgraded_seats?; end

  sig { returns(Integer) }
  def upgrades; end

  sig { returns(T::Boolean) }
  def upgrades?; end

  sig { returns(Integer) }
  def visitors; end

  sig { returns(T::Boolean) }
  def visitors?; end
end
