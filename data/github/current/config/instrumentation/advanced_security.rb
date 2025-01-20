# typed: strict
# frozen_string_literal: true

GitHub.subscribe(/\Abilling.subscription_item_cancelled\Z/) do |_name, _start, _ending, _transaction_id, payload|
  item = Billing::SubscriptionItem.find_by(id: payload[:subscription_item_id])
  return unless item.present?

  if item.product_uuid? &&
    item.subscribable.product_type == AdvancedSecurity::Public::Subscription::ADVANCED_SECURITY_MONTHLY_PRODUCT.product_type &&
    item.subscribable.product_key == AdvancedSecurity::Public::Subscription::ADVANCED_SECURITY_MONTHLY_PRODUCT.product_key

    # Even if the original actor was deleted, we still need to clear the GHAS subscription config setting since the
    # subscription item has already been cancelled.
    actor = User.find_by(id: payload[:actor_id]) || User.ghost

    billable_entity = T.cast(T.must(T.must(item.plan_subscription).billable_entity), ::Billing::Types::OrgOrBusiness)
    billable_entity.transaction do
      billable_entity.mark_advanced_security_as_not_purchased_for_entity(actor: actor)
    end
  end
end
