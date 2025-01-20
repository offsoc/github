# typed: true
# frozen_string_literal: true

class Stripe::Event < Stripe::APIResource
  # https://stripe.com/docs/api/events/object#event_object-account
  sig { returns(String) }
  def account; end

  sig { returns(String) }
  def created; end
end

class Stripe::Dispute < Stripe::APIResource
  sig { returns(String) }
  def reason; end

  sig { returns(String) }
  def status; end

  sig { returns(T::Boolean) }
  def is_charge_refundable; end

  sig { returns(String) }
  def currency; end

  sig { returns(T.untyped) }
  def evidence_details; end

  sig { returns(String) }
  def charge; end
end

class Stripe::Payout < Stripe::APIResource
  sig { returns(String) }
  def currency; end

  # https://stripe.com/docs/api/payouts/object#payout_object-type
  sig { returns(String) }
  def type; end

  sig { returns(T.nilable(String)) }
  def failure_code; end

  sig { returns(T.any(String, Stripe::BankAccount)) }
  def destination; end
end

class Stripe::Transfer < Stripe::APIResource
  sig { returns(String) }
  def currency; end

  sig { returns(Integer) }
  def amount; end

  sig { returns(T.nilable(Integer)) }
  def destination_amount; end

  sig { returns(T.nilable(Integer)) }
  def created; end

  sig { returns(String) }
  def transfer_group; end

  sig { returns(String) }
  def destination; end

  sig { returns(T.nilable(String)) }
  def destination_currency; end

  sig { returns(T.nilable(T::Boolean)) }
  def reversed; end
end

class Stripe::Charge < Stripe::APIResource
  # @method_missing: from StripeObject
  sig { returns(T.nilable(Stripe::StripeObject)) }
  def payment_method_details; end
end

class Stripe::Invoice < Stripe::APIResource
  sig { returns(::Billing::Types::Numeric) }
  def amount_due; end

  sig { returns(::Billing::Types::Numeric) }
  def amount_remaining; end

  sig { returns(String) }
  def number; end

  sig { returns(String) }
  def hosted_invoice_url; end
end

class Stripe::Card < Stripe::APIResource
  sig { returns(String) }
  def fingerprint; end
end

class Stripe::InvoiceLineItem < Stripe::StripeObject
  # @method_missing: from StripeObject
  sig { returns(T::Hash[T.any(String, Symbol), T.untyped]) }
  def metadata; end

  # @method_missing: from StripeObject
  sig { params(val: T::Hash[T.any(String, Symbol), T.untyped]).void }
  def metadata=(val); end

  # @method_missing: from StripeObject
  sig { returns(T.nilable(String)) }
  def description; end
end

class Stripe::Radar::EarlyFraudWarning < Stripe::APIResource
  sig { returns(T::Boolean) }
  def actionable; end

  sig { returns(String) }
  def charge; end

  sig { returns(Integer) }
  def created; end

  sig { returns(String) }
  def fraud_type; end

  sig { returns(T::Boolean) }
  def livemode; end
end
