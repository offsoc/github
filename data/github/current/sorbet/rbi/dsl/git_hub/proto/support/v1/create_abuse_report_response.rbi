# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::Support::V1::CreateAbuseReportResponse`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::Support::V1::CreateAbuseReportResponse`.

class GitHub::Proto::Support::V1::CreateAbuseReportResponse
  sig { params(is_created: T.nilable(T::Boolean)).void }
  def initialize(is_created: nil); end

  sig { void }
  def clear_is_created; end

  sig { returns(T::Boolean) }
  def is_created; end

  sig { params(value: T::Boolean).void }
  def is_created=(value); end
end
