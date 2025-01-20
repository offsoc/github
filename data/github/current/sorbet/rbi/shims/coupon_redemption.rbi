# typed: true

class CouponRedemption
  sig { returns(T.nilable(Billing::Types::Account)) }
  def billable_entity; end
end
