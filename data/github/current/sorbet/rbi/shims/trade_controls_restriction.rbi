# typed: strict
# frozen_string_literal: true

class TradeControls::Restriction
  sig { params(compliance: TradeControls::Compliance, skip_enforcement_email: T::Boolean).void }
  def enforce!(compliance:, skip_enforcement_email: false); end

  sig { params(compliance: TradeControls::Compliance).void }
  def tier_0_enforce!(compliance:); end

  sig { params(compliance: TradeControls::Compliance).void }
  def tier_1_enforce!(compliance:); end

  sig { params(compliance: TradeControls::ManualCompliance).void }
  def override!(compliance:); end
end
