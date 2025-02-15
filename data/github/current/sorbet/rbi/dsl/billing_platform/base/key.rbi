# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `BillingPlatform::Base::Key`.
# Please instead update this file by running `bin/tapioca dsl BillingPlatform::Base::Key`.

class BillingPlatform::Base::Key
  sig { params(id: T.nilable(String), partitionKey: T.nilable(String)).void }
  def initialize(id: nil, partitionKey: nil); end

  sig { void }
  def clear_id; end

  sig { void }
  def clear_partitionKey; end

  sig { returns(String) }
  def id; end

  sig { params(value: String).void }
  def id=(value); end

  sig { returns(String) }
  def partitionKey; end

  sig { params(value: String).void }
  def partitionKey=(value); end
end
