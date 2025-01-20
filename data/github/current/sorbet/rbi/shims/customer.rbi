# typed: strict
# frozen_string_literal: true

class Customer
  sig { returns(::Billing::Contact) }
  def billing_contact; end
end
