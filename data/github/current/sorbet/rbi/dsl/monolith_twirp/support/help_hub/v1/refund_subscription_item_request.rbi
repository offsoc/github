# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Support::HelpHub::V1::RefundSubscriptionItemRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Support::HelpHub::V1::RefundSubscriptionItemRequest`.

class MonolithTwirp::Support::HelpHub::V1::RefundSubscriptionItemRequest
  sig { params(subscription_item_id: T.nilable(Integer)).void }
  def initialize(subscription_item_id: nil); end

  sig { void }
  def clear_subscription_item_id; end

  sig { returns(Integer) }
  def subscription_item_id; end

  sig { params(value: Integer).void }
  def subscription_item_id=(value); end
end
