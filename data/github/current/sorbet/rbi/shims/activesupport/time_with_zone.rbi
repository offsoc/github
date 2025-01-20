# typed: strict
# frozen_string_literal: true

# This shim is needed because ActiveSupport::TimeWithZone uses `method_missing` to deligate
# a lot of calls to the underlying wrapped `Time` objects.
# This enables us to use sorbet without calling `.to_time`, which loses timezone info[^1]
#
# [^1]: Calling `to_time` will result in the right time with the right utc offset. However,
#       it does not retain the timezone itself and any shift in time (`+ 1.day`, for example)
#       could result in incorrect time; notably when it crosses DST boundary.

class ActiveSupport::TimeWithZone
  sig { returns(ActiveSupport::TimeWithZone) }
  def beginning_of_hour; end

  sig { returns(ActiveSupport::TimeWithZone) }
  def end_of_hour; end

  sig { returns(ActiveSupport::TimeWithZone) }
  def beginning_of_day; end

  sig { returns(ActiveSupport::TimeWithZone) }
  def end_of_day; end

  sig { returns(ActiveSupport::TimeWithZone) }
  def at_midnight; end

  sig { returns(ActiveSupport::TimeWithZone) }
  def prev_day; end

  sig { returns(ActiveSupport::TimeWithZone) }
  def next_month; end

  sig { returns(ActiveSupport::TimeWithZone) }
  def end_of_month; end
end
