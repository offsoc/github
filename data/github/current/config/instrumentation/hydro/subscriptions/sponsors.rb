# typed: strict
# frozen_string_literal: true

# These are Hydro event subscriptions related to the GitHub Sponsors program.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("sponsors.featured_sponsors") do |payload|
    message = {
      featured_count: payload[:featured_count],
      is_automated: payload[:settings].automatic?,
      is_enabled: payload[:settings].enabled?,
      maintainer: serializer.user(payload[:maintainer]),
    }

    publish(message, schema: "github.sponsors.v0.FeaturedSponsors")
  end

  subscribe("sponsors.repo_funding_links_button_toggle") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(payload[:repository]),
      owner: serializer.user(payload[:owner]),
      toggle_state: payload[:toggle_state],
      toggled_at: Time.zone.now,
    }
    publish(message, schema: "github.v1.FundingToggle", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("payout.bank_payout") do |payload|
    message = {
      sponsored_maintainer: serializer.user(payload[:sponsored_maintainer]),
      total_payout_amount_in_cents: payload[:total_payout_amount_in_cents],
      destination_account_type: serializer.destination_account_type(payload[:destination_account_type]),
      destination_account_id: payload[:destination_account_id],
      status: serializer.payout_status(payload[:status]),
      funding_instrument_type: serializer.funding_instrument_type(payload[:funding_instrument_type]),
      payout_id: payload[:payout_id],
      failure_code: payload[:failure_code],
    }

    publish(message, schema: "github.payouts.v0.BankPayout", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("sponsors.repo_funding_links_file_action") do |payload|
    action =
      case payload[:change_type]
      when Repositories::Push::ChangedFile::ADDITION
        "CREATE"
      when Repositories::Push::ChangedFile::DELETION
        "DELETE"
      when Repositories::Push::ChangedFile::MODIFYING, Repositories::Push::ChangedFile::RENAMING
        "UPDATE"
      end

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      repository: serializer.repository(payload[:repository]),
      owner: serializer.user(payload[:owner]),
      repo_platforms: payload[:platforms],
      action: action,
      occurred_at: Time.zone.now,
    }
    publish(message, schema: "github.v1.FundingFileAction", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("sponsors.custom_amount_settings_change") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      request_context: serializer.request_context(GitHub.context.to_hash),
      listing: serializer.sponsors_listing(payload[:listing]),
    }
    publish(message, schema: "github.sponsors.v1.CustomAmountSettingsChange", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.sponsors.display_agreement") do |payload|
    sponsorable = User.find_by_login(payload[:sponsorable_login])
    agreement = SponsorsAgreement.find(payload[:agreement_id])

    message = {
      viewer: serializer.user(payload[:client][:user]),
      agreement: serializer.sponsors_agreement(agreement),
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      listing: serializer.sponsors_listing(sponsorable.sponsors_listing),
      sponsorable: serializer.user(sponsorable),
    }

    publish(message, schema: "github.sponsors.v1.SponsorsDisplayAgreement", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("sponsors.agreement_sign") do |payload|
    listing = payload[:listing]
    message = {
      signatory: serializer.user(payload[:signatory]),
      agreement: serializer.sponsors_agreement(payload[:agreement]),
      request_context: serializer.request_context(GitHub.context.to_hash),
      listing: serializer.sponsors_listing(listing),
      sponsorable: serializer.user(listing.sponsorable),
    }

    publish(message, schema: "github.sponsors.v1.SponsorsAgreementSign", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("sponsors.invoiced_agreement_sign") do |payload|
    message = {
      signatory: serializer.user(payload[:signatory]),
      agreement_version: payload[:agreement_version],
      expires_on: payload[:expires_on].to_s,
      request_context: serializer.request_context(GitHub.context.to_hash),
      organization: serializer.organization(payload[:organization]),
    }

    publish(message, schema: "github.sponsors.v1.SponsorsInvoicedAgreementSign")
  end

  subscribe("sponsors.withdraw_agreement_signature") do |payload|
    listing = payload[:listing]
    message = {
      signatory: serializer.user(payload[:signatory]),
      agreement: serializer.sponsors_agreement(payload[:agreement]),
      request_context: serializer.request_context(GitHub.context.to_hash),
      listing: serializer.sponsors_listing(listing),
      sponsorable: serializer.user(listing.sponsorable),
      total_active_invoiced_sponsorships: payload[:total_active_invoiced_sponsorships],
    }

    publish(message, schema: "github.sponsors.v1.SponsorsWithdrawAgreementSignature", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe(/sponsors\.sponsor_sponsorship_(cancel|create)/) do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      request_context: serializer.request_context(GitHub.context.to_hash),
      sponsorship: serializer.sponsorship(payload[:sponsorship]),
      listing: serializer.sponsors_listing(payload[:listing]),
      tier: serializer.sponsors_tier(payload[:tier]),
      matchable: payload[:matchable],
      action: payload[:action],
      goal: serializer.sponsors_goal(payload[:goal]),
      first_time_sponsor: payload[:first_time_sponsor],
      first_time_sponsorable: payload[:first_time_sponsorable],
      invoiced: payload[:invoiced],
      listing_stafftools_metadata: serializer.sponsors_listing_stafftools_metadata(
        payload[:listing_stafftools_metadata],
      ),
      via_bulk_sponsorship: payload[:via_bulk_sponsorship],
      payment_source: payload[:payment_source],
    }

    publish(message, schema: "github.sponsors.v1.SponsorshipCreateCancel", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("sponsors.sponsor_sponsorship_expire") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      sponsorship: serializer.sponsorship(payload[:sponsorship]),
      listing: serializer.sponsors_listing(payload[:listing]),
      tier: serializer.sponsors_tier(payload[:tier]),
      listing_stafftools_metadata: serializer.sponsors_listing_stafftools_metadata(
        payload[:listing_stafftools_metadata],
      ),
    }

    publish(message, schema: "github.sponsors.v1.SponsorshipExpire")
  end

  subscribe("sponsors.undo_sponsorship_cancellation") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      sponsorship: serializer.sponsorship(payload[:sponsorship]),
      tier: serializer.sponsors_tier(payload[:tier]),
    }

    publish(message, schema: "github.sponsors.v1.UndoSponsorshipCancellation", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("sponsors.sponsorship_payment_complete") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      sponsorship: serializer.sponsorship(payload[:sponsorship]),
      listing: serializer.sponsors_listing(payload[:listing]),
      tier: serializer.sponsors_tier(payload[:tier]),
      matchable: payload[:matchable],
      goal: serializer.sponsors_goal(payload[:goal]),
      first_time_sponsor: payload[:first_time_sponsor],
      first_payment: payload[:first_payment],
      first_time_sponsorable: payload[:first_time_sponsorable],
      invoiced: payload[:invoiced],
      completed_at: payload[:completed_at],
      via_bulk_sponsorship: payload[:via_bulk_sponsorship],
      payment_source: payload[:payment_source],
    }

    publish(message, schema: "github.sponsors.v1.SponsorshipPaymentComplete", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("sponsors.sponsor_sponsorship_preference_change") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      request_context: serializer.request_context(GitHub.context.to_hash),
      previous_sponsorship: serializer.sponsorship(payload[:previous_sponsorship]),
      current_sponsorship: serializer.sponsorship(payload[:current_sponsorship]),
      listing: serializer.sponsors_listing(payload[:listing]),
      tier: serializer.sponsors_tier(payload[:tier]),
    }

    publish(message, schema: "github.sponsors.v1.SponsorshipPreferenceChange", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("sponsors.sponsor_sponsorship_tier_change") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      request_context: serializer.request_context(GitHub.context.to_hash),
      sponsorship: serializer.sponsorship(payload[:sponsorship]),
      listing: serializer.sponsors_listing(payload[:listing]),
      previous_tier: serializer.sponsors_tier(payload[:previous_tier]),
      current_tier: serializer.sponsors_tier(payload[:current_tier]),
      goal: serializer.sponsors_goal(payload[:goal]),
    }

    publish(message, schema: "github.sponsors.v1.SponsorshipTierChange", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("sponsors.sponsor_sponsorship_pending_change") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      request_context: serializer.request_context(GitHub.context.to_hash),
      sponsorship: serializer.sponsorship(payload[:sponsorship]),
      listing: serializer.sponsors_listing(payload[:listing]),
      old_tier: serializer.sponsors_tier(payload[:old_tier]),
      action: payload[:action].to_s,
      goal: serializer.sponsors_goal(payload[:goal]),
    }
    message[:new_tier] = serializer.sponsors_tier(payload[:new_tier]) if payload[:new_tier].present?

    publish(message, schema: "github.sponsors.v1.SponsorshipPendingChange", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("sponsors.sponsor_transfer_reversal") do |payload|
    message = {
      sponsorship: serializer.sponsorship(payload[:sponsorship]),
      listing: serializer.sponsors_listing(payload[:listing]),
      tier: serializer.sponsors_tier(payload[:tier]),
      currency_code: payload[:currency_code],
      total_amount_in_subunits: payload[:total_amount_in_subunits],
      payment_amount_in_subunits: payload[:payment_amount_in_subunits],
      match_amount_in_subunits: payload[:match_amount_in_subunits],
      listing_stafftools_metadata: serializer.sponsors_listing_stafftools_metadata(
        payload[:listing_stafftools_metadata],
      ),
    }

    publish(message, schema: "github.sponsors.v1.SponsorshipTransferReversal", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("sponsors.listing_state_change") do |payload|
    message = {
      action: payload[:action].to_s,
      user: serializer.user(payload[:user]),
      listing: serializer.sponsors_listing(payload[:listing]),
      listing_stafftools_metadata: serializer.sponsors_listing_stafftools_metadata(
        payload[:listing_stafftools_metadata],
      ),
      automated: payload[:automated],
      request_context: serializer.request_context(GitHub.context.to_hash),
    }

    publish(message, schema: "github.sponsors.v0.AccountStatusChange", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("sponsors.sponsored_developer_profile_update") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      sponsorable: serializer.user(payload[:sponsorable]),
      listing: serializer.sponsors_listing(payload[:listing]),
      listing_stafftools_metadata: serializer.sponsors_listing_stafftools_metadata(
        payload[:listing_stafftools_metadata],
      ),
      full_description: payload[:full_description],
      request_context: serializer.request_context(GitHub.context.to_hash),
      stripe_connect_account: serializer.stripe_connect_account(payload[:stripe_connect_account]),
    }

    publish(message, schema: "github.sponsors.v1.ProfileUpdate")
  end

  subscribe("sponsors.tier_publish") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      request_context: serializer.request_context(GitHub.context.to_hash),
      listing: serializer.sponsors_listing(payload[:listing]),
      tier: serializer.sponsors_tier(payload[:tier]),
    }
    publish(message, schema: "github.sponsors.v1.TierPublish", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("sponsors.sponsored_developer_tier_description_update") do |payload|
    message = {
      actor: serializer.user(payload[:actor]),
      request_context: serializer.request_context(GitHub.context.to_hash),
      listing: serializer.sponsors_listing(payload[:listing]),
      tier: serializer.sponsors_tier(payload[:tier]),
      current_tier_description: payload[:current_tier_description],
      previous_tier_description: payload[:previous_tier_description],
      sponsors_count_on_tier: payload[:sponsors_count_on_tier],
    }

    publish(message, schema: "github.sponsors.v1.TierDescriptionUpdate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("sponsors.update_tier_welcome_message") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      tier: serializer.sponsors_tier(payload[:tier]),
      listing: serializer.sponsors_listing(payload[:listing]),
      sponsorable: serializer.user(payload[:sponsorable]),
      total_active_sponsors: payload[:total_active_sponsors],
      actor: serializer.user(payload[:actor]),
    }

    publish(message, schema: "github.sponsors.v1.UpdateTierWelcomeMessage", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("sponsors.update_tier_repository") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      tier: serializer.sponsors_tier(payload[:tier]),
      listing: serializer.sponsors_listing(payload[:listing]),
      old_repository: serializer.repository(payload[:old_repository]),
      repository: serializer.repository(payload[:repository]),
      sponsorable: serializer.user(payload[:sponsorable]),
      total_active_sponsors: payload[:total_active_sponsors],
      actor: serializer.user(payload[:actor]),
      repository_owner: serializer.user(payload[:repository_owner]),
      old_repository_owner: serializer.user(payload[:old_repository_owner]),
    }

    publish(message, schema: "github.sponsors.v1.UpdateTierRepository")
  end

  subscribe("sponsors.display_tier_welcome_message") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      sponsor: serializer.user(payload[:sponsor]),
      tier: serializer.sponsors_tier(payload[:tier]),
      listing: serializer.sponsors_listing(payload[:listing]),
      sponsorable: serializer.user(payload[:sponsorable]),
    }

    publish(message, schema: "github.sponsors.v1.DisplayTierWelcomeMessage", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("sponsors.sponsored_developer_update_newsletter_send") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      sponsored_developer: serializer.user(payload[:sponsored_developer]),
      subject: payload[:subject],
      body: payload[:body],
    }

    publish(message, schema: "github.sponsors.v0.NewsletterSent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  # TODO: use in GitHub Sponsors stafftools
  subscribe("sponsors.waitlist_invite_sponsored_developer") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user: serializer.user(payload[:user]),
    }

    publish(message, schema: "github.sponsors.v0.InvitedFromWaitlist", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("sponsors.waitlist_join") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user: serializer.user(payload[:user]),
    }

    publish(message, schema: "github.sponsors.v0.JoinedWaitlist", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.sponsors.button_click") do |payload|
    sponsorable = User.find_by_login(payload[:sponsorable_login])

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      button: serializer.enum_from_string(payload[:button]),
      actor: serializer.user(payload[:client][:user]),
      user: serializer.user(sponsorable),
    }
    publish(message, schema: "github.sponsors.v0.ButtonClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.sponsors.repo_funding_links_link_click") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      actor: serializer.user(payload[:client][:user]),
      clicked_at: payload[:client][:timestamp].try(:to_i),
      selected_platform: payload[:platform],
      repo_platforms: payload[:platforms],
      repo_id: payload["repo_id"]&.to_i,
      owner_id: payload["owner_id"]&.to_i,
      is_mobile: payload["is_mobile"] == "true",
    }
    publish(message, schema: "github.v1.FundingLinkClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.sponsors.repo_funding_links_button_click") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash,
        overrides: browser_request_context_overrides(payload)),
      actor: serializer.user(payload[:client][:user]),
      clicked_at: payload[:client][:timestamp].try(:to_i),
      repo_platforms: payload[:platforms],
      repo_id: payload["repo_id"]&.to_i,
      owner_id: payload["owner_id"]&.to_i,
      is_mobile: payload["is_mobile"] == "true",
    }
    publish(message, schema: "github.v1.FundingButtonClick", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("sponsors.element_displayed") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      element: payload[:element],
      actor: serializer.user(payload[:actor]),
      sponsor: serializer.user(payload[:sponsor]),
      sponsorable: serializer.user(payload[:sponsorable]),
    }

    publish(message, schema: "github.sponsors.v0.ElementDisplayed", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("sponsors.profile_viewed") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      referring_account: serializer.user(payload[:referring_account]),
      origin: payload[:origin],
    }

    [:sponsorable, :sponsor].each do |attribute|
      next unless payload[attribute]

      message[attribute] = serializer.user(payload[attribute])
    end

    message[:source] = if payload[:source].present?
      payload[:source]
    else
      begin
        case URI.parse(GitHub.context[:referrer]).host
        when /twitter\.com/ then Sponsors::TrackingParameters::TWITTER_SOURCE
        when /facebook\.com/ then Sponsors::TrackingParameters::FACEBOOK_SOURCE
        when /mastodon\.social/ then Sponsors::TrackingParameters::MASTODON_SOURCE
        when /reddit\.com/ then Sponsors::TrackingParameters::REDDIT_SOURCE
        when /linkedin\.com/ then Sponsors::TrackingParameters::LINKEDIN_SOURCE
        end
      rescue URI::InvalidURIError
        nil
      end
    end

    publish(message, schema: "github.sponsors.v0.ProfileViewed", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("sponsors.checkout_viewed") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      sponsorable: serializer.user(payload[:sponsorable]),
      listing: serializer.sponsors_listing(payload[:listing]),
      sponsor: serializer.user(payload[:sponsor]),
      tier: serializer.sponsors_tier(payload[:tier]),
      checkout_type: payload[:checkout_type],
      sponsor_plan_duration: payload[:sponsor_plan_duration],
      is_sponsor_payment_method_valid: payload[:is_sponsor_payment_method_valid],
      is_first_time_sponsor: payload[:is_first_time_sponsor],
      is_data_collection_needed: payload[:is_data_collection_needed],
    }

    publish(message, schema: "github.sponsors.v0.CheckoutViewed", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("sponsors.sponsors_fraud_review_create") do |payload|
    message = {
      fraud_review: serializer.sponsors_fraud_review(payload[:fraud_review]),
      listing: serializer.sponsors_listing(payload[:listing]),
      sponsorable: serializer.user(payload[:sponsorable]),
      listing_stafftools_metadata: serializer.sponsors_listing_stafftools_metadata(
        payload[:listing_stafftools_metadata],
      ),
    }

    publish(message, schema: "github.sponsors.v1.SponsorsFraudReviewCreate", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("sponsors.sponsors_fraud_review_state_change") do |payload|
    message = {
      fraud_review: serializer.sponsors_fraud_review(payload[:fraud_review]),
      previous_state: payload[:previous_state].to_s,
      reviewer: serializer.user(payload[:reviewer]),
      sponsorable: serializer.user(payload[:sponsorable]),
      reviewed_at: payload[:reviewed_at],
    }

    publish(message, schema: "github.sponsors.v1.SponsorsFraudReviewStateChange", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("sponsors.goal_event") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      listing: serializer.sponsors_listing(payload[:listing]),
      goal: serializer.sponsors_goal(payload[:goal]),
      action: payload[:action],
      sponsorable: serializer.user(payload[:sponsorable]),
    }

    publish(message, schema: "github.sponsors.v1.GoalEvent", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.sponsors.explore_sorting_change") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      viewer: serializer.user(payload[:client][:user]),
      sort_option: payload[:sort_option],
    }

    publish(message, schema: "github.sponsors.v1.ExploreSortingChange")
  end

  subscribe("browser.sponsors.explore_pagination_click") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      viewer: serializer.user(payload[:client][:user]),
      current_page: payload[:current_page].to_i,
      new_page: payload[:new_page].to_i,
    }

    publish(message, schema: "github.sponsors.v1.ExplorePaginationClick")
  end

  subscribe("sponsors.stripe_connect_account_update") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      sponsors_listing: serializer.sponsors_listing(payload[:sponsors_listing]),
      stripe_connect_account: serializer.stripe_connect_account(payload[:stripe_connect_account]),
      sponsorable: serializer.user(payload[:sponsorable]),
      sponsors_listing_stafftools_metadata: serializer.sponsors_listing_stafftools_metadata(
        payload[:sponsors_listing_stafftools_metadata],
      ),
    }

    publish(message, schema: "github.sponsors.v1.StripeConnectAccountUpdate")
  end

  subscribe("sponsors.stripe_connect_account_create") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      sponsors_listing: serializer.sponsors_listing(payload[:sponsors_listing]),
      stripe_connect_account: serializer.stripe_connect_account(payload[:stripe_connect_account]),
      sponsorable: serializer.user(payload[:sponsorable]),
      sponsors_listing_stafftools_metadata: serializer.sponsors_listing_stafftools_metadata(
        payload[:sponsors_listing_stafftools_metadata],
      ),
    }

    publish(message, schema: "github.sponsors.v1.StripeConnectAccountCreate")
  end

  subscribe("sponsors.stripe_connect_account_delete") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      sponsors_listing: serializer.sponsors_listing(payload[:sponsors_listing]),
      stripe_connect_account: serializer.stripe_connect_account(payload[:stripe_connect_account]),
      sponsorable: serializer.user(payload[:sponsorable]),
      sponsors_listing_stafftools_metadata: serializer.sponsors_listing_stafftools_metadata(
        payload[:sponsors_listing_stafftools_metadata],
      ),
    }

    publish(message, schema: "github.sponsors.v1.StripeConnectAccountDelete")
  end

  subscribe("sponsors.active_stripe_connect_account_switch") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      sponsors_listing: serializer.sponsors_listing(payload[:sponsors_listing]),
      old_active_stripe_connect_account: serializer
        .stripe_connect_account(payload[:old_active_stripe_connect_account]),
      new_active_stripe_connect_account: serializer
        .stripe_connect_account(payload[:new_active_stripe_connect_account]),
      sponsorable: serializer.user(payload[:sponsorable]),
      sponsors_listing_stafftools_metadata: serializer.sponsors_listing_stafftools_metadata(
        payload[:sponsors_listing_stafftools_metadata],
      ),
    }

    publish(message, schema: "github.sponsors.v1.SponsorsListingActiveStripeConnectAccountSwitch")
  end

  subscribe("sponsors.sponsorship_transfer_failure") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      reason: payload[:reason],
      amount_in_cents: payload[:amount_in_cents],
      listing: serializer.sponsors_listing(payload[:listing]),
      sponsorship: serializer.sponsorship(payload[:sponsorship]),
      stripe_account_id: payload[:stripe_account_id],
      stripe_connect_account: serializer.stripe_connect_account(payload[:stripe_connect_account]),
      billing_transaction_id: payload[:billing_transaction_id],
    }

    publish(message, schema: "github.sponsors.v1.SponsorshipTransferFailure")
  end

  subscribe("browser.sponsors.explore_selected_account_change") do |payload|
    account = User.find_by_login(payload[:account_login])
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      viewer: serializer.user(payload[:client][:user]),
      account: serializer.user(account),
    }

    publish(message, schema: "github.sponsors.v1.ExploreSelectedAccountChange")
  end

  subscribe("browser.sponsors.explore_filter_change") do |payload|
    filter_option = payload[:filter_option]&.to_sym
    unless SponsorsExploreFilterSet::HYDRO_FILTER_OPTIONS.include?(filter_option)
      filter_option = :UNKNOWN
    end

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      viewer: serializer.user(payload[:client][:user]),
      filter_option: filter_option,
      enabled: payload[:enabled],
    }

    publish(message, schema: "github.sponsors.v1.ExploreFilterChange")
  end

  subscribe("sponsors.sponsors_listing_match_limit_reached") do |payload|
    message = {
      listing: serializer.sponsors_listing(payload[:listing]),
    }

    publish(message, schema: "github.sponsors.v0.SponsorsListingMatchLimitReached", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("sponsors.sponsor_fraud_flagged") do |payload|
    message = {
      fraud_review: serializer.sponsors_fraud_review(payload[:fraud_review]),
      listing: serializer.sponsors_listing(payload[:listing]),
      sponsorable: serializer.user(payload[:sponsorable]),
      sponsor: serializer.user(payload[:sponsor]),
      matched_current_client_id: payload[:matched_current_client_id],
      matched_current_ip: payload[:matched_current_ip],
      matched_historical_ip: payload[:matched_historical_ip],
      matched_historical_client_id: payload[:matched_historical_client_id],
      matched_current_ip_region_and_user_agent: payload[:matched_current_ip_region_and_user_agent],
    }

    publish(message, schema: "github.sponsors.v0.SponsorFraudFlagged", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("sponsors.tier_builder_interaction") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      interaction: payload[:interaction],
      submitted_actions: payload[:submitted_actions],
    }

    publish(message, schema: "github.sponsors.v1.TierBuilderInteraction", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("browser.sponsors.toggle_help_section") do |payload|
    current_tiers = SponsorsTier.where(id: payload[:tier_ids])
      .map { |tier| serializer.sponsors_tier(tier) }

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:client][:user]),
      open: payload[:open],
      current_tiers: current_tiers,
    }

    publish(message, schema: "github.sponsors.v1.ToggleHelpSection", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("sponsors.issue_manual_payout") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      listing: serializer.sponsors_listing(payload[:listing]),
      actor: serializer.user(payload[:actor]),
      reason: payload[:reason],
      stripe_account_id: payload[:stripe_account_id],
      stripe_connect_account: serializer.stripe_connect_account(payload[:stripe_connect_account]),
      sponsorable: serializer.user(payload[:sponsorable]),
      listing_stafftools_metadata: serializer.sponsors_listing_stafftools_metadata(
        payload[:listing_stafftools_metadata],
      ),
    }

    publish(message, schema: "github.sponsors.v1.IssueManualPayout", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("sponsors.early_fraud_warning") do |payload|
    message = {
      stripe_fraud_id: payload[:stripe_fraud_id],
      actionable: payload[:actionable],
      stripe_charge_id: payload[:stripe_charge_id],
      fraud_type: payload[:fraud_type],
      stripe_timestamp: payload[:stripe_timestamp],
      stripe_account_id: payload[:stripe_account_id],
      sponsors_listing: serializer.sponsors_listing(payload[:sponsors_listing]),
      stripe_connect_account: serializer.stripe_connect_account(payload[:stripe_connect_account]),
      sponsorable: serializer.user(payload[:sponsorable]),
      sponsors_listing_stafftools_metadata: serializer.sponsors_listing_stafftools_metadata(payload[:sponsors_listing_stafftool_metadata]),
      sponsor: serializer.user(payload[:sponsor]),
    }.freeze

    publish(message, schema: "github.sponsors.v1.EarlyFraudWarning", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end

  subscribe("sponsors.sponsorship_transactions_export") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      listing: serializer.sponsors_listing(payload[:listing]),
      sponsorable: serializer.user(payload[:sponsorable]),
    }

    publish(message, schema: "github.sponsors.v1.SponsorshipTransactionsExport")
  end

  subscribe("sponsors.fraud_system_action_prohibited") do |payload|
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      actor: serializer.user(payload[:actor]),
      action: payload[:action],
      enforced: payload[:enforced],
      trust_target: payload[:trust_target],
      trust_level: payload[:trust_level],
      sponsor: serializer.user(payload[:sponsor]),
      sponsorable: serializer.user(payload[:sponsorable]),
      listing: serializer.sponsors_listing(payload[:listing]),
      listing_stafftools_metadata: serializer.sponsors_listing_stafftools_metadata(payload[:listing_stafftools_metadata]),
      tier: serializer.sponsors_tier(payload[:tier]),
    }

    publish(message, schema: "github.sponsors.v1.FraudSystemActionProhibited")
  end

  subscribe("sponsors.bulk_sponsorships_import") do |payload|
    message = {
      total_rows: payload[:total_rows],
      total_rows_imported: payload[:total_rows_imported],
      total_rows_with_error: payload[:total_rows_with_error],
      total_rows_over_limit: payload[:total_rows_over_limit],
      total_errors: payload[:total_errors],
      file_error: payload[:file_error],
      included_headers: payload[:included_headers],
      frequency: payload[:frequency],
      error_counts: payload[:error_counts],
    }
    publish(message, schema: "github.sponsors.v1.BulkSponsorshipsImport")
  end

  subscribe("sponsors.invoiced_billing_account_form_submit") do |payload|
    message = {
      sponsor: serializer.user(payload[:sponsor]),
      actor: serializer.user(payload[:actor]),
      request_context: serializer.request_context(GitHub.context.to_hash),
    }

    publish(message, schema: "github.sponsors.v1.InvoicedBillingAccountFormSubmit")
  end

  subscribe("sponsors.sponsorship_cancel_request") do |payload|
    message = {
      sponsorship: serializer.sponsorship(payload[:sponsorship]),
      tier: serializer.sponsors_tier(payload[:tier]),
      listing: serializer.sponsors_listing(payload[:listing]),
      listing_stafftools_metadata: serializer.sponsors_listing_stafftools_metadata(
        payload[:listing_stafftools_metadata]
      ),
      actor: serializer.user(payload[:actor]),
      sponsor: serializer.user(payload[:sponsor]),
      sponsorable: serializer.user(payload[:sponsorable]),
      reason: payload[:reason],
      forced: payload[:forced],
    }

    publish(message, schema: "github.sponsors.v1.SponsorshipCancelRequest")
  end

  subscribe("sponsors.sponsors_invoiced_account_stripe_invoice") do |payload|
    message = {
      action: payload[:action],
      invoice: serializer.sponsors_stripe_invoice(payload[:invoice]),
    }

    publish(message, schema: "github.sponsors.v1.SponsorsInvoicedAccountStripeInvoice")
  end

  subscribe("sponsors.sponsors_invoiced_account_stripe_customer_create") do |payload|
    message = {
      organization: serializer.organization(payload[:organization]),
      actor: serializer.user(payload[:actor]),
      stripe_customer_id: payload[:stripe_customer_id],
    }

    publish(message, schema: "github.sponsors.v1.SponsorsInvoicedAccountStripeCustomerCreate")
  end
end
