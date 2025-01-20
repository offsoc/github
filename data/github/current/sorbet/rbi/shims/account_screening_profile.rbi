# typed: strict
# frozen_string_literal: true

class AccountScreeningProfile
  sig { returns(Billing::Types::Account) }
  def owner; end

  sig { params(from: String).returns(T::Boolean) }
  def msft_trade_screening_status_changed?(from:); end
end
