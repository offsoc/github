# typed: true
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe(::Marketplace::Events::BROWSER_ACTION_CLICK) do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      user: serializer.user(payload[:client][:user]),
      repository_action: serializer.repository_action(payload[:repository_action_id]),
      location: payload[:location],
      source_url: payload[:source_url],
    }

    publish(message, schema: "github.marketplace.v0.ActionClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(::Marketplace::Events::BROWSER_ACTION_DELIST) do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      user: serializer.user(payload[:client][:user]),
      repository_action: serializer.repository_action(payload[:repository_action_id]),
      location: payload[:location],
      source_url: payload[:source_url],
    }

    publish(message, schema: "github.marketplace.v0.ActionDelist", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(::Marketplace::Events::BROWSER_ACTION_USE_BUTTON_CLICK) do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      user: serializer.user(payload[:client][:user]),
      repository_action: serializer.repository_action(payload[:repository_action_id]),
      location: payload[:location],
      source_url: payload[:source_url],
    }

    publish(message, schema: "github.marketplace.v0.ActionUseButtonClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(::Marketplace::Events::BROWSER_ACTION_USE_BUTTON_REPOSITORY_CLICK) do |payload|
    _, repo_id = Platform::Helpers::NodeIdentification.from_global_id(payload[:repository_id])
    repo = Repository.find_by(id: repo_id)

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      user: serializer.user(payload[:client][:user]),
      repository_action: serializer.repository_action(payload[:repository_action_id]),
      repository: serializer.repository(repo),
      location: payload[:location],
      source_url: payload[:source_url],
    }

    publish(message, schema: "github.marketplace.v0.ActionUseButtonRepositoryClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(::Marketplace::Events::BROWSER_RECOMMENDED_LISTING_CLICK) do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user: serializer.user(payload[:client][:user]),
      marketplace_listing: serializer.marketplace_listing_from_database_id(payload[:marketplace_listing_id]),
    }

    publish(message, schema: "github.marketplace.v0.RecommendedListingClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(::Marketplace::Events::BROWSER_RECOMMENDED_PAGE_CLICK) do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user: serializer.user(payload[:client][:user]),
    }

    publish(message, schema: "github.marketplace.v0.RecommendedPageClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(::Marketplace::Events::BROWSER_RECOMMENDED_PROJECT_MANAGEMENT_CLICK) do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user:            serializer.user(payload[:client][:user]),
      issue_count:     payload[:issue_count],
    }

    publish(message, schema: "github.marketplace.v0.RecommendedProjectManagementClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(::Marketplace::Events::BROWSER_RECOMMENDED_PROJECT_MANAGEMENT_DISMISSED) do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user:            serializer.user(payload[:client][:user]),
      issue_count:     payload[:issue_count],
    }

    publish(message, schema: "github.marketplace.v0.RecommendedProjectManagementDismissed", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(::Marketplace::Events::BROWSER_TRENDING_APPS_CLICK) do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user: serializer.user(payload[:client][:user]),
      marketplace_listing: serializer.marketplace_listing_from_database_id(payload[:marketplace_listing_id]),
    }

    publish(message, schema: "github.marketplace.v0.TrendingAppsClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(::Marketplace::Events::BROWSER_LISTING_CLICK) do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      user: serializer.user(payload[:client][:user]),
      marketplace_listing: serializer.marketplace_listing_from_database_id(payload[:marketplace_listing_id]),
      location: payload[:location],
      source_url: payload[:source_url],
      destination_url: payload[:destination_url],
    }

    publish(message, schema: "github.marketplace.v0.ListingClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(::Marketplace::Events::BROWSER_RETARGETING_NOTICE_CLICK) do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      user: serializer.user(payload[:client][:user]),
      marketplace_listings: payload[:marketplace_listing_ids].map { |id| serializer.marketplace_listing_from_database_id(id) },
      marketplace_listing_plans: payload[:marketplace_listing_plan_ids].map { |id| serializer.marketplace_listing_plan_from_database_id(id) },
      notice_name: payload[:notice_name],
    }

    publish(message, schema: "github.marketplace.v0.RetargetingNoticeClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(::Marketplace::Events::BROWSER_RETARGETING_NOTICE_DISMISSED) do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      user: serializer.user(payload[:client][:user]),
      marketplace_listings: payload[:marketplace_listing_ids].map { |id| serializer.marketplace_listing_from_database_id(id) },
      marketplace_listing_plans: payload[:marketplace_listing_plan_ids].map { |id| serializer.marketplace_listing_plan_from_database_id(id) },
      notice_name: payload[:notice_name],
    }

    publish(message, schema: "github.marketplace.v0.RetargetingNoticeDismissed", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(::Marketplace::Events::ACTION_LIST) do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      repository_owner: serializer.user(payload[:repository_owner]),
      repository_action: serializer.repository_action(payload[:repository_action_id]),
      repository: serializer.repository(payload[:repository]),
      release_tag_name: payload[:release_tag_name],
    }

    publish(message, schema: "github.marketplace.v0.ActionList", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(::Marketplace::Events::ACTION_USE_BUTTON_REPOSITORY_SEARCH) do |payload|
    results = payload[:repository_ids].map do |global_id|
      _, repo_id = Platform::Helpers::NodeIdentification.from_global_id(global_id)
      repo = Repository.find_by(id: repo_id)
      serializer.repository(repo)
    end

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user: serializer.user(payload[:user]),
      repository_action: serializer.repository_action(payload[:repository_action_id]),
      query: payload[:query],
      results: results,
    }

    publish(message, schema: "github.marketplace.v0.ActionUseButtonRepositorySearch", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(::Marketplace::Events::HOMEPAGE_VIEW) do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      viewer: serializer.user(User.find_by(id: payload[:viewer_id])),
    }

    publish(message, schema: "github.marketplace.v0.HomepageView")
  end

  subscribe(::Marketplace::Events::LISTING_INSTALL) do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user: serializer.user(payload[:user]),
      marketplace_listing: serializer.marketplace_listing_from_database_id(payload[:listing_id]),
      billing_plan: serializer.marketplace_listing_plan_from_database_id(payload[:listing_plan_id]),
    }

    publish(message, schema: "github.marketplace.v0.ListingInstall", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(::Marketplace::Events::LISTING_INSTALL) do |payload|
    listing = Marketplace::Listing.find_by(id: payload[:listing_id])

    product_uuid = Billing::ProductUUID.find_by(
      product_type: "marketplace.listing_plan",
      product_key: payload[:listing_plan_id],
      billing_cycle: payload[:user]&.plan_duration,
    )

    message = {
      actor: serializer.user(payload[:user]),
      resource: "BillingProduct",
      resource_action: "create",
      resource_quantity_delta: payload[:quantity].to_i,
      resource_quantity_total: payload[:quantity].to_i,
      target_entity: {
        entity_type: :BILLING_PRODUCT,
        entity_id: product_uuid&.id,
      },
      target_entity_owner: serializer.user(payload[:user]),
      request_context: serializer.request_context(GitHub.context.to_hash),
    }
    publish(message, schema: "github.v1.UserBehavior", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(::Marketplace::Events::LISTING_STATE_CHANGE) do |payload|
    message = {
      marketplace_listing: serializer.marketplace_listing_from_database_id(payload[:listing_id]),
      previous_state: payload[:previous_state].to_s,
    }

    publish(message, schema: "github.marketplace.v0.ListingStateChange", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(::Marketplace::Events::LISTING_VIEW) do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      viewer: serializer.user(User.find_by(id: payload[:viewer_id])),
      listing: serializer.marketplace_listing(payload[:listing]),
    }

    publish(message, schema: "github.marketplace.v0.ListingView")
  end

  subscribe(::Marketplace::Events::PURCHASE_PURCHASED) do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:sender]),
      account: serializer.user(payload[:account]),
      subscription_item_id: payload[:subscription_item_id],
      marketplace_listing: serializer.marketplace_listing(payload[:marketplace_listing_plan].listing),
      marketplace_listing_plan: serializer.marketplace_listing_plan(payload[:marketplace_listing_plan]),
      order_preview_viewed_at: payload[:order_preview_viewed_at],
      order_preview_email_notification_sent_at: payload[:order_preview_email_notification_sent_at],
    }

    publish(message, schema: "github.marketplace.v0.PurchasePurchased", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(::Marketplace::Events::RECOMMENDED_LISTINGS_DISPLAYED) do |payload|
    listing_ids = payload[:marketplace_listing_ids]
    listings = Marketplace::Listing.where(id: listing_ids)

    serialized_listings = listings.map do |listing|
      serializer.marketplace_listing(listing)
    end

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user: serializer.user(payload[:client][:user]),
      marketplace_listings: serialized_listings,
    }

    publish(message, schema: "github.marketplace.v0.RecommendedListingsDisplayed", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(::Marketplace::Events::TRENDING_APPS_DISPLAYED) do |payload|
    listing_ids = payload[:marketplace_listing_ids]
    listings = Marketplace::Listing.where(id: listing_ids)

    serialized_listings = listings.map do |listing|
      serializer.marketplace_listing(listing)
    end

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user: serializer.user(payload[:client][:user]),
      marketplace_listings: serialized_listings,
    }

    publish(message, schema: "github.marketplace.v0.TrendingAppsDisplayed", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end
