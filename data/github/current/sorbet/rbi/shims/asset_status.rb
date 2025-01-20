# typed: true
# frozen_string_literal: true
#
class Asset::Status
  extend T::Sig

  sig { params(time: T.any(Time, ActiveSupport::TimeWithZone)).void }
  def updated_at=(time); end
end
