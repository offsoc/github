# typed: strict
# frozen_string_literal: true

# Methods in this class overrides the automatic generated ones
# in sorbet/rbi/dsl/user.rbi. It can help adjust the signature
# for columns that have an overridden getter that Sorbet is not
# aware of.
class User

  # The column stores the plan name as a string, but the
  # User#plan method is overridden to return a GitHub::Plan
  # matching the plan name
  sig { returns(GitHub::Plan) }
  def plan; end

  sig { params(new_plan: T.nilable(T.any(Symbol, String, GitHub::Plan))).void }
  def plan=(new_plan); end

  sig { returns(T.nilable(GitHub::Plan)) }
  def plan_was; end

  sig { returns(T.nilable(GitHub::Plan)) }
  def plan_before_last_save; end

  sig { returns(T.nilable(CouponRedemption)) }
  def coupon_redemption; end

  sig { returns(T.nilable(Coupon)) }
  def coupon; end

  # Overriden in BillingDependency with a default
  sig { returns(String) }
  def plan_duration; end

  # This method is metaprogrammed in from Coders::UserCoder
  # via `delegate *Coders::UserCoder.members, to: :raw_data` in the User model.

  sig { returns(String) }
  def raw_login; end

  sig { returns(T.nilable(String)) }
  def profile_name; end

  sig { returns(T.nilable(T::Array[SocialAccount])) }
  def profile_social_accounts; end

  sig { params(social_accounts: T::Array[SocialAccount]).void }
  def profile_social_accounts=(social_accounts); end

  sig { returns(T.nilable(String)) }
  def profile_twitter_username ; end

  sig { params(username: T.nilable(String)).void }
  def profile_twitter_username=(username) ; end

  sig { returns(::TradeControls::Restriction) }
  def trade_controls_restriction; end

  sig { params(ignore_linked_record: T::Boolean).returns(::AccountScreeningProfile) }
  def trade_screening_record(ignore_linked_record: false); end

  sig { params(ignore_linked_record: T::Boolean).returns(Promise[AccountScreeningProfile]) }
  def async_trade_screening_record(ignore_linked_record: false); end

  sig { params(scope: T.nilable(ActiveRecord::Relation)).returns(T::Array[Sponsorship]) }
  def active_sponsorships_as_sponsor(scope: nil); end
end
