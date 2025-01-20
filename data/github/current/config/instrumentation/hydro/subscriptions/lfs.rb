# typed: true
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("billing.lfs_change") do |payload|
    actor = User.find_by(id: payload[:actor_id])
    user = User.find_by(id: payload[:user_id])
    # No user?  No plan?  No problem.
    return if user&.plan_duration.nil?
    lfs_product_uuid = Asset::Status.product_uuid(T.must(user&.plan_duration))

    delta = payload[:new_lfs_count].to_i - payload[:old_lfs_count].to_i

    resource_action = \
      if payload[:new_lfs_count] == 0
        "delete"
      elsif payload[:old_lfs_count] == 0
        "create"
      else
        "change_quantity"
      end

    message = {
      actor: serializer.user(actor),
      resource: "BillingProduct",
      resource_action: resource_action,
      resource_quantity_delta: delta,
      resource_quantity_total: payload[:new_lfs_count]&.to_i,
      target_entity: {
        entity_type: :BILLING_PRODUCT,
        entity_id: lfs_product_uuid&.id,
      },
      target_entity_owner: serializer.user(user),
      request_context: serializer.request_context(GitHub.context.to_hash),
    }
    publish(message, schema: "github.v1.UserBehavior", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end
