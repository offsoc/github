# typed: true
# frozen_string_literal: true

# Methods in this class overrides the automatic generated ones
# in sorbet/rbi/dsl/organization.rbi. It can help adjust the signature
# for columns that have an overridden getter that Sorbet is not
# aware of.
class Organization

  # The column stores the plan name as a string, but the
  # Organization#plan method is overridden at packages/billing/app/models/user/billing_dependency.rb
  # to return a GitHub::Plan matching the plan name
  #
  # Needed until we figure out https://github.com/github/app-partitioning/issues/58
  sig { returns(GitHub::Plan) }
  def plan; end

  sig { params(new_plan: T.nilable(T.any(Symbol, String, GitHub::Plan))).void }
  def plan=(new_plan); end

  sig { returns(::TradeControls::Restriction) }
  def trade_controls_restriction; end

  sig { params(ignore_linked_record: T::Boolean).returns(::AccountScreeningProfile) }
  def trade_screening_record(ignore_linked_record: false); end

  sig { params(ignore_linked_record: T::Boolean).returns(Promise[AccountScreeningProfile]) }
  def async_trade_screening_record(ignore_linked_record: false); end
end
