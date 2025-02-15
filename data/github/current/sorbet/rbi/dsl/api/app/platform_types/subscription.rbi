# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::Subscription`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::Subscription`.

class Api::App::PlatformTypes::Subscription < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(Float) }
  def balance; end

  sig { returns(T::Boolean) }
  def balance?; end

  sig { returns(Float) }
  def discount; end

  sig { returns(T::Boolean) }
  def discount?; end

  sig { returns(Float) }
  def discounted_price; end

  sig { returns(T::Boolean) }
  def discounted_price?; end

  sig { returns(String) }
  def duration; end

  sig { returns(T::Boolean) }
  def duration?; end

  sig { returns(T::Boolean) }
  def eligible_for_free_trial_on_listing; end

  sig { returns(T::Boolean) }
  def eligible_for_free_trial_on_listing?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def end_date; end

  sig { returns(T::Boolean) }
  def end_date?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def free_trial_end_date; end

  sig { returns(T::Boolean) }
  def free_trial_end_date?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def next_billing_date; end

  sig { returns(T::Boolean) }
  def next_billing_date?; end

  sig { returns(T::Boolean) }
  def on_free_trial; end

  sig { returns(T::Boolean) }
  def on_free_trial?; end

  sig { returns(T.nilable(Api::App::PlatformTypes::PendingCycle)) }
  def pending_cycle; end

  sig { returns(T::Boolean) }
  def pending_cycle?; end

  sig { returns(Api::App::PlatformTypes::Plan) }
  def plan; end

  sig { returns(T::Boolean) }
  def plan?; end

  sig { returns(T.nilable(Api::App::PlatformTypes::PlanChange)) }
  def plan_change; end

  sig { returns(T::Boolean) }
  def plan_change?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def post_free_trial_bill_date; end

  sig { returns(T::Boolean) }
  def post_free_trial_bill_date?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def post_trial_prorated_total_price; end

  sig { returns(T::Boolean) }
  def post_trial_prorated_total_price?; end

  sig { returns(Integer) }
  def seats; end

  sig { returns(T::Boolean) }
  def seats?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def start_date; end

  sig { returns(T::Boolean) }
  def start_date?; end

  sig { returns(T.nilable(Api::App::PlatformTypes::SubscriptionItem)) }
  def subscription_item; end

  sig { returns(T::Boolean) }
  def subscription_item?; end

  sig { returns(Api::App::PlatformTypes::SubscriptionItemConnection) }
  def subscription_items; end

  sig { returns(T::Boolean) }
  def subscription_items?; end

  sig { returns(Float) }
  def undiscounted_price; end

  sig { returns(T::Boolean) }
  def undiscounted_price?; end
end
