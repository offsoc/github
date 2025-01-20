# typed: strict
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("billing.free_trial_conversion") do |payload|
    actor = User.find_by(id: payload[:actor_id])
    user = User.find_by(id: payload[:user_id])
    plan_duration = user&.plan_duration
    product_uuid = plan_duration ? payload[:subscribable]&.product_uuid(plan_duration) : nil

    message = {
      actor: serializer.user(actor),
      resource: "BillingProduct",
      resource_action: "free_trial_conversion",
      resource_quantity_delta: 0,
      resource_quantity_total: payload[:quantity].to_i,
      target_entity: {
        entity_type: :BILLING_PRODUCT,
        entity_id: product_uuid&.id,
      },
      target_entity_owner: serializer.user(user),
      request_context: serializer.request_context(GitHub.context.to_hash),
    }
    publish(message, schema: "github.v1.UserBehavior", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("billing.payment_method.addition") do |payload|
    actor = User.find_by(id: payload[:actor_id])
    account = User.find_by(id: payload[:account_id])
    payment_method = PaymentMethod.find_by(id: payload[:payment_method_id])

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(actor),
      account: serializer.user(account),
      payment_method: serializer.payment_method(payment_method),
    }

    publish(message, schema: "github.billing.v0.PaymentMethodAddition")
  end

  subscribe("billing.plan_change") do |payload|
    actor = User.find_by(id: payload[:actor_id])
    user = User.find_by(id: payload[:user_id])
    old_plan = GitHub::Plan.find(payload[:old_plan_name])
    plan_duration = user&.plan_duration
    old_plan_product_uuid = plan_duration ? old_plan&.product_uuid(plan_duration) : nil
    new_plan = GitHub::Plan.find(payload[:new_plan_name])
    new_plan_product_uuid = plan_duration ? new_plan&.product_uuid(plan_duration) : nil

    if old_plan_product_uuid
      old_plan_seat_delta = 0 - payload[:old_seat_count].to_i

      product_delete_message = {
        actor: serializer.user(actor),
        resource: "BillingProduct",
        resource_action: "delete",
        resource_quantity_delta: old_plan_seat_delta,
        resource_quantity_total: 0,
        target_entity: {
          entity_type: :BILLING_PRODUCT,
          entity_id: old_plan_product_uuid.id,
        },
        target_entity_owner: serializer.user(user),
        request_context: serializer.request_context(GitHub.context.to_hash),
        user_first_name: payload[:user_first_name],
        user_last_name: payload[:user_last_name],
      }
      publish(product_delete_message, schema: "github.v1.UserBehavior", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
    end

    if new_plan_product_uuid
      product_create_message = {
        actor: serializer.user(actor),
        resource: "BillingProduct",
        resource_action: "create",
        resource_quantity_delta: payload[:new_seat_count].to_i,
        resource_quantity_total: payload[:new_seat_count].to_i,
        target_entity: {
          entity_type: :BILLING_PRODUCT,
          entity_id: new_plan_product_uuid.id,
        },
        target_entity_owner: serializer.user(user),
        request_context: serializer.request_context(GitHub.context.to_hash),
        user_first_name: payload[:user_first_name],
        user_last_name: payload[:user_last_name],
      }
      publish(product_create_message, schema: "github.v1.UserBehavior", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
    end
  end

  subscribe("billing.positive_invoice.lapsed_billing") do |payload|
    account = User.find(payload[:account_id])
    payment_method = PaymentMethod.find(payload[:payment_method_id])

    message = {
      account: serializer.user(account),
      payment_method: serializer.payment_method(payment_method),
      invoice_amount_in_cents: payload[:invoice_amount],
      disabled_in_dotcom: payload[:disabled_in_dotcom],
      consecutive_failures_in_zuora: payload[:payment_method_num_consecutive_failures],
    }

    publish(message, schema: "github.billing.v0.PositiveInvoicePosted")
  end

  subscribe("billing.redeem_coupon") do |payload|
    actor = User.find_by(id: payload[:actor_id])
    user = User.find_by(id: payload[:user_id])

    message = {
      actor: serializer.user(actor),
      resource: "CouponRedemption",
      resource_action: "create",
      target_entity: {
        entity_type: :COUPON,
        entity_id: payload[:coupon_id],
      },
      target_entity_owner: serializer.user(user),
      request_context: serializer.request_context(GitHub.context.to_hash),
    }
    publish(message, schema: "github.v1.UserBehavior", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("billing.seat_count_change") do |payload|
    actor = User.find_by(id: payload[:actor_id])
    user = User.find_by(id: payload[:user_id])
    plan_product_uuid = user&.plan&.product_uuid(user&.plan_duration.to_s)

    delta = payload[:new_seat_count].to_i - payload[:old_seat_count].to_i

    message = {
      actor: serializer.user(actor),
      resource: "BillingProduct",
      resource_action: "change_quantity",
      resource_quantity_delta: delta,
      resource_quantity_total: payload[:new_seat_count]&.to_i,
      target_entity: {
        entity_type: :BILLING_PRODUCT,
        entity_id: plan_product_uuid&.id,
      },
      target_entity_owner: serializer.user(user),
      request_context: serializer.request_context(GitHub.context.to_hash),
    }
    publish(message, schema: "github.v1.UserBehavior", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("billing.subscription_item_change") do |payload|
    actor = User.find_by(id: payload[:actor_id])
    user = User.find_by(id: payload[:user_id])

    old_subscribable = payload[:old_subscribable]
    next if old_subscribable.is_a?(SponsorsTier)

    new_subscribable = payload[:new_subscribable]
    next if new_subscribable.is_a?(SponsorsTier)

    plan_duration = user&.plan_duration
    old_product_uuid = plan_duration ? old_subscribable&.product_uuid(plan_duration) : nil
    new_product_uuid = plan_duration ? new_subscribable&.product_uuid(plan_duration) : nil

    if old_product_uuid
      old_quantity_delta = 0 - payload[:old_quantity].to_i

      delete_message = {
        actor: serializer.user(actor),
        resource: "BillingProduct",
        resource_action: "delete",
        resource_quantity_delta: old_quantity_delta,
        resource_quantity_total: 0,
        target_entity: {
          entity_type: :BILLING_PRODUCT,
          entity_id: old_product_uuid&.id,
        },
        target_entity_owner: serializer.user(user),
        request_context: serializer.request_context(GitHub.context.to_hash),
      }
      publish(delete_message, schema: "github.v1.UserBehavior", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
    end

    if new_product_uuid && payload[:new_quantity].to_i.positive?
      create_message = {
        actor: serializer.user(actor),
        resource: "BillingProduct",
        resource_action: "create",
        resource_quantity_delta: payload[:new_quantity].to_i,
        resource_quantity_total: payload[:new_quantity].to_i,
        target_entity: {
          entity_type: :BILLING_PRODUCT,
          entity_id: new_product_uuid&.id,
        },
        target_entity_owner: serializer.user(user),
        request_context: serializer.request_context(GitHub.context.to_hash),
      }
      publish(create_message, schema: "github.v1.UserBehavior", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
    end
  end

  subscribe("billing.subscription_item_quantity_change") do |payload|
    actor = User.find_by(id: payload[:actor_id])
    user = User.find_by(id: payload[:user_id])

    subscribable = payload[:subscribable]
    next if subscribable.is_a?(SponsorsTier)

    plan_duration = user&.plan_duration
    product_uuid = plan_duration ? subscribable&.product_uuid(plan_duration) : nil

    delta = payload[:new_quantity].to_i - payload[:old_quantity].to_i

    message = {
      actor: serializer.user(actor),
      resource: "BillingProduct",
      resource_action: "change_quantity",
      resource_quantity_delta: delta,
      resource_quantity_total: payload[:new_quantity].to_i,
      target_entity: {
        entity_type: :BILLING_PRODUCT,
        entity_id: product_uuid&.id,
      },
      target_entity_owner: serializer.user(user),
      request_context: serializer.request_context(GitHub.context.to_hash),
    }
    publish(message, schema: "github.v1.UserBehavior", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.billing.upgrade.click") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      actor: serializer.user(payload[:client][:user]),
      target: payload[:target],
    }

    publish(message, schema: "github.v1.BillingUpgradeClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("trial.extended") do |payload|
    message = {
      account: serializer.user(payload[:account]),
      previous_duration_in_days: payload[:previous_duration_in_days],
      new_duration_in_days: payload[:new_duration_in_days],
    }

    publish(message, schema: "github.billing.v0.TrialExtended")
  end

  subscribe("trial.plan_change") do |payload|
    message = {
      account: serializer.user(payload[:account]),
      trial_plan: payload[:trial_plan],
      new_plan: payload[:new_plan],
      trial_expired: payload[:trial_expired],
      user_initiated: payload[:user_initiated],
    }

    publish(message, schema: "github.billing.v0.TrialPlanChange")
  end

  subscribe("trial.signup") do |payload|
    message = {
      account: serializer.user(payload[:account]),
      previous_plan: payload[:previous_plan],
      current_plan: payload[:current_plan],
    }

    publish(message, schema: "github.billing.v0.TrialSignup", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("billing.authorization_transaction_created") do |payload|
    message = {
      account_type: serializer.account_type(payload[:account_type]),
      payment_method: serializer.payment_method(payload[:payment_method]),
      success: payload[:success],
      declined: payload[:declined],
      authorization_amount_in_cents: payload[:authorization_amount_in_cents],
      processor_response_code: payload[:processor_response_code],
      processor_response: payload[:processor_response],
      billing_locked: payload[:billing_locked],
      billing_unlocked: payload[:billing_unlocked]
    }
    if payload[:account_type] == "user"
      message[:user_account] = serializer.user(payload[:account])
    elsif payload[:account_type] == "business"
      message[:business_account] = serializer.business(payload[:account])
    end

    publish(message, schema: "github.billing.v0.AuthorizationTransactionCreated")
  end

  subscribe("billing.authorization_transaction_cancelled") do |payload|
    message = {
      payment_method: serializer.payment_method(payload[:payment_method]),
      success: payload[:success],
      processor_response_code: payload[:processor_response_code],
      processor_response: payload[:processor_response],
    }

    if payload[:account_type] == "user"
      message[:user_account] = serializer.user(payload[:account])
    elsif payload[:account_type] == "business"
      message[:business_account] = serializer.business(payload[:account])
    end

    publish(message, schema: "github.billing.v0.AuthorizationTransactionCancelled")
  end
end
