# typed: true
# frozen_string_literal: true

module BillingTimeExtensions
  sig { returns(ActiveSupport::TimeWithZone) }
  def in_billing_time_zone; end

  sig { returns(Date) }
  def to_billing_date; end
end

class Time
  include BillingTimeExtensions
end

class DateTime
  include BillingTimeExtensions
end

class ActiveSupport::TimeWithZone
  include BillingTimeExtensions
end
