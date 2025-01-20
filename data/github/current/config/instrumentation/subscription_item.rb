# typed: strict
# frozen_string_literal: true

GitHub.subscribe(/\Amarketplace\_purchase\.(purchased|cancelled|changed)\Z/) do |name, _start, _ending, _transaction_id, payload|
  item = Billing::SubscriptionItem.find payload[:subscription_item_id]
  listing = item.subscribable.listing
  action = name.split(".").last

  # TODO: It looks like account.transactions are semi deprecated! I propose we just skip this for now.
  # Additional context in: https://github.com/github/github/pull/244288/files#r1010022982
  if item.account.respond_to?(:transactions)
    T.cast(item.account, User).transactions.create \
      action: "mp_#{action}",
      current_subscribable: item.subscribable,
      current_subscribable_quantity: item.quantity,
      old_subscribable_id: payload[:previous_subscribable_id],
      old_subscribable_type: payload[:previous_subscribable_type],
      old_subscribable_quantity: payload[:previous_quantity],
      active_listing: listing.billable?
  end
end

GitHub.subscribe(/\Asponsorship\.(added|cancelled|changed)\Z/) do |name, _start, _ending, _transaction_id, payload|
  item = Billing::SubscriptionItem.find payload[:subscription_item_id]
  listing = item.subscribable.listing
  action = name.split(".").last

  # TODO: It looks like account.transactions are semi deprecated! I propose we just skip this for now.
  if item.account.respond_to?(:transactions)
    T.cast(item.account, User).transactions.create \
      action: "sp_#{action}",
      current_subscribable: item.subscribable,
      current_subscribable_quantity: item.quantity,
      old_subscribable_id: payload[:previous_subscribable_id],
      old_subscribable_type: payload[:previous_subscribable_type],
      old_subscribable_quantity: payload[:previous_quantity],
      active_listing: listing.billable?
  end
end

GitHub.subscribe(/\Abilling.subscription_item\_(created|cancelled|changed)\Z/) do |name, _start, _ending, _transaction_id, payload|
  item = Billing::SubscriptionItem.find payload[:subscription_item_id]

  # TODO: It looks like account.transactions are semi deprecated! I propose we just skip this for now.
  if item.account.present? && item.account.respond_to?(:transactions)
    action = name.split("_").last

    T.cast(item.account, User).transactions.create \
      action: "sub_#{action}",
      current_subscribable: item.subscribable,
      current_subscribable_quantity: item.quantity,
      old_subscribable_id: payload[:previous_subscribable_id],
      old_subscribable_type: payload[:previous_subscribable_type],
      old_subscribable_quantity: payload[:previous_quantity]

    if action == "created"
      GitHub.dogstats.count \
        "#{name}.units",
        item.quantity,
        tags: [
          "product_key:#{item.subscribable.product_key}",
          "product_type:#{item.subscribable.product_type}",
          "billing_cycle:#{item.subscribable.billing_cycle}"
        ]
    end

    GitHub.dogstats.increment \
      name,
      tags: [
        "quantity:#{item.quantity}",
        "product_key:#{item.subscribable.product_key}",
        "product_type:#{item.subscribable.product_type}",
        "billing_cycle:#{item.subscribable.billing_cycle}"
      ]
  end
end
