# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Proto::TrustMetadataApi::V0::StatusResponse`.
# Please instead update this file by running `bin/tapioca dsl Proto::TrustMetadataApi::V0::StatusResponse`.

class Proto::TrustMetadataApi::V0::StatusResponse
  sig { params(commit: T.nilable(String), state: T.nilable(String)).void }
  def initialize(commit: nil, state: nil); end

  sig { void }
  def clear_commit; end

  sig { void }
  def clear_state; end

  sig { returns(String) }
  def commit; end

  sig { params(value: String).void }
  def commit=(value); end

  sig { returns(String) }
  def state; end

  sig { params(value: String).void }
  def state=(value); end
end
