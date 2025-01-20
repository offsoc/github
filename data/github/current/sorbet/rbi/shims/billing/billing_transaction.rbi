# typed: true
# frozen_string_literal: true

class Billing::BillingTransaction
  sig { params(val: T.any(Date, Time, ActiveSupport::TimeWithZone)).void }
  def service_ends_at=(val); end
end
