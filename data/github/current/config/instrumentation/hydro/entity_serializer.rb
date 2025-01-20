# typed: true
# frozen_string_literal: true

# Common entity serializer for Hydro payload fields
module Hydro
  module EntitySerializer
    include Hydro::EntitySerializer::ExemptionsDependency

    # This list is a mirror of the values declared in the following schemas:
    #   https://github.com/github/hydro-schemas/blob/master/github/v1/entities/news_feed_event.proto
    #   https://github.com/github/hydro-schemas/blob/master/github/v1/entities/news_feed_event_group.proto
    #
    # If you change NEWS_FEED_EVENT_TYPES, you must also update those schemas and vice versa
    NEWS_FEED_EVENT_TYPES = [:ATOM, :COMMIT_COMMENT, :CREATE, :DELETE, :DEPLOYMENT,
      :DOWNLOAD, :FOLLOW, :FORK, :GOLLUM, :ISSUE_COMMENT, :ISSUES, :MEMBER, :PUBLIC,
      :PULL_REQUEST_REVIEW_COMMENT, :PULL_REQUEST, :PUSH, :RELEASE, :WATCH, :SPONSOR, :PULL_REQUEST_REVIEW].freeze

    AUTH_TYPE_MAPPING = {
      anon: :ANON,
      oauth: :OAUTH,
      oauth_key_secret: :OAUTH_SERVER_TO_SERVER,
      basic: :BASIC,
      jwt: :JWT,
      personal_access_token: :PERSONAL_ACCESS_TOKEN,
      programmatic_access_token: :PROGRAMMATIC_ACCESS_TOKEN,
      integration: :INTEGRATION_USER_TO_SERVER,
      integration_installation: :INTEGRATION_SERVER_TO_SERVER,
    }

    class << self # rubocop:disable Style/ClassMethodsDefinitions
      extend T::Sig
      # Public: Map a string or symbol to an enum value. This method checks to see if an enum value
      # is valid and, if not, returns the default. The goal is to avoid throwing TypeErrors and
      # losing events due to invalid enum values in production.
      #
      # Returns a valid symbol enum value or nil.
      def enum(value:, type:, default:, raises: Rails.env.test?)
        value = value&.to_s&.upcase&.to_sym || default
        if type.resolve(value)
          return value
        end

        error = Hydro::Protobuf::InvalidEnumValueError.new("Invalid value #{value.inspect} for enum #{type}")
        if raises
          raise error
        else
          GitHub.report_hydro_error(error)
          default
        end
      end

      # Public: Force a string to UTF-8 encoding. Strips out any invalid UTF-8 characters.
      def force_utf8(string)
        string&.dup&.force_encoding(Encoding::UTF_8)&.scrub!
      end

      def app(app, overrides: {})
        return if app.nil?

        payload = {
          app_type: app.class.name.underscore.upcase,
          id: app.id,
          name: app.name,
          url: app.url,
          created_at: app.created_at,
          callback_urls: ActiveRecord::Base.connected_to(role: :reading) { app.application_callback_urls.map(&:url) },
        }

        case app
        when Integration
          domain = begin
            URI(app.url).hostname
          rescue ArgumentError, URI::InvalidURIError
          end

          payload.merge!(
            domain: domain,
            owner_id: app.owner_id,
            integration_bot_id: app.bot_id,
            integration_is_public: app.public?,
            description: app.description,
            slug: app.slug,
          )
        when OauthApplication
          payload.merge!(
            domain: app.domain,
            owner_id: app.user_id,
          )
        end

        payload.merge(overrides)
      end

      def repository_action(global_action_id)
        _, action_id = Platform::Helpers::NodeIdentification.from_global_id(global_action_id)
        action = RepositoryAction.find_by(id: action_id)
        return if action.nil?

        {
          id: action.id,
          name: action.name,
          description: action.description,
          color: action.color,
          icon_name: action.icon_name,
          path: action.path,
          repository_id: action.repository_id,
          created_at: action.created_at,
          action_is_featured: action.featured?,
          action_is_public: action.repository&.public?,
          readme: action.readme&.data,
        }
      end

      def repository_image(repo_image)
        return unless repo_image

        {
          id: repo_image.id,
          name: repo_image.name,
          content_type: repo_image.content_type,
          size: repo_image.size,
          uploader_id: repo_image.uploader_id,
          repository_id: repo_image.repository_id,
          created_at: repo_image.created_at,
          updated_at: repo_image.updated_at,
          role: repo_image.role.upcase.to_sym, # e.g., :OPEN_GRAPH
        }
      end

      def repository_owner(repository)
        return unless repository

        user(repository.owner)
      end

      def user_repository_member?(repository, user)
        return false unless repository && user

        repository.member?(user)
      end

      def release(release)
        return unless release

        {
          id: release.id,
          name: release.name,
          tag_name: release.tag_name,
          author_id: release.author_id,
          repository_id: release.repository_id,
          state: release.state.upcase,
          target_commitish: release.target_commitish,
          prerelease: release.prerelease,
          created_at: release.created_at,
          updated_at: release.updated_at,
          published_at: release.published_at,
          generated_notes_state: release.generated_notes_state,
        }
      end

      def string_bytesize(string)
        string.try(:bytesize) || 0
      end

      def marketplace_listing_from_database_id(listing_id)
        listing = Marketplace::Listing.find_by(id: listing_id)
        return if listing.nil?

        marketplace_listing(listing)
      end

      def marketplace_listing(listing)
        return if listing.nil?

        # This type needs to match one of the defined MarketplaceListing::Type
        # Enums in Hydro.
        listing_type = if listing.respond_to?(:listable_is_integration?) && listing.listable_is_integration?
          "github_app"
        elsif listing.respond_to?(:listable_is_oauth_application?) && listing.listable_is_oauth_application?
          "oauth_app"
        elsif listing.is_a?(SponsorsListing)
          "user"
        else
          "unknown"
        end

        {
          id: listing.id,
          name: listing.name,
          slug: listing.slug,
          type: listing_type,
          app_id: listing.listable_id,
          current_state: listing.current_state.name.to_s,
          primary_category_id: listing.primary_category_id,
          secondary_category_id: listing.secondary_category_id,
          copilot: listing.copilot_app
        }
      end

      def marketplace_listing_plan_from_database_id(listing_plan_id)
        listing_plan = Marketplace::ListingPlan.find_by(id: listing_plan_id)
        return if listing_plan.nil?

        marketplace_listing_plan(listing_plan)
      end

      def marketplace_listing_plan(listing_plan)
        return if listing_plan.nil?

        MarketplaceListingPlanEntitySerializer.serialize(listing_plan)
      end

      def owned_organization_count(user)
        user&.owned_organization_ids&.size
      end

      def sponsors_agreement(agreement)
        return unless agreement

        {
          version: agreement.version,
          kind: agreement.hydro_kind,
        }
      end

      def stripe_connect_account(stripe_account)
        return unless stripe_account

        {
          id: stripe_account.id,
          stripe_account_id: stripe_account.stripe_account_id,
          billing_country: stripe_account.billing_country,
          country: stripe_account.country,
          verification_status: stripe_account.hydro_verification_status,
          payout_interval: stripe_account.hydro_payout_interval,
          active: stripe_account.active?,
          charges_enabled: stripe_account.charges_enabled?,
          payouts_enabled: stripe_account.payouts_enabled?,
          default_currency: stripe_account.default_currency,
          details_submitted: stripe_account.details_submitted?,
          transfers_capability: stripe_account.transfers_capability?,
          card_payments_capability: stripe_account.card_payments_capability?,
          tax_reporting_capability: stripe_account.tax_reporting_capability?,
          requirements_eventually_due: stripe_account.requirements_eventually_due?,
          requirements_currently_due: stripe_account.requirements_currently_due?,
          requirements_past_due: stripe_account.requirements_past_due?,
          w8_or_w9_verified: stripe_account.w8_or_w9_verified?,
          disabled_reason: stripe_account.disabled_reason,
          email: stripe_account.email,
          sponsors_listing_id: stripe_account.sponsors_listing_id,
          sponsorable_id: stripe_account.sponsorable_id,
          deleted_at: stripe_account.deleted_at,
          w8_or_w9_requested_at: stripe_account.w8_or_w9_requested_at,
        }
      end

      def sponsors_listing(listing)
        return if listing.nil?

        {
          id: listing.id,
          slug: listing.slug,
          sponsorable_id: listing.sponsorable_id,
          current_state: listing.hydro_current_state,
          featured_state: listing.hydro_featured_state,
          fiscal_host: listing.hydro_fiscal_host,
          country_of_residence: listing.country_of_residence,
          billing_country: listing.billing_country,
          custom_tiers_allowed: true,
          suggested_custom_tier_amount_in_cents: listing.suggested_custom_tier_amount_in_cents,
          published_recurring_tier_count: listing.published_recurring_tier_count,
          published_one_time_tier_count: listing.published_one_time_tier_count,
        }
      end

      def sponsors_listing_stafftools_metadata(stafftools_metadata)
        return unless stafftools_metadata

        {
          id: stafftools_metadata.id,
          sponsors_listing_id: stafftools_metadata.sponsors_listing_id,
          sponsorable_created_at: stafftools_metadata.sponsorable_created_at,
        }
      end

      sig { params(invoice: Billing::Stripe::Invoice).returns(T.nilable(T::Hash[Symbol, T.untyped])) }
      def sponsors_stripe_invoice(invoice)
        {
          stripe_invoice_id: invoice.id,
          stripe_customer_id: invoice.customer_id,
          creator: Hydro::EntitySerializer.user(invoice.creator),
          organization: Hydro::EntitySerializer.organization(invoice.receiving_org),
          created: invoice.created_at,
          status: invoice.status,
          currency: invoice.currency,
          total_amount_in_subunits: invoice.total.cents,
          fee_amount_in_subunits: invoice.service_fee.cents,
          amount_due_in_subunits: invoice.amount_due.cents,
          amount_paid_in_subunits: invoice.amount_paid.cents,
          paid: invoice.paid?,
        }
      end

      def sponsors_tier(tier)
        return if tier.nil?

        current_state = tier.current_state_name.to_s.upcase
        unless %w(DRAFT PUBLISHED RETIRED CUSTOM INVOICED).include?(current_state)
          current_state = "STATE_UNKNOWN"
        end

        {
          id: tier.id,
          monthly_price_in_cents: tier.monthly_price_in_cents,
          current_state: current_state,
          frequency: tier.frequency.upcase,
          has_welcome_message: tier.has_welcome_message?,
          repository_id: tier.repository_id,
        }
      end

      def sponsorship(sponsorship)
        return if sponsorship.nil?

        {
          privacy_level: sponsorship.privacy_level,
          is_sponsor_opted_in_to_email: sponsorship.is_sponsor_opted_in_to_email,
          sponsor: Hydro::EntitySerializer.user(sponsorship.sponsor),
          maintainer: Hydro::EntitySerializer.user(sponsorship.sponsorable),
          id: sponsorship.id,
          skip_proration: sponsorship.skip_proration?,
          sponsorable_metadata: sponsorship.latest_sponsorable_metadata,
        }
      end

      def sponsors_goal(goal)
        return if goal.blank?

        {
          id: goal.id,
          kind: goal.kind,
          state: goal.current_state.name,
          target_value: goal.target_value,
          description: goal.description,
        }
      end

      def billing_type(billing_type_string)
        case billing_type_string
        when "card"
          :SELF_SERVE
        when "invoice"
          :INVOICED
        else
          :UNKNOWN
        end
      end

      def account_type(account_type_string)
        case account_type_string
        when "business"
          :BUSINESS
        when "user"
          :USER
        else
          :UNKNOWN
        end
      end

      def destination_account_type(account_type_string)
        case account_type_string
        when "stripe_connect"
          :STRIPE_CONNECT
        else
          :UNKNOWN_DESTINATION_ACCOUNT_TYPE
        end
      end

      def payment_gateway(payment_gateway_string)
        case payment_gateway_string
        when "stripe"
          :STRIPE
        when "paypal"
          :PAYPAL
        when "invoice"
          :INVOICE
        else
          :UNKNOWN_PAYMENT_GATEWAY
        end
      end

      def payout_status(status_string)
        case status_string
        when "created"
          :CREATED
        when "failed"
          :FAILED
        else
          :UNKNOWN_STATUS
        end
      end

      def funding_instrument_type(instrument_type_string)
        case instrument_type_string
        when "bank_account"
          :BANK_ACCOUNT
        when "card"
          :CARD
        else
          :UNKNOWN_FUNDING_INSTRUMENT_TYPE
        end
      end

      def auth_type(auth_type)
        AUTH_TYPE_MAPPING[auth_type&.to_sym]
      end

      # ex V1 API
      # {
      #   "solved":false,
      #   "score":0,
      #   "user_ip":"4.53.133.38",
      #   "other":
      #   {
      #     "session":"1735ab185935956b9.7894433602",
      #     "time_verified":1521583567,
      #     "attempted":true,
      #     "session_created":"2018-03-20T22:05:07+00:00",
      #     "check_answer":"2018-03-20T22:05:31+00:00",
      #     "verified":"2018-03-20T22:06:07+00:00",
      #     "previously_verified":true,
      #     "session_timed_out":true,
      #     "suppressed":true,
      #     "suppress_limited":true,
      #   }
      # }
      # ex V4 API
      #
      #{
      #     "session_details": {
      #         "solved": false,
      #         "session": "22612c147bb418c8.2570749403",
      #         "session_created": "2021-08-29T23:13:03+00:00",
      #         "check_answer": "2021-08-29T23:13:16+00:00",
      #         "verified": "2021-08-30T00:19:32+00:00",
      #         "attempted": true,
      #         "security_level": 30,
      #         "session_is_legit": false,
      #         "previously_verified": true,
      #         "session_timed_out": true,
      #         "suppress_limited": false,
      #         "theme_arg_invalid": false,
      #         "suppressed": false,
      #         "punishable_actioned": false,
      #         "telltale_user": "eng-1362-game3-py-0.",
      #         "failed_low_sec_validation": false,
      #         "lowsec_error": null,
      #         "lowsec_level_denied": null,
      #         "ua": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36",
      #         "ip_rep_list": null,
      #         "game_number_limit_reached": false,
      #         "user_language_shown": "en",
      #         "telltale_list": [
      #             "eng-1362",
      #             "eng-1362-game3-py-0."
      #         ],
      #         "optional": null
      #     },
      #     "fingerprint": {
      #         "browser_characteristics": {
      #             "browser_name": "Chrome",
      #             "browser_version": "92.0.4515.159",
      #             "color_depth": 24,
      #             "session_storage": false,
      #             "indexed_database": false,
      #             "canvas_fingerprint": 1652956012
      #         },
      #         "device_characteristics": {
      #             "operating_system": null,
      #             "operating_system_version": null,
      #             "screen_resolution": [
      #                 1920,
      #                 1080
      #             ],
      #             "max_resolution_supported": [
      #                 1920,
      #                 1057
      #             ],
      #             "behavior": false,
      #             "cpu_class": "unknown",
      #             "platform": "MacIntel",
      #             "touch_support": false,
      #             "hardware_concurrency": 8
      #         },
      #         "user_preferences": {
      #             "timezone_offset": -600
      #         }
      #     },
      #     "ip_intelligence": {
      #         "user_ip": "10.211.121.196",
      #         "is_tor": false,
      #         "is_vpn": true,
      #         "is_proxy": true,
      #         "is_bot": true,
      #         "country": "AU",
      #         "region": "New South Wales",
      #         "city": "Sydney",
      #         "isp": "Amazon.com",
      #         "public_access_point": false,
      #         "connection_type": "Data Center",
      #         "latitude": "-38.85120035",
      #         "longitude": "106.21220398",
      #         "timezone": "Australia/Sydney"
      #     }
      # }
      #
      # This handles both V1 and V4 APIs and will replace
      # `def funcaptcha_response` after the `octocaptcha_arkose_V4_api_migration`
      # feature flag is removed
      #
      # V1 top level keys - "solved", "score", "user_ip", "other"
      # V4 top level keys - "session_details", "fingerprint", "ip_intelligence"
      def funcaptcha_response_next(response, overrides: {})
        return unless response.present?

        new_response = response.slice("solved", "score", "user_ip", "error")

        if response["other"].present?
          new_response.merge!(response["other"].slice(
            "session",
            "time_verified",
            "attempted",
            "session_created",
            "check_answer",
            "verified",
            "previously_verified",
            "session_timed_out",
            "suppressed",
            "suppress_limited",
          ))
        end

        if response["session_details"].present?
          new_response["solved"] = response["session_details"]["solved"] if new_response["solved"].nil?

          # When funcaptcha response is stored in KV, the Timestamp fields are saved as string, so we need to parse the value
          %w[session_created check_answer verified].each do |field|
            response["session_details"][field] = Time.parse(response["session_details"][field]) if response["session_details"][field].is_a?(String)
          end

          new_response.merge!(response["session_details"].slice(
            "session",
            "attempted",
            "session_created",
            "check_answer",
            "verified",
            "previously_verified",
            "session_timed_out",
            "suppressed",
            "suppress_limited",
          ))

          verified = response["session_details"]["verified"]
          new_response["time_verified"] = Time.parse(verified).to_i if verified.is_a?(String)
          new_response["time_verified"] = verified.to_i if verified.is_a?(Time)
        end

        if response["ip_intelligence"].present?
          new_response["user_ip"] = response["ip_intelligence"]["user_ip"]
        end
        new_response.merge(overrides)
      end

      def arkose_captcha_response_v4(response, overrides: {})
        return unless response.present?

        new_response = response.slice("error")

        if response["session_details"].present?
          new_response["session_details"] = response["session_details"].slice(
            "solved",
            "session",
            "session_created",
            "check_answer",
            "verified",
            "attempted",
            "security_level",
            "session_is_legit",
            "previously_verified",
            "session_timed_out",
            "suppress_limited",
            "theme_arg_invalid",
            "suppressed",
            "punishable_actioned",
            "telltale_user",
            "failed_low_sec_validation",
            "lowsec_error",
            "lowsec_level_denied",
            "ua",
            "ip_rep_list",
            "game_number_limit_reached",
            "user_language_shown"
          )

          new_response["session_details"]["telltale_list_v2"] = response["session_details"]["telltale_list"]
        end

        if response["fingerprint"].present?
          new_response["fingerprint"] = {}

          if response["fingerprint"]["browser_characteristics"].present?
            new_response["fingerprint"]["browser_characteristics"] = response["fingerprint"]["browser_characteristics"].slice(
              "browser_name",
              "browser_version",
              "color_depth",
              "session_storage",
              "indexed_database",
              "canvas_fingerprint"
            )
          end

          if response["fingerprint"]["device_characteristics"].present?
            new_response["fingerprint"]["device_characteristics"] = response["fingerprint"]["device_characteristics"].slice(
              "operating_system",
              "operating_system_version",
              "screen_resolution",
              "max_resolution_supported",
              "behavior",
              "cpu_class",
              "platform",
              "touch_support",
              "hardware_concurrency"
            )
          end

          if response["fingerprint"]["user_preferences"].present?
            new_response["fingerprint"]["user_preferences"] = response["fingerprint"]["user_preferences"].slice(
              "timezone_offset",
            )
          end
        end

        if response["ip_intelligence"].present?
          new_response["ip_intelligence"] = response["ip_intelligence"].slice(
            "user_ip",
            "is_tor",
            "is_vpn",
            "is_proxy",
            "country",
            "region",
            "city",
            "isp",
            "public_access_point",
            "connection_type",
            "latitude",
            "longitude",
            "timezone"
          )
          new_response["ip_intelligence"]["is_bot_v2"] = response["ip_intelligence"]["is_bot"]
        end

        new_response.merge(overrides)
      end

      # ex
      # {
      #   "solved":false,
      #   "score":0,
      #   "user_ip":"4.53.133.38",
      #   "other":
      #   {
      #     "session":"1735ab185935956b9.7894433602",
      #     "time_verified":1521583567,
      #     "attempted":true,
      #     "session_created":"2018-03-20T22:05:07+00:00",
      #     "check_answer":"2018-03-20T22:05:31+00:00",
      #     "verified":"2018-03-20T22:06:07+00:00",
      #     "previously_verified":true,
      #     "session_timed_out":true,
      #     "suppressed":true,
      #     "suppress_limited":true,
      #   }
      # }
      #
      def funcaptcha_response(response, overrides: {})
        return unless response.present?
        if GitHub.flipper[:octocaptcha_arkose_V4_api_migration].enabled?
          return funcaptcha_response_next(response)
        end

        # When funcaptcha response is stored in KV, the Timestamp fields are saved as string, so we need to parse the value
        if response["other"].present?
          %w[session_created check_answer verified].each do |field|
            response["other"][field] = Time.parse(response["other"][field]) if response["other"][field].is_a?(String)
          end
        end

        new_response = response.slice("solved", "score", "user_ip", "error")

        if response["other"].present?
          new_response.merge!(response["other"].slice(
            "session",
            "time_verified",
            "attempted",
            "session_created",
            "check_answer",
            "verified",
            "previously_verified",
            "session_timed_out",
            "suppressed",
            "suppress_limited",
          ))
        end
        new_response.merge(overrides)
      end

      def search_type(unfiltered_search_types)
        unfiltered_search_types.map do |val|
          SEARCH_TYPES.include?(val) ? val : "unknown"
        end
      end
      SEARCH_TYPES = %w(audit_log blog code commit gist gist_quicksearch issue marketplace project pull_request registry_package repo topic user user_login wiki codenav_find_references codenav_find_definition).freeze

      def integration(entity, overrides: {})
        return if entity.nil?

        domain = begin
          URI(entity.url).hostname
        rescue ArgumentError, URI::InvalidURIError
        end

        {
          id: entity.id,
          name: entity.name,
          domain: domain,
          url: entity.url,
          callback_urls: entity.application_callback_urls.map(&:url),
          owner_id: entity.owner_id,
          bot_id: entity.bot_id,
          public: entity.public?,
          created_at: entity.created_at,
          description: entity.description,
          slug: entity.slug,
        }.merge(overrides)
      end

      def integration_installation(entity, overrides: {})
        return if entity.nil?

        if entity.has_key? :business
          target_id = entity[:business_id]
          target_name = entity[:business]
          target_type = "Business"
        elsif entity.has_key? :org
          target_id = entity[:org_id]
          target_name = entity[:org]
          target_type = "Organization"
        else
          target_id = entity[:user_id]
          target_name = entity[:user]
          target_type = "User"
        end

        {
          id: entity[:installation_id],
          target_type: target_type,
          target_id: target_id,
          target_name: target_name,
          repository_selection: entity[:repository_selection],
        }.merge(overrides)
      end

      def integration_installation_for_graphql(entity, overrides: {})
        return if entity.nil?

        {
          id: entity.id,
          target_type: entity.target_type,
          target_id: entity.target_id,
          repository_selection: entity.repository_selection,
        }.merge(overrides)
      end

      def gist(gist, overrides: {})
        {
          id: gist.id,
          global_relay_id: gist.global_relay_id.to_s,
          repo_name: gist.repo_name.to_s,
          description: gist.description.to_s,
          visibility: gist.visibility.upcase,
          parent_id: gist.parent_id,
          created_at: gist.created_at,
          owner_id: gist.user_id,
        }.merge(overrides)
      end

      def gist_files(gist, gist_files)
        return unless gist
        return unless gist_files

        gist_files.map do |file|
          {
            filename: file.display_name,
            mime_type: file.mime_type.to_s,
            language: file.language.try(:name).to_s,
            raw_url: gist.raw_url_for(file).to_s,
            size: file.size,
          }
        end
      end

      def specimen_data(data)
        return if data.nil?
        trimmed_data = data[0..GitHub::SpamChecker::GIST_MAX_FILE_DATA].force_encoding(Encoding::UTF_8).scrub
        specimen = Spam::Specimen.new(trimmed_data)
        {
          raw_data: trimmed_data,
          clean_data: specimen.data[0..GitHub::SpamChecker::GIST_MAX_FILE_DATA],
          clean_text: specimen.text,
          has_repeated_links: specimen.has_repeated_links?,
          nothing_but_image_links: specimen.nothing_but_image_links?,
          uses_spacing_tricks: specimen.uses_spacing_tricks?,
        }
      end

      def gist_specimen_files(gist_files)
        return unless gist_files

        gist_files.map do |file|
          specimen_data file.data
        end.compact
      end

      def gist_specimen_files_path(gist_files)
        return unless gist_files

        gist_files.map do |file|
          specimen_data file.name
        end.compact
      end

      def gist_comment(gist_comment)
        return if gist_comment.nil?

        {
          id: gist_comment.id,
          global_relay_id: gist_comment.global_relay_id,
          body: gist_comment.body,
          formatter: gist_comment.formatter,
          created_at: gist_comment.created_at,
          updated_at: gist_comment.updated_at,
        }
      end

      def gist_comment_gist_fields(gist_comment)
        return {} unless gist_comment&.gist.present?

        gist = gist_comment.gist
        first_file = gist.files.first

        {
          all_comments_by_gist_author: gist.all_comments_by_author?,
          specimen_gist_description: specimen_data(gist.description),
          specimen_gist_first_path: specimen_data(first_file&.name),
          specimen_gist_content: specimen_data(first_file&.data),
        }
      end

      def hovercard_context_string(subject_str)
        type_s, id = subject_str&.split(":")

        # The lookup against SUBJECT_PREFIX_MAP is intentional to ensure that the type_s is supported
        subject_type = Hovercard::SUBJECT_PREFIX_MAP[type_s]&.model_name&.param_key if type_s

        {
          type: enum(
            type: Hydro::Schemas::Github::V1::Entities::HovercardContext::Type,
            value: subject_type,
            default: :NONE

          ),
          id: id&.to_i,
        }
      end

      def ip_address(ip, overrides: {})
        ip = Hydro::IpAddr.new(ip)
        return unless ip.valid?

        {
          address: ip.to_s,
          version: ip.version || :UNKNOWN,
          v4_int: ip.ipv4_int,
          v6_int: ip.ipv6_int,
        }.merge(overrides)
      end

      def actor_location(location)
        return if location.blank?

        {
          city: location[:city],
          region: location[:region],
          region_name: location[:region_name],
          country_code: location[:country_code],
          country_name: location[:country_name],
          postal_code: location[:postal_code],
          latitude: location_latitude(location),
          longitude: location_longitude(location),
        }
      end

      def location_latitude(location)
        return location[:latitude] if location[:latitude].present?
        return location[:location][:lat] if location[:location].present?
        nil
      end

      def location_longitude(location)
        return location[:longitude] if location[:longitude].present?
        return location[:location][:lon] if location[:location].present?
        nil
      end

      def commit(commit, overrides: {})
        return unless commit&.repository

        {
          global_relay_id: commit.global_relay_id,
          oid: commit.oid,
          repository_id: commit.repository.id,
        }.merge(overrides)
      end

      def commit_comment(comment)
        return unless comment

        {
          id: comment.id,
          global_relay_id: comment.global_relay_id,
          oid: comment.commit&.oid,
          repository_id: comment.repository_id,
          author_id: comment.user_id,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
        }
      end

      def commit_diff_stats(diff_stats)
        return unless diff_stats

        {
          lines_added: diff_stats.lines_added,
          lines_deleted: diff_stats.lines_deleted,
          files_modified: diff_stats.files_modified,
          files_added: diff_stats.files_added,
          files_deleted: diff_stats.files_deleted,
          lines_added_by_language: diff_stats.lines_added_by_language,
          lines_deleted_by_language: diff_stats.lines_deleted_by_language,
        }
      end

      def issue(issue, overrides: {})
        return if issue.nil?

        result = {
          id: issue.id,
          global_relay_id: issue.global_relay_id,
          number: issue.number,
          issue_state: issue.state.upcase,
          issue_state_reason: issue.state_reason&.upcase,
          body_size: issue.body&.size,
          updated_at: issue.updated_at,
          created_at: issue.created_at,
          closed_at: issue.closed_at,
          id_value: issue.id,
        }.merge(overrides)

        if GitHub.flipper[:project_events_repository_id].enabled?(issue.repository)
          result.merge(repository_id: issue.repository_id)
        else
          result
        end
      end

      def issue_domain(issue, overrides: {})
        issue(issue, **overrides)
          .slice(:id, :global_relay_id, :number, :created_at, :id_value)
          .merge(title: issue.title,
                 body: issue.body,
                 labels: issue.labels.map { |label| label(label) },
                 owner_id: issue.owner&.id)
      end

      def issue_template(template, overrides: {})
        return if template.nil?

        {
          name_hash: Digest::SHA256.hexdigest(template.name.to_s),
          title: template.uses?(:title),
          label: template.uses?(:labels),
          assignee: template.uses?(:assignees),
          is_issue_form: template.structured?,
          project: template.uses?(:projects),
          project_count: template.structured? ? template.project_count : nil,
          issue_type: template.type.present?,
        }.merge(overrides)
      end

      def discussion(discussion, overrides: {})
        return if discussion.nil?

        {
          id: discussion.id,
          global_relay_id: discussion.global_relay_id,
          number: discussion.number,
          body_size: discussion.body&.size || 0,
          updated_at: discussion.updated_at,
          created_at: discussion.created_at,
          comment_count: discussion.comment_count,
          total_upvotes: discussion.total_upvotes,
          total_downvotes: discussion.total_downvotes,
          state: discussion.state,
          title: discussion.title,
        }.merge(overrides)
      end

      def discussion_comment(discussion_comment, overrides: {})
        return if discussion_comment.nil?

        {
          id: discussion_comment.id,
          global_relay_id: discussion_comment.global_relay_id,
          body_size: discussion_comment.body&.size || 0,
          updated_at: discussion_comment.updated_at,
          created_at: discussion_comment.created_at,
          comment_count: discussion_comment.comment_count,
          total_upvotes: discussion_comment.total_upvotes,
          total_downvotes: discussion_comment.total_downvotes,
        }.merge(overrides)
      end

      def discussion_category(discussion_category, overrides: {})
        return if discussion_category.nil?

        {
          id: discussion_category.id,
          created_at: discussion_category.created_at,
          updated_at: discussion_category.updated_at,
          name: discussion_category.name,
          description_size: discussion_category.description&.size || 0,
          supports_mark_as_answer: discussion_category.supports_mark_as_answer?,
          supports_announcements: discussion_category.supports_announcements?,
        }.merge(overrides)
      end

      def discussion_poll_question(discussion_poll, overrides: {})
        return if discussion_poll.nil?

        discussion_poll.discussion.repository.public ? discussion_poll.question : ""
      end

      def discussion_poll(discussion_poll, overrides: {})
        return if discussion_poll.nil?

        {
          id: discussion_poll.id,
          discussion_id: discussion_poll.discussion.id,
          created_at: discussion_poll.created_at,
          updated_at: discussion_poll.updated_at,
          question: discussion_poll_question(discussion_poll),
          discussion_poll_votes_count: discussion_poll.discussion_poll_votes_count,
        }.merge(overrides)
      end

      def file_extension(path)
        pieces = path.split(".")
        pieces.size > 1 ? pieces.last : ""
      end

      def pull_request(pull_request, overrides: {})
        return if pull_request.nil?

        {
          id: pull_request.id,
          global_relay_id: pull_request.global_relay_id,
          author_id: pull_request.user_id,
          pull_request_state: pull_request.state.upcase,
          created_at: pull_request.created_at,
          updated_at: pull_request.updated_at,
          merged_at: pull_request.merged_at,
          draft: pull_request.draft,
          total_commits: pull_request.total_commits,
          head_branch: pull_request.head_ref_name,
          base_branch: pull_request.base_ref_name,
          head_sha: pull_request.head_sha,
          base_sha: pull_request.base_sha,
        }.merge(overrides)
      end

      def pull_request_review(review, overrides: {})
        return unless review

        {
          id: review.id,
          pull_request_id: review.pull_request_id,
          user_id: review.user_id,
          state: PullRequestReview.state_name(review.state)&.upcase,
          head_sha: review.head_sha,
          body: review.body,
          created_at: review.created_at,
          updated_at: review.updated_at,
          submitted_at: review.submitted_at,
        }.merge(overrides)
      end

      def pull_request_review_request(review_request, overrides: {})
        return unless review_request

        reviewer = review_request.reviewer
        subject_user = review_request.reviewer_type == "User" ? Hydro::EntitySerializer.user(reviewer) : nil
        subject_team = review_request.reviewer_type == "Team" ? Hydro::EntitySerializer.team(reviewer) : nil
        as_code_owner = review_request.async_as_codeowner?&.sync

        {
          subject_user: subject_user,
          subject_team: subject_team,
          repository: Hydro::EntitySerializer.repository(review_request.repository),
          pull_request: Hydro::EntitySerializer.pull_request(review_request.pull_request),
          as_code_owner: as_code_owner,
        }.merge(overrides)
      end

      def issue_comment(issue_comment, overrides: {})
        return if issue_comment.nil?

        {
          id: issue_comment.id,
          global_relay_id: issue_comment.global_relay_id,
          formatter: issue_comment.formatter,
          updated_at: issue_comment.updated_at,
          created_at: issue_comment.created_at,
          id_value: issue_comment.id,
        }.merge(overrides)
      end

      def pull_request_review_comment(review_comment, overrides: {})
        return if review_comment.nil?

        {
          id: review_comment.id,
          global_relay_id: review_comment.global_relay_id,
          body: review_comment.body,
          contains_suggestion: review_comment.body_contains_suggestion?,
          author_id: review_comment.user_id,
          updated_at: review_comment.updated_at,
          created_at: review_comment.created_at,
          start_position_offset: review_comment.start_position_offset,
          position_is_used: review_comment.position_is_used == true,
          subject_type: enum_from_string(review_comment.subject_type)
        }.merge(overrides)
      end

      def pull_request_review_thread(review_thread, overrides: {})
        return if review_thread.nil?

        location = review_thread.outside_diff? ? "OUTSIDE_DIFF" : "INSIDE_DIFF"

        {
          id: review_thread.id,
          global_relay_id: review_thread.global_relay_id,
          updated_at: review_thread.updated_at,
          created_at: review_thread.created_at,
          location: enum_from_string(location),
        }.merge(overrides)
      end

      def oauth_application(entity, overrides: {})
        return if entity.nil?

        {
          id: entity.id,
          name: entity.name,
          domain: entity.domain,
          url: entity.url,
          callback_url: entity.callback_url,
          owner_id: entity.user_id,
          created_at: entity.created_at,
        }.merge(overrides)
      end

      def profile(profile, overrides: {})
        return if profile.nil?

        status = if profile.association(:user_status).loaded?
          user_status(profile.user_status)
        end

        {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          website_url: profile.blog,
          company: profile.company,
          location: profile.location,
          bio: profile.bio,
          hireable: profile.hireable?,
          display_staff_badge: profile.display_staff_badge?,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          user_status: status,
        }.merge(overrides)
      end

      def profile_specimen_data_fields(profile)
        return if profile.nil?

        {
          specimen_company: specimen_data(profile.company),
          specimen_location: specimen_data(profile.location),
          specimen_name: specimen_data(profile.name),
          specimen_website_url: specimen_data(profile.blog),
        }
      end

      def social_account(social_account)
        return if social_account.nil?

        {
          provider: social_account.key,
          url: social_account.url,
        }
      end

      def request_context(github_context, overrides: {})
        return if github_context.nil?
        HydroLoader.load_github if GitHub.lazy_load_hydro?

        ip = Hydro::IpAddr.new(github_context[:actor_ip])

        return unless ip.valid?

        {
          request_id: github_context[:request_id],
          request_method: github_context[:method].try(:upcase),
          request_url: github_context[:url],
          request_category: github_context[:request_category],
          ip_address: ip.to_s,
          ip_version: ip.version || :VERSION_UNKNOWN,
          v4_int: ip.ipv4_int,
          v6_int: ip.ipv6_int,
          user_agent: github_context[:user_agent]&.dup&.force_encoding(Encoding::UTF_8)&.scrub!,
          user_session_id: github_context[:actor_session],
          controller: github_context[:controller],
          controller_action: github_context[:controller_action],
          api_route: github_context[:api_route].try(:call),
          from: github_context[:from],
          auth: auth_type(github_context[:auth]) || :AUTH_UNKNOWN,
          client_id: github_context[:client_id],
          referrer: github_context[:referrer]&.dup&.force_encoding(Encoding::UTF_8)&.scrub!,
          device_cookie: github_context[:device_cookie]&.dup&.force_encoding(Encoding::UTF_8)&.scrub!,
        }.merge(GitHub::Location.look_up(ip.to_s).slice(
          :country_code,
          :country_name,
          :region,
          :region_name,
          :city,
        )).merge(overrides)
      end

      def repository(repository, overrides: {})
        return if repository.nil?

        {
          id: repository.id,
          global_relay_id: repository.global_relay_id,
          name: repository.name,
          description: repository.description,
          visibility: repository.visibility,
          parent_id: repository.parent_id,
          network_id: repository.network_id,
          stargazer_count: [repository.stargazer_count, 0].max,
          public_fork_count: [repository.public_fork_count, 0].max,
          pushed_at: repository.pushed_at,
          updated_at: repository.updated_at,
          created_at: repository.created_at,
          template: repository.template?,
          disk_usage: repository.disk_usage.to_i,
          default_branch: force_utf8(repository.default_branch),
          primary_language_name: repository.primary_language&.name,
          organization_id: repository.organization_id,
          owner_id: repository.owner_id,
          wiki_world_writable: repository.wiki_world_writable?,
          is_fork: repository.fork?,
          is_archived: repository.archived?,
        }.merge(overrides)
      end

      # Intended for use with deleted repositories, since as of writing,
      # hydro.schemas.github.v1.entities.Repository makes all attributes optional.
      def null_repository(repository_id, overrides: {})
        { id: repository_id } unless repository_id.nil?
      end

      def repository_domain(repository, override: {})
        repository(repository, **override).slice(:id, :global_relay_id, :name, :description, :visibility, :parent_id, :default_branch, :created_at, :updated_at).merge(full_name: repository.full_name)
      end

      def changed_file(changed_file, overrides: nil)
        overrides ||= {}
        return if changed_file.nil?

        {
          previous_blob_oid: changed_file.previous_oid,
          current_blob_oid: changed_file.oid,
          change_type: changed_file.change_type,
          current_path: changed_file.path,
          previous_path: changed_file.previous_path,
        }.merge(overrides)
      end

      def repository_advisory(repository_advisory, overrides: {})
        {
          id: repository_advisory.id,
          ghsa_id: repository_advisory.ghsa_id,
          permalink: repository_advisory.permalink,
          severity: enum_from_string(repository_advisory.severity),
          state: repository_advisory.state,
          created_at: repository_advisory.created_at,
          updated_at: repository_advisory.updated_at,
          published_at: repository_advisory.published_at,
          withdrawn_at: repository_advisory.withdrawn_at,
          external: repository_advisory.external?,
          accepted: repository_advisory.accepted?,
        }.merge(overrides)
      end

      def repository_advisory_content(repository_advisory)
        {
          ghsa_id: repository_advisory.ghsa_id,
          permalink: repository_advisory.permalink,
          severity: enum_from_string(repository_advisory.severity),
          state: repository_advisory.state,
          title: repository_advisory.title,
          description: repository_advisory.description,
          cve_id: repository_advisory.cve_id,
          cvss_v3: repository_advisory.cvss_v3,
          affected_products: repository_advisory.affected_products.map do |affected_product|
            {
              package_ecosystem: affected_product.ecosystem,
              package_name: affected_product.package,
              vulnerable_version_range: affected_product.affected_versions,
              first_patched_version: affected_product.patches,
              affected_functions: affected_product.affected_functions,
            }
          end
        }
      end

      # An advisory credit doesn't have a corresponding Hydro _entity_, but the
      # Hydro messages that describe its lifecycle have enough in common that
      # it's helpful to extract the message building logic to one location.
      def advisory_credit(payload, except: [])
        actor = payload[:actor]
        advisory_credit = payload[:advisory_credit]
        repository_advisory = payload[:repository_advisory]
        repository = payload[:repo]
        repository_owner = repository&.owner
        security_advisory = payload[:vulnerability]&.becomes(SecurityAdvisory)
        creator = payload[:creator]
        recipient = payload[:recipient]
        current_state =
          case
          when advisory_credit.accepted? then :ACCEPTED
          when advisory_credit.declined? then :DECLINED
          when advisory_credit.notified? then :PENDING
          else :NOT_NOTIFIED
          end

        message = {
          request_context: request_context(GitHub.context.to_hash),
          advisory_credit_id: advisory_credit.id,
          ghsa_id: advisory_credit.ghsa_id,
          advisory_credit_created_at: advisory_credit.created_at,
          advisory_credit_current_state: current_state,
        }

        message[:actor] = user(actor) if actor
        message[:repository_advisory] = repository_advisory(repository_advisory) if repository_advisory
        message[:repository] = repository(repository) if repository
        message[:repository_owner] = user(repository_owner) if repository_owner
        message[:security_advisory] = security_advisory.hydro_entity_payload if security_advisory
        message[:advisory_credit_creator] = user(creator) if creator
        message[:advisory_credit_recipient] = user(recipient) if recipient

        message.except!(*except)

        message
      end

      def spamurai_form_signals(signals, overrides: {})
        # For case when spamurai form signals is a hash
        # This can happen when it is serialized into kv then pulled
        # back out. When pulled out it turns into a hash.
        if signals.is_a?(Hash) && signals.keys.sort == SpamuraiFormSignals::REQUIRED_KEYS
          signals = SpamuraiFormSignals.new(**T.unsafe(signals))
        end

        return if signals.nil?
        return unless signals.is_a?(SpamuraiFormSignals)

        load_to_submit_in_milliseconds = signals.load_to_submit_in_milliseconds && [
          signals.load_to_submit_in_milliseconds,
          2147483647,
        ].min # max size is 32 bit integer

        {
          load_to_submit_in_milliseconds: load_to_submit_in_milliseconds,
          load_to_submit_timestamp_hacked: signals.load_to_submit_timestamp_hacked?,
          load_to_submit_timestamp_missing: signals.load_to_submit_timestamp_missing?,
          load_to_submit_timestamp_secret_missing: signals.load_to_submit_timestamp_secret_missing?,
          honeypot_failure: signals.honeypot_failure?,
        }.merge(overrides)
      end

      def spam_queue(spam_queue, overrides: {})
        return if spam_queue.nil?

        {
          id: spam_queue.id,
          name: spam_queue.name,
          created_at: spam_queue.created_at,
          global_relay_id: spam_queue.global_relay_id,
        }.merge(overrides)
      end

      def spam_queue_entry(spam_queue_entry, overrides: {})
        return if spam_queue_entry.nil?

        {
          id: spam_queue_entry.id,
          created_at: spam_queue_entry.created_at,
          global_relay_id: spam_queue_entry.global_relay_id,
          additional_context: spam_queue_entry.additional_context,
        }.merge(overrides)
      end

      STARRABLE_TYPES = {
        "Gist" => :GIST,
        "Repository" => :REPOSITORY,
      }

      def starrable(entity, overrides: {})
        return if entity.nil?

        visiblity = entity.public? ? :PUBLIC : :PRIVATE
        {
          type: STARRABLE_TYPES.fetch(entity.class.name, :UNKNOWN),
          id: entity.id,
          global_relay_id: entity.global_relay_id,
          visibility: visiblity,
        }.merge(overrides)
      end

      def user(entity, overrides: {})
        return unless entity

        UserEntitySerializer
        .serialize(entity)
        .merge(overrides)
      end

      def users(entities)
        return unless entities

        entities.map { |user| user(user) }.sort_by { |user| user[:id] }
      end

      def codespace_billable_owner(billable_owner, overrides: {})
        return if billable_owner.nil?

        Codespaces::BillableOwnerEntitySerializer
          .serialize(billable_owner)
          .merge(overrides)
      end

      def user_domain(entity, overrides: {})
        user(entity, **overrides).slice(:id, :login, :type, :global_relay_id, :spamurai_classification, :created_at).tap  do |hash|
          hash[:avatar_url] = entity.try(:avatar_url) || ""
          hash[:site_admin] = Api::Serializer.instance_admin?(entity, viewer: nil)
        end
      end

      def user_email(entity, overrides: {})
        return if entity.nil?

        domain_metadata = EmailDomainReputationRecord.metadata(entity.email)
        domain_reputation = EmailDomainReputationRecord.reputation(entity.email)

        {
          id: entity.id,
          address: entity.email,
          verified_at: entity.verified_at,
          domain_reputation: domain_reputation.reputation,
          domain_reputation_lower_bound: domain_reputation.reputation_lower_bound,
          domain_sample_size: domain_reputation.sample_size,
          domain_not_spammy_sample_size: domain_reputation.not_spammy_sample_size,
          associated_domains: domain_metadata[:email_domains],
          associated_mx_exchanges: domain_metadata[:mx_exchanges],
          associated_a_records: domain_metadata[:a_records],
          has_valid_public_suffix: domain_metadata[:has_valid_public_suffix],
        }.merge(overrides)
      end

      def user_list(user_list)
        return unless user_list

        attrs = {
          id: user_list.id,
          user_id: user_list.user_id,
          item_count: user_list.item_count,
          private: user_list.private?,
        }

        unless user_list.private?
          attrs[:slug] = user_list.slug
          attrs[:name] = user_list.name
          attrs[:description] = user_list.description
        end

        attrs
      end

      def user_list_item(user_list_item)
        return unless user_list_item

        {
          id: user_list_item.id,
          user_list_id: user_list_item.user_list_id,
          repository_id: user_list_item.repository_id,
          created_at: user_list_item.created_at,
        }
      end

      def user_status(entity, overrides: {})
        return if entity.nil?

        {
          id: entity.id,
          emoji: entity.emoji,
          message: entity.message,
          user_id: entity.user_id,
          created_at: entity.created_at,
          updated_at: entity.updated_at,
          organization_id: entity.organization_id,
          limited_availability: entity.limited_availability,
          expires_at: entity.expires_at,
        }.merge(overrides)
      end

      # Spammy classification for a User/Organization/Business
      def account_spammy_classification(account)
        return nil unless account
        return nil unless account.persisted?
        return :SPAMMY if account.spammy?
        return :HAMMY if account.hammy?
        :NONE
      end

      # Spammy reason for a User/Organization/Business
      def account_spammy_reason(account)
        return nil unless account
        return nil unless account.persisted?
        account.spammy_reason || ""
      end

      # Suspended state for a User/Organization/Business
      def account_suspended(account)
        return nil unless account
        return nil unless account.persisted?
        account.suspended?
      end

      # Deleted state for a User/Organization/Business
      def account_currently_deleted(account)
        return true unless account
        return true unless account.persisted?
        false
      end

      def team(team, overrides: {})
        return unless team

        {
          id: team.id,
          global_relay_id: team.global_relay_id,
          organization_id: team.organization_id,
          name: team.name,
          slug: team.slug,
          description: team.description,
          created_at: team.created_at,
          updated_at: team.updated_at,
        }.merge(overrides)
      end

      def organization(entity, overrides: {})
        return unless entity

        spamurai_classification = if entity.spammy?
          :SPAMMY
        elsif entity.hammy?
          :HAMMY
        else
          :SPAMURAI_CLASSIFICATION_UNKNOWN
        end

        {
          id: entity.id,
          login: entity.login.to_s,
          billing_email: entity.billing_email,
          billing_plan: entity.plan.try(:display_name),
          spammy: entity.spammy?,
          suspended: entity.suspended?,
          spamurai_classification: spamurai_classification,
          global_relay_id: entity.global_relay_id,
          created_at: entity.created_at,
        }.merge(overrides)
      end

      def invitation(entity, overrides: {})
        return unless entity

        {
          created_at: entity.created_at,
          email: entity.email,
          id: entity.id,
          invitee_id: entity.invitee_id,
          inviter_id: entity.inviter_id,
          role: entity.role,
          updated_at: entity.updated_at,
        }.merge(overrides)
      end

      def business(entity, overrides: {})
        return unless entity

        {
          id: entity.id,
          slug: entity.slug.to_s,
          global_relay_id: entity.global_relay_id,
          created_at: entity.created_at,
          shortcode: entity.shortcode,
          customer_id: entity.customer_id
        }.merge(overrides)
      end

      def business_billing_information(entity, overrides: {})
        return unless entity
        record = entity.trade_screening_record
        return nil unless record
        billing_information = {
          **(record.entity_name.present? ? { entity_name: record.entity_name } : {}),
          **(record.address1.present? ? { address1: record.address1 } : {}),
          **(record.address2.present? ? { address2: record.address2 } : {}),
          **(record.city.present? ? { city: record.city } : {}),
          **(record.postal_code.present? ? { postal_code: record.postal_code } : {}),
          **(record.country_code.present? ? { country_code: record.country_code } : {}),
          **(record.region.present? ? { region: record.region } : {}),
          **(record.vat_code.present? ? { vat_code: record.vat_code } : {}),
        }.merge(overrides)
        return if billing_information.empty?
        billing_information
      end

      def business_shipping_information(entity, overrides: {})
        return unless entity
        return unless record = entity.shipping_contact
        shipping_information = {
          **(record.entity_name.present? ? { entity_name: record.entity_name } : {}),
          **(record.address1.present? ? { address1: record.address1 } : {}),
          **(record.address2.present? ? { address2: record.address2 } : {}),
          **(record.city.present? ? { city: record.city } : {}),
          **(record.postal_code.present? ? { postal_code: record.postal_code } : {}),
          **(record.country_code.present? ? { country_code: record.country_code } : {}),
          **(record.region.present? ? { region: record.region } : {})
        }.merge(overrides)
        return if shipping_information.empty?
        shipping_information
      end

      TEAM_SYNC_TENANT_PROVIDER_TYPES = {
        unknown: :UNKNOWNPROVIDER,
        azuread: :AZUREAD,
        okta: :OKTA,
      }

      TEAM_SYNC_TENANT_STATES = {
        unknown: :UNKNOWN,
        pending: :PENDING,
        failed: :FAILED,
        ready: :READY,
        enabled: :ENABLED,
        disabled: :DISABLED,
      }

      def team_sync_tenant(entity)
        return unless entity

        {
          id: entity.id,
          global_relay_id: entity.global_relay_id,
          provider_type: TEAM_SYNC_TENANT_PROVIDER_TYPES[entity.provider_type.to_sym],
          provider_id: entity.provider_id,
          status: team_sync_tenant_status_mapping(entity.status),
          created_at: entity.created_at,
          updated_at: entity.updated_at,
          organization_id: entity.organization_id,
        }
      end

      def team_sync_tenant_status_mapping(status)
        TEAM_SYNC_TENANT_STATES[status.to_sym]
      end

      TEAM_GROUP_MAPPING_STATES = {
        unknown: :UNKNOWN,
        unsynced: :UNSYNCED,
        pending: :PENDING,
        synced: :SYNCED,
        disabled: :DISABLED,
        failed: :FAILED,
        partial: :PARTIAL,
        retry: :RETRY,
        updated: :UPDATED,
      }

      def team_group_mapping(entity)
        return unless entity

        {
          id: entity.id,
          global_relay_id: entity.global_relay_id,
          group_id: entity.group_id,
          group_name: entity.group_name,
          group_description: entity.group_description,
          status: TEAM_GROUP_MAPPING_STATES[entity.status.to_sym],
          synced_at: entity.synced_at,
          created_at: entity.created_at,
          updated_at: entity.updated_at,
          team_id: entity.team_id,
          organization_id: entity.tenant.organization_id,
          team_sync_tenant_id: entity.tenant_id,
        }
      end

      def enterprise_installation(installation)
        return unless installation

        {
          id: installation.id,
          host_name: installation.host_name,
          customer_name: installation.customer_name,
          owner_type: installation.owner_type == "Business" ? :BUSINESS : :ORG,
          owner_id: installation.owner_id,
          version: installation.version,
        }
      end

      def news_feed_event_type_to_hydro(event_type)
        event_type = event_type.chomp("Event").underscore.upcase.to_sym
        NEWS_FEED_EVENT_TYPES.include?(event_type) ? event_type : :UNKNOWN
      end

      def news_feed_event(entity, overrides: {})
        return unless entity

        visibility =  if entity[:public]
          :VISIBILITY_PUBLIC
        else
          :VISIBILITY_PRIVATE
        end

        type = news_feed_event_type_to_hydro(entity[:type])
        {
          id: entity[:id],
          repo_id: entity[:repo_id],
          type: type,
          actor_id: entity[:actor_id],
          target_id: entity[:target_id],
          visibility: visibility,
          additional_details_shown: entity[:additional_details_shown] == true,
          grouped: entity[:grouped],
        }.merge(overrides)
      end

      def news_feed_event_group(entity, overrides: {})
        return unless entity

        type = news_feed_event_type_to_hydro(entity[:type])
        {
          quantity: entity[:quantity],
          type: type,
          includes_viewer: entity[:includes_viewer],
        }
      end

      def project(entity, overrides: {})
        return unless entity

        types = { organization: "ORG", repository: "REPO", user: "USER" }
        type = types.fetch(entity.owner_type.downcase.to_sym, "TYPE_UNKNOWN")

        serialized = {
          id: entity.id,
          global_relay_id: entity.global_relay_id,
          type: type,
          created_at: entity.created_at,
          updated_at: entity.updated_at,
          visibility: entity.public? ? "PUBLIC" : "PRIVATE",
        }

        if entity.public?
          serialized[:name] = entity.name
          serialized[:description] = entity.body
        end

        serialized
      end

      def project_card(entity, overrides: {})
        content_type = if entity.is_note?
          "NOTE"
        elsif content = entity.content
          content.pull_request? ? "PULL_REQUEST" : "ISSUE"
        else
          nil
        end

        {
          content_type: content_type,
        }
      end

      def project_column(entity, overrides: {})
        return unless entity

        {
          id: entity.id,
          name: entity.name,
        }
      end

      def memex_project(entity, overrides: {})
        return unless entity

        owner_type = case entity.owner_type
        when "Organization"
          :ORGANIZATION
        when "User"
          :USER
        else
          :UNKNOWN
        end

        {
          id: entity.id,
          owner_id: entity.owner_id,
          owner_type: owner_type,
          creator_id: entity.creator_id,
          title: entity.title,
          description: entity.description&.dup&.force_encoding("UTF-8"),
          public: entity.public,
          closed_at: entity.closed_at,
          created_at: entity.created_at,
          updated_at: entity.updated_at,
        }
      end

      def memex_project_column(entity, overrides: {})
        return unless entity

        custom_field_values = entity.settings["options"].map do |option|
          "id:#{option['id']},name:#{option['name']}"
        end if entity.settings&.dig("options")

        {
          created_at: entity.created_at,
          creator_id: entity.creator_id,
          custom_field_values: custom_field_values,
          data_type: entity.data_type,
          id: entity.id,
          memex_project_id: entity.memex_project_id,
          name: entity.name,
          updated_at: entity.updated_at,
          user_defined: entity.user_defined,
          visible: entity.visible,
        }
      end

      def memex_project_column_value(entity, overrides: {})
        return unless entity

        {
          created_at: entity.created_at,
          creator_id: entity.creator_id,
          id: entity.id,
          json_value: entity.json_value&.to_s,
          memex_project_id: entity.memex_project_item&.memex_project_id,
          updated_at: entity.updated_at,
          value: entity.value,
        }
      end

      def memex_project_column_value_record(entity, overrides: {})
        return unless entity

        {
          memex_project_column_id: entity[:memex_project_column_id],
          value: entity[:value],
          previous_value: entity[:previous_value],
        }
      end

      def memex_project_item(entity, overrides: {})
        return unless entity

        draft_issue = draft_issue(entity.content) if entity.draft_issue?
        issue = issue(entity.content) if entity.issue?
        pull_request = pull_request(entity.content) if entity.pull_request?

        {
          created_at: entity.created_at,
          draft_issue: draft_issue,
          id: entity.id,
          issue: issue,
          memex_project_id: entity.memex_project_id,
          pull_request: pull_request,
          updated_at: entity.updated_at,
        }
      end

      def memex_project_view_sort_by(entity, overrides: {})
        return unless entity
        entity.sort_by.map { |field| { column_id: field[0], direction: field[1] } }
      end

      def memex_project_chart(entity, overrides: {})
        return unless entity

        {
          id: entity.id,
          memex_project_id: entity.memex_project_id,
          creator_id: entity.creator_id,
          number: entity.number,
          name: entity.name,
          configuration: entity.configuration&.to_json,
          created_at: entity.created_at,
          updated_at: entity.updated_at,
        }
      end

      def memex_project_view(entity, overrides: {})
        return unless entity

        {
          created_at: entity.created_at,
          creator_id: entity.creator_id,
          filter: entity.filter,
          group_by: entity.group_by,
          id: entity.id,
          layout: entity.layout,
          name: entity.name,
          number: entity.number,
          sort_by: memex_project_view_sort_by(entity.sort_by),
          updated_at: entity.updated_at,
          visible_fields: entity.visible_fields,
        }
      end

      def draft_issue(entity, overrides: {})
        return unless entity

        {
          id: entity.id,
          title: entity.title,
          created_at: entity.created_at,
          updated_at: entity.updated_at,
        }
      end

      def enum_from_string(entity)
        return unless entity

        entity&.underscore&.upcase&.to_sym
      end

      def graphql_accessed_object(graphql_object)
        if graphql_object.is_a?(Hash)
          return {
            database_id: graphql_object[:database_id],
            ruby_class_name: graphql_object[:ruby_class_name],
            global_relay_id: graphql_object[:global_relay_id],
            graphql_type_name: graphql_object[:graphql_name],
          }
        end

        application_object = graphql_object.object
        graphql_defn = graphql_object.class
        {
          database_id: application_object.respond_to?(:id) ? application_object.id : nil,
          ruby_class_name: application_object.class.name,
          global_relay_id: application_object.respond_to?(:global_relay_id) ? application_object.global_relay_id : nil,
          graphql_type_name: graphql_defn.graphql_name,
        }
      end

      def content_reference_content_context(entity)
        if entity.is_a?(PullRequestReviewComment)
          :PR_COMMENT
        elsif entity.is_a?(IssueComment)
          :ISSUE_COMMENT
        elsif entity.is_a?(Issue) && !entity.pull_request?
          :ISSUE_BODY
        elsif entity.is_a?(Issue) && entity.pull_request?
          :PR_BODY
        else
          :CONTENT_CONTEXT_UNKNOWN
        end
      end

      def branch_protection_rule(entity, overrides: {})
        return unless entity

        {
          id: entity.id,
          required_linear_history: entity.required_linear_history_enabled?,
          allowed_force_pushes: !entity.block_force_pushes_enabled?,
          allowed_deletions: !entity.block_deletions_enabled?,
          global_relay_id: entity.global_relay_id,
          pattern: entity.name_for_display,
        }.merge(overrides)
      end

      AVATAR_OWNER_TYPES = {
        "Integration" => :INTEGRATION,
        "Marketplace::Listing" => :MARKETPLACE_LISTING,
        "OauthApplication" => :OAUTH_APPLICATION,
        "Team" => :TEAM,
        "Business" => :BUSINESS,
        "User" => :USER,
      }

      def avatar(avatar, overrides: {})
        return if avatar.nil?

        {
          id: avatar.id,
          asset_id: avatar.asset_id,
          content_type: avatar.content_type,
          created_at: avatar.created_at,
          owner_id: avatar.owner_id,
          owner_type: AVATAR_OWNER_TYPES.fetch(avatar.owner_type, :UNKNOWN),
          cropped_x: avatar.cropped_x,
          cropped_y: avatar.cropped_y,
          cropped_width: avatar.cropped_width,
          cropped_height: avatar.cropped_height,
          uploader_id: avatar.uploader_id,
          updated_at: avatar.updated_at,
          storage_blob_id: avatar.storage_blob_id,
          oid: avatar.oid,
          size: avatar.size,
          width: avatar.width,
          height: avatar.height,
          storage_provider: avatar.storage_provider,
        }.merge(overrides)
      end

      def page_status(status)
        case status
        when "built"
          :BUILT
        when "building"
          :BUILDING
        when "errored"
          :ERRORED
        else
          :BUILD_STATUS_UNKNOWN
        end
      end

      def page(page)
        return if page.nil?

        {
          id: page.id,
          repository: repository(page.repository),
          cname: page.cname,
          has_custom_404: page.four_oh_four,
          status: page_status(page.status),
          built_revision: page.built_revision,
          source_ref_name: page.source_ref_name,
          source_subdir: page.source_subdir,
          https_redirect: page.https_redirect,
          hsts_max_age: page.hsts_max_age.to_i,
          hsts_include_sub_domains: page.hsts_include_sub_domains,
          hsts_preload: page.hsts_preload,
          tree_oid: repository_tree_oid_for_branch(page.repository, page.source_branch),
          public: page.public,
        }
      end

      def repository_tree_oid_for_branch(repository, branch)
        repository.tree_entry(repository.ref_to_sha(branch), "").oid
      rescue GitRPC::InvalidFullOid, GitRPC::InvalidRepository, GitRPC::ObjectMissing, GitRPC::InvalidObject
        nil
      end

      def payment_method(entity)
        return unless entity

        payment_instrument_type = \
          case
          when entity.credit_card?
            :CREDIT_CARD
          when entity.paypal?
            :PAYPAL
          else
            :PAYMENT_INSTRUMENT_TYPE_UNKNOWN
          end

        {
          id: entity.id,
          payment_instrument_type: payment_instrument_type,
          credit_card_bin: entity.bank_identification_number,
          credit_card_unique_id: entity.unique_number_identifier,
          paypal_email: entity.paypal_email,
        }
      end

      def pull_request_refresh_tab_context(tab_context)
        return :UNKNOWN unless %w(conversation checks files_changed).include?(tab_context)

        tab_context.upcase.to_sym
      end

      def label(entity)
        return unless entity
        {
          name: entity.name,
          name_html: "#{entity.name_html}", # converted to string from ActiveSupport::SafeBuffer
          color: entity.color,
          repository_id: entity.repository_id,
          description: entity.description,
          created_at: entity.created_at,
          updated_at: entity.updated_at,
          label_id: entity.id,
          url: entity.url,
          owner_id: entity.repository&.owner_id,
        }
      end

      def labels(entities)
        return unless entities

        entities.map { |l| label(l) }
      end

      def milestone(entity)
        return unless entity

        {
          created_at: entity.created_at,
          due_on: entity.due_on,
          description: entity.description,
          id: entity.id,
          number: entity.number,
          repository_id: entity.repository_id,
          state: entity.state,
          title: entity.title,
          updated_at: entity.updated_at,
        }
      end

      def issue_type(entity)
        return unless entity

        {
          id: entity.id,
          global_relay_id: entity.global_relay_id,
          name: entity.name,
          issue_type: entity.issue_type.upcase,
          color: entity.color.upcase,
          description: entity.description,
          owner_id: entity.owner_id,
          enabled: entity.enabled,
          private: entity.private,
          created_at: entity.created_at,
          updated_at: entity.updated_at,
        }
      end

      def contact_link(entity)
        return unless entity

        {
          name: entity["name"],
          about: entity["about"],
          url: entity["url"],
        }
      end

      def package(pkg, total_size: nil, version_count: nil)
        return unless pkg
        {
          id: pkg.id,
          global_id: pkg.global_relay_id,
          name: pkg.original_name.present? ? pkg.original_name : pkg.name,
          registry_type: pkg.package_type.to_s.upcase,
          total_size: total_size.to_i,
          version_count: version_count.to_i,
          owner_id: pkg.repository&.owner_id&.to_i,
        }.tap do |msg|
          next unless pkg.association(:repository).loaded? && pkg.repository

          msg[:repository] = repository(pkg.repository)
          msg[:visibility] = msg[:repository][:visibility]

          case pkg.repository.owner
          when ::Organization
            msg[:owner_org] = organization(pkg.repository.owner)
          else
            msg[:owner_user] = user(pkg.repository.owner)
          end
        end
      end

      def package_version(version, files_count: nil, size: nil)
        return unless version
        {
          id: version.id,
          global_id: version.global_relay_id,
          version: version.original_name.present? ? version.original_name : version.version,
          platform: version.platform,
          package_size: size || version.size,
          files_count: files_count.to_i,
          pre_release: version.pre_release,
        }.tap do |msg|
          next unless version.association(:package).loaded? && version.package

          msg[:package_id] = version.package.id
          msg[:package_global_id] = version.package.global_relay_id
        end
      end

      def package_file(file)
        return unless file
        {
          id: file.id,
          global_id: file.global_relay_id,
          name: file.filename,
          guid: file.guid,
          size: file.size,
        }.tap do |msg|
          next unless file.association(:package_version).loaded? && file.package_version

          msg[:version_id] = file.package_version.id
          msg[:version_global_id] = file.package_version.global_relay_id
        end
      end

      def package_file_storage_service(service)
        return unless service.present?

        case service.to_s.upcase
        when "AWS_S3", "S3"
          { name: "AWS_S3" }
        when "FASTLY"
          { name: "FASTLY" }
        else
          { name: "N_A" }
        end
      end

      def user_asset(user_asset, overrides: {})
        {
          id: user_asset.id,
          user_id: user_asset.user_id,
          name: user_asset.name,
          content_type: user_asset.content_type,
          size: user_asset.size,
          guid: user_asset.guid,
          state: user_asset.state.upcase.to_sym,
          storage_blob_id: user_asset.storage_blob_id,
          oid: user_asset.oid,
          storage_provider: user_asset.storage_provider,
          storage_external_url: user_asset.storage_external_url,
          created_at: user_asset.created_at,
          updated_at: user_asset.updated_at,
        }.merge(overrides)
      end

      def feature(feature)
        return if feature.nil?

        {
          id: feature.id,
          public_name: feature.public_name,
          slug: feature.slug,
          flipper_feature_id: feature.flipper_feature_id,
          enrolled_by_default: feature.enrolled_by_default?,
          created_at: feature.created_at,
        }
      end

      def ip_allow_list_entry(entry)
        return unless entry.present?
        owner_type = if entry.owner.is_a?(Integration)
          :INTEGRATION
        elsif entry.owner.is_a?(Business)
          :BUSINESS
        else
          :ORG
        end

        {
          id: entry.id,
          owner_type: owner_type,
          owner_id: entry.owner.id,
          allow_list_value: entry.allow_list_value,
          name: entry.name,
          active: entry.active?,
        }
      end

      def ip_allow_list_entries(entries)
        return [] unless entries.present?

        entries.each.map { |entry| ip_allow_list_entry(entry) }
      end

      def spam_reputation(reputation)
        {
          sample_size: reputation.sample_size,
          not_spammy_sample_size: reputation.not_spammy_sample_size,
          spammy_sample_size: reputation.spammy_sample_size,
          reputation: reputation.reputation,
          reputation_lower_bound: reputation.reputation_lower_bound,
          plus_minus: reputation.plus_minus,
          maximum_reputation: reputation.maximum_reputation,
          minimum_reputation: reputation.minimum_reputation,
        }
      end

      def codespace(codespace, overrides: {})
        return if codespace.nil?

        serialized_codespace = {
          id: codespace.id,
          guid: codespace.guid,
          repository_id: codespace.repository_id,
          owner_id: codespace.owner_id,
          pull_request_id: codespace.pull_request_id,
          oid: codespace.oid,
          ref: codespace.ref,
          location: codespace.location,
          vso_environment: codespace.vscs_target.to_s || Codespaces::Vscs.default_target.to_s,
          name: codespace.name,
          billable_owner_id: codespace.billable_owner_id,
          template_repository_id: codespace.template_repository_id,
          devcontainer_path: codespace.devcontainer_path,
          sku: codespace.sku_name.to_s,
          is_copilot_demo_repository: codespace.repository.feature_enabled?(:codespaces_copilot_demo_repository),
          repository_global_relay_id: codespace.repository&.global_relay_id,
        }

        if codespace.owner.present?
          serialized_codespace[:tier] = Codespaces::Tier.for_user(codespace.owner).tier
        end

        if codespace.copilot_workspace?
          serialized_codespace[:copilot_workspace_id] = codespace.copilot_workspace_id
        end

        serialized_codespace.merge(overrides)
      end

      def sponsors_fraud_review(fraud_review)
        return if fraud_review.blank?

        {
          id: fraud_review.id,
          state: fraud_review.state.to_s,
        }
      end

      def sparkle(sparkle, overrides: {})
        return if sparkle.nil?

        {
          id: sparkle.id,
          sender: Hydro::EntitySerializer.user(sparkle.sender),
          receiver: Hydro::EntitySerializer.user(sparkle.receiver),
          reason: sparkle.reason,
          context_type: sparkle.context_type,
          context_id: sparkle.context_id,
          subject_type: sparkle.subject_type,
          subject_id: sparkle.subject_id,
        }.merge(overrides)
      end

      def environment(environment, overrides: {})
        return if environment.nil?

        {
          id: environment.id,
          global_relay_id: environment.global_relay_id,
          name: environment.name,
          created_at: environment.created_at,
          updated_at: environment.updated_at,
          repository_id: environment.repository.id,
        }.merge(overrides)
      end

      def enterprise_admin_invitation(invitation, overrides: {})
        return unless invitation.present?

        {
          id: invitation.id,
          enterprise: Hydro::EntitySerializer.business(invitation.business),
          role: invitation.owner? ? :OWNER : :BILLING_MANAGER,
          email: invitation.email,
          invitee: Hydro::EntitySerializer.user(invitation.invitee),
          inviter: Hydro::EntitySerializer.user(invitation.inviter),
          created_at: invitation.created_at,
          updated_at: invitation.updated_at,
          accepted_at: invitation.accepted_at,
          cancelled_at: invitation.cancelled_at,
          expired_at: invitation.expired_at,
        }.merge(overrides)
      end

      BRANCH_PROTECTION_ENFORCEMENT_LEVELS = {
        "off" => :OFF,
        "non_admins" => :NON_ADMINS,
        "everyone" => :EVERYONE,
      }

      def protected_branch(entity)
        return unless entity
        {
          id: entity.id,
          repository_id: entity.repository_id,
          name: force_utf8(entity.name),
          created_at: entity.created_at,
          updated_at: entity.updated_at,
          pull_request_reviews_enforcement_level: BRANCH_PROTECTION_ENFORCEMENT_LEVELS[entity.pull_request_reviews_enforcement_level],
          required_approving_review_count: entity.required_approving_review_count,
          dismiss_stale_reviews_on_push: entity.dismiss_stale_reviews_on_push,
          require_code_owner_review: entity.require_code_owner_review,
          authorized_dismissal_actors_only: entity.authorized_dismissal_actors_only,
          ignore_approvals_from_contributors: entity.ignore_approvals_from_contributors,
          required_status_checks_enforcement_level: BRANCH_PROTECTION_ENFORCEMENT_LEVELS[entity.required_status_checks_enforcement_level],
          strict_required_status_checks_policy: entity.strict_required_status_checks_policy,
          signature_requirement_enforcement_level: BRANCH_PROTECTION_ENFORCEMENT_LEVELS[entity.signature_requirement_enforcement_level],
          linear_history_requirement_enforcement_level: BRANCH_PROTECTION_ENFORCEMENT_LEVELS[entity.linear_history_requirement_enforcement_level],
          admin_enforced: entity.admin_enforced,
          allow_force_pushes_enforcement_level: BRANCH_PROTECTION_ENFORCEMENT_LEVELS[entity.allow_force_pushes_enforcement_level],
          allow_deletions_enforcement_level: BRANCH_PROTECTION_ENFORCEMENT_LEVELS[entity.allow_deletions_enforcement_level],
          merge_queue_enforcement_level: BRANCH_PROTECTION_ENFORCEMENT_LEVELS[entity.merge_queue_enforcement_level],
          required_deployments_enforcement_level: BRANCH_PROTECTION_ENFORCEMENT_LEVELS[entity.required_deployments_enforcement_level],
          authorized_actors_only: entity.authorized_actors_only,
          required_review_thread_resolution_enforcement_level: BRANCH_PROTECTION_ENFORCEMENT_LEVELS[entity.required_review_thread_resolution_enforcement_level],
          require_last_push_approval: entity.require_last_push_approval
        }
      end

      def auto_merge_request(entity)
        return unless entity
        {
          id: entity.id,
          user: Hydro::EntitySerializer.user(entity.user),
          pull_request: Hydro::EntitySerializer.pull_request(entity.pull_request),
          created_at: entity.created_at,
          updated_at: entity.updated_at,
          merge_method: entity.merge_method,
          merge_error: entity.merge_error
        }
      end

      def protected_domain(entity)
        return unless entity

        state = case entity.state
        when "verified"
          :VERIFIED
        when "pending"
          :PENDING
        when "unverified"
          :UNVERIFIED
        else
          :UNKNOWN_STATE
        end

        {
          id: entity.id,
          name: entity.name,
          owner_id: entity.owner_id,
          owner_type: entity.owner_type,
          state: state,
          unverified_at: entity.unverified_at,
          created_at: entity.created_at,
          updated_at: entity.updated_at,
          parent_domain: entity.parent_domain,
          last_verified_at: entity.last_verified_at,
        }
      end

      def verifiable_domain(entity)
        return unless entity

        owner_type = if entity.owner.is_a?(Business)
          :BUSINESS
        else
          :ORG
        end

        {
          id: entity.id,
          owner_type: owner_type,
          owner_id: entity.owner.id,
          domain: entity.domain,
          verified: entity.verified,
          approved: entity.approved,
          created_at: entity.created_at,
          updated_at: entity.updated_at
        }
      end

      def topic(topic)
        return unless topic

        {
          id: topic.id,
          name: topic.name,
          global_relay_id: topic.global_relay_id,
        }
      end

      def push_options(push_options)
        return [] unless push_options.present?

        push_options.map do |push_option|
          case push_option
          when "pull.ready"
            :PULL_READY
          end
        end.compact
      end

      def insights_data(data)
        data.map { |k, v| [k.to_s, v.to_s.dup.force_encoding("utf-8")] }.to_h
      end

      def ghes_usage_metrics_mec(data)
        return unless data
        data.symbolize_keys!

        {
          start_date: data[:start_date].to_time.utc,
          end_date: data[:end_date].to_time.utc,
          value: data[:value]
        }
      end

      def request_context_for_insights_publishing(github_context)
        context_hash = request_context(github_context) || {}
        context_hash[:request_id] ? context_hash : context_hash.merge({ request_id: SecureRandom.uuid })
      end

      def custom_repository_role(entity)
        return unless entity
        return unless entity.custom?
        return unless entity.owner&.organization?

        base_role = case entity.base_role.name
        when "read"
          :READ
        when "triage"
          :TRIAGE
        when "write"
          :WRITE
        when "maintain"
          :MAINTAIN
        else
          :UNKNOWN
        end

        {
          db_id: entity.id,
          name: entity.name,
          organization: organization(entity.owner),
          business: business(entity.owner.business),
          base_role: base_role,
          fine_grained_permissions: entity.permissions.map(&:action).sort,
          created_at: entity.created_at,
          updated_at: entity.updated_at,
        }
      end

      def custom_organization_role(org_role)
        return if org_role.nil?
        return unless org_role.custom?
        return unless org_role.owner&.organization?

        {
          db_id: org_role.id,
          name: org_role.name,
          organization: organization(org_role.owner),
          business: business(org_role.owner.business),
          fine_grained_permissions: org_role.permissions.map(&:action).sort,
          created_at: org_role.created_at,
          updated_at: org_role.updated_at,
        }
      end

      def feed_card(data)
        return unless data

        {
          card_type: enum(
            type: Hydro::Schemas::Github::Feeds::V0::Entities::CardType,
            value: data[:card_type],
            default: :CARD_TYPE_UNKNOWN,
          ),
          resource_relationship:        data[:resource_relationship],
          created_at:                   data[:created_at]&.to_time&.utc,
          record_id:                    data[:record_id],
          resource_type:                data[:resource_type],
          resource_id:                  data[:resource_id],
          card_position:                data[:card_position],
          card_sub_position:            data[:card_sub_position],
          unique_card_retrieved_id:     data[:card_retrieved_id],
          gatherer:                     data[:gatherer],
          variant:                      data[:variant],
          assignment_context:           data[:assignment_context],
        }
      end

      def user_disinterest(data)
        return unless data
        {
          actor_id: data[:actor_id],
          resource_id: data[:resource_id],
          event_id: data[:event_id],
          resource_type: enum(
            type: Hydro::Schemas::Github::Feeds::V0::Entities::ResourceType,
            value: data[:resource_type],
            default: :UNKNOWN,
          ),
          event_type_string: data[:card_type],
          dismissed_at: data[:dismissed_at],
          reason: enum(
            type: Hydro::Schemas::Github::Feeds::V0::UserDisinterest::Reason,
            value: data[:dismissed_reason],
            default: :REASON_UNKNOWN,
          ),
          request_context: data[:request_context],
          undo: data[:undo],
          identifier: data[:identifier],
        }
      end

      def feed_post(post)
        return unless post
        {
          id: post.id,
          body: post.body,
          author: user(post.author),
          owner: user(post.owner),
          created_at: post.created_at,
          updated_at: post.updated_at,
          references: post.feed_post_references.filter_map do |reference|
            feed_post_reference(reference)
          end
        }
      end

      def feed_post_comment(comment)
        return unless comment
        {
          id: comment.id,
          body: comment.body,
          author: user(comment.user),
          created_at: comment.created_at,
          updated_at: comment.updated_at
        }
      end

      def feed_post_reference(reference)
        return unless reference

        {
          reference_object_type: reference.reference_type.underscore.upcase,
          reference_object_id: reference.reference_id,
          reference_action: reference.action.upcase,
          created_at: reference.created_at,
          updated_at: reference.updated_at
        }
      end

      def merge_queue(merge_queue)
        return unless merge_queue
        {
          id: merge_queue.id,
          created_at:  merge_queue.created_at,
          updated_at: merge_queue.updated_at,
          branch: merge_queue.branch,
          merge_method: enum_from_string(merge_queue.merge_method),
          current_merge_group_id: nil,
          max_entries_to_build: merge_queue.max_entries_to_build,
          check_response_timeout: {
            seconds: merge_queue.check_response_timeout_minutes.minutes.to_i
          },
          merging_strategy: enum(
            type: Hydro::Schemas::Github::MergeQueue::V1::Entities::MergeQueue::MergingStrategy,
            value: merge_queue.merging_strategy,
            default: :UNKNOWN_MERGING_STRATEGY,
          ),
          max_entries_to_merge: merge_queue.max_entries_to_merge,
          min_entries_to_merge: merge_queue.min_entries_to_merge,
          min_entries_to_merge_wait: {
            seconds: merge_queue.min_entries_to_merge_wait_minutes.minutes.to_i
          },
        }
      end

      def merge_queue_entry(entry)
        return unless entry

        state = begin
          entry.entry_state.const_get(:HYDRO_ENUM_VALUE).to_s
        rescue ArgumentError, NameError => exception
          Failbot.report(exception)
          "unknown_state"
        end

        {
          id: entry.id,
          created_at: entry.created_at,
          updated_at: entry.updated_at,
          state: enum_from_string(state),
          solo: entry.solo?,
          jump_queue: entry.jump_queue?,
          pull_request_id: entry.pull_request_id,
          base_sha: entry.base_sha,
          head_sha: entry.head_sha,
          head_ref: entry.head_ref,
        }
      end

      def merge_queue_required_status_check(status_check)
        return unless status_check
        {
          id: status_check.id,
          type: status_check.class.to_s,
          state: enum_from_string(status_check.state),
          context: status_check.context,
          created_at: status_check.created_at,
          updated_at: status_check.updated_at,
        }
      end

      def copilot_settings(settings)
        return unless settings
        {
          telemetry_configuration: copilot_telemetry_setting(settings.fetch(:telemetry_configuration, nil)),
          snippy_setting: copilot_snippy_setting(settings.fetch(:snippy_setting, nil)),
          editor_chat_setting: copilot_editor_chat_setting(settings.fetch(:editor_chat_setting, nil)),
          github_chat_setting: copilot_github_chat_setting(settings.fetch(:github_chat_setting, nil)),
          custom_models_setting: copilot_custom_models_setting(settings.fetch(:custom_models_setting, nil)),
          pr_summarizations_setting: copilot_pr_summarizations_setting(settings.fetch(:pr_summarizations_setting, nil)),
          private_docs_setting: copilot_private_docs_setting(settings.fetch(:private_docs_setting, nil)),
          cli_setting: copilot_cli_setting(settings.fetch(:cli_setting, nil)),
          copilot_extensions_setting: copilot_extensions_setting(settings.fetch(:copilot_extensions_setting, nil)),
        }
      end

      def copilot_business_settings(settings)
        return unless settings

        {
          snippy_setting: copilot_snippy_setting(settings.fetch(:snippy_setting, nil)),
          copilot_enabled_setting: copilot_enabled_setting(settings.fetch(:copilot_enabled_setting, nil)),
          editor_chat_setting: copilot_editor_chat_setting(settings.fetch(:editor_chat_setting, nil)),
          mobile_chat_setting: copilot_mobile_chat_setting(settings.fetch(:mobile_chat_setting, nil)),
          github_chat_setting: copilot_github_chat_setting(settings.fetch(:github_chat_setting, nil)),
          pr_summarizations_setting: copilot_pr_summarizations_setting(settings.fetch(:pr_summarizations_setting, nil)),
          cli_setting: copilot_cli_setting(settings.fetch(:cli_setting, nil)),
          private_docs_setting: copilot_private_docs_setting(settings.fetch(:private_docs_setting, nil)),
          usage_telemetry_api_setting: copilot_usage_telemetry_api_setting(settings.fetch(:usage_telemetry_api_setting, nil)),
          custom_models_setting: copilot_custom_models_setting(settings.fetch(:custom_models_setting, nil)),
          github_chat_bing_access_setting: copilot_github_chat_bing_access_setting(settings.fetch(:github_chat_bing_access_setting, nil)),
          copilot_beta_features_opt_in_setting: copilot_beta_features_opt_in_setting(settings.fetch(:copilot_beta_features_opt_in_setting, nil)),
          copilot_extensions_setting: copilot_extensions_setting(settings.fetch(:copilot_extensions_setting, nil)),
        }
      end

      def copilot_organization(organization)
        return unless organization

        {
          organization: organization(organization),
          analytics_tracking_id: organization.analytics_tracking_id,
        }
      end

      def copilot_organization_settings(settings)
        return unless settings

        {
          snippy_setting: copilot_snippy_setting(settings.fetch(:snippy_setting, nil)),
          copilot_enabled_setting: copilot_enabled_setting(settings.fetch(:copilot_enabled_setting, nil)),
          editor_chat_setting: copilot_editor_chat_setting(settings.fetch(:editor_chat_setting, nil)),
          mobile_chat_setting: copilot_mobile_chat_setting(settings.fetch(:mobile_chat_setting, nil)),
          github_chat_setting: copilot_github_chat_setting(settings.fetch(:github_chat_setting, nil)),
          pr_summarizations_setting: copilot_pr_summarizations_setting(settings.fetch(:pr_summarizations_setting, nil)),
          cli_setting: copilot_cli_setting(settings.fetch(:cli_setting, nil)),
          private_docs_setting: copilot_private_docs_setting(settings.fetch(:private_docs_setting, nil)),
          usage_telemetry_api_setting: copilot_usage_telemetry_api_setting(settings.fetch(:usage_telemetry_api_setting, nil)),
          custom_models_setting: copilot_custom_models_setting(settings.fetch(:custom_models_setting, nil)),
          github_chat_bing_access_setting: copilot_github_chat_bing_access_setting(settings.fetch(:github_chat_bing_access_setting, nil)),
          copilot_beta_features_opt_in_setting: copilot_beta_features_opt_in_setting(settings.fetch(:copilot_beta_features_opt_in_setting, nil)),
          copilot_extensions_setting: copilot_extensions_setting(settings.fetch(:copilot_extensions_setting, nil)),
        }
      end

      def copilot_beta_features_opt_in_setting(setting)
        return setting if setting.is_a?(Symbol)

        return :COPILOT_BETA_FEATURES_OPT_IN_ENABLED if setting == "enabled"
        return :COPILOT_BETA_FEATURES_OPT_IN_DISABLED if setting == "disabled"
        return :COPILOT_BETA_FEATURES_OPT_IN_NO_POLICY if setting == "no_policy"

        :COPILOT_BETA_FEATURES_OPT_IN_UNKNOWN
      end

      def copilot_extensions_setting(setting)
        return setting if setting.is_a?(Symbol)

        return :COPILOT_EXTENSIONS_ENABLED if setting == "enabled"
        return :COPILOT_EXTENSIONS_DISABLED if setting == "disabled"
        return :COPILOT_EXTENSIONS_UNCONFIGURED if setting == "unconfigured"
        return :COPILOT_EXTENSIONS_NO_POLICY if setting == "no_policy"

        :COPILOT_EXTENSIONS_UNKNOWN
      end

      def copilot_telemetry_setting(setting)
        return setting if setting.is_a?(Symbol)

        return :ENABLED if setting == true
        return :DISABLED if setting == false
        :UNKNOWN
      end

      def copilot_snippy_setting(setting)
        return setting if setting.is_a?(Symbol)

        return :SNIPPY_ENABLED if setting == true
        return :SNIPPY_DISABLED if setting == false

        :SNIPPY_UNKNOWN
      end

      def copilot_editor_chat_setting(setting)
        return setting if setting.is_a?(Symbol)

        return :EDITOR_CHAT_ENABLED if setting == "enabled"
        return :EDITOR_CHAT_DISABLED if setting == "disabled"
        return :EDITOR_CHAT_UNCONFIGURED if setting == "unconfigured"
        return :EDITOR_CHAT_NO_POLICY if setting == "no_policy"

        :EDITOR_CHAT_UNKNOWN
      end

      def copilot_mobile_chat_setting(setting)
        return setting if setting.is_a?(Symbol)

        return :MOBILE_CHAT_ENABLED if setting == "enabled"
        return :MOBILE_CHAT_DISABLED if setting == "disabled"
        return :MOBILE_CHAT_NO_POLICY if setting == "no_policy"

        :MOBILE_CHAT_UNKNOWN
      end

      def copilot_github_chat_setting(setting)
        return setting if setting.is_a?(Symbol)

        return :GITHUB_CHAT_ENABLED if setting == "enabled"
        return :GITHUB_CHAT_DISABLED if setting == "disabled"
        return :GITHUB_CHAT_UNCONFIGURED if setting == "unconfigured"
        return :GITHUB_CHAT_NO_POLICY if setting == "no_policy"

        :GITHUB_CHAT_UNKNOWN
      end

      def copilot_github_chat_bing_access_setting(setting)
        return setting if setting.is_a?(Symbol)

        return :GITHUB_CHAT_BING_ACCESS_ENABLED if setting == "enabled"
        return :GITHUB_CHAT_BING_ACCESS_DISABLED if setting == "disabled"
        return :GITHUB_CHAT_BING_ACCESS_UNCONFIGURED if setting == "unconfigured"
        return :GITHUB_CHAT_BING_ACCESS_NO_POLICY if setting == "no_policy"

        :GITHUB_CHAT_BING_ACCESS_UNKNOWN
      end

      def copilot_pr_summarizations_setting(setting)
        return setting if setting.is_a?(Symbol)

        return :PR_SUMMARIZATIONS_ENABLED if setting == "enabled"
        return :PR_SUMMARIZATIONS_DISABLED if setting == "disabled"
        return :PR_SUMMARIZATIONS_UNCONFIGURED if setting == "unconfigured"
        return :PR_SUMMARIZATIONS_NO_POLICY if setting == "no_policy"

        :PR_SUMMARIZATIONS_UNKNOWN
      end

      def copilot_cli_setting(setting)
        return setting if setting.is_a?(Symbol)

        return :CLI_ENABLED if setting == "enabled"
        return :CLI_DISABLED if setting == "disabled"
        return :CLI_UNCONFIGURED if setting == "unconfigured"
        return :CLI_NO_POLICY if setting == "no_policy"

        :CLI_UNKNOWN
      end

      def copilot_custom_models_setting(setting)
        return setting if setting.is_a?(Symbol)

        return :CUSTOM_MODELS_ENABLED if setting == "enabled"
        return :CUSTOM_MODELS_DISABLED if setting == "disabled"
        return :CUSTOM_MODELS_UNCONFIGURED if setting == "unconfigured"
        return :CUSTOM_MODELS_NO_POLICY if setting == "no_policy"

        :CUSTOM_MODELS_UNKNOWN
      end

      def copilot_private_docs_setting(setting)
        return setting if setting.is_a?(Symbol)

        return :PRIVATE_DOCS_ENABLED if setting == "enabled"
        return :PRIVATE_DOCS_DISABLED if setting == "disabled"
        return :PRIVATE_DOCS_UNCONFIGURED if setting == "unconfigured"
        return :PRIVATE_DOCS_NO_POLICY if setting == "no_policy"

        :PRIVATE_DOCS_UNKNOWN
      end

      def copilot_usage_telemetry_api_setting(setting)
        return setting if setting.is_a?(Symbol)

        return :USAGE_TELEMETRY_API_ENABLED if setting == "enabled"
        return :USAGE_TELEMETRY_API_DISABLED if setting == "disabled"

        :USAGE_TELEMETRY_API_UNKNOWN
      end

      def copilot_enabled_setting(setting)
        return setting if setting.is_a?(Symbol)

        return :COPILOT_ENABLED if setting == "enabled"
        return :COPILOT_DISABLED if setting == "disabled"
        return :COPILOT_ALL_ORGANIZATIONS if setting == "all_organizations"
        return :COPILOT_SELECTED_ORGANIZATIONS if setting == "selected_organizations"

        :COPILOT_UNKNOWN
      end

      def copilot_plan(plan)
        return :BUSINESS if plan == "business"
        return :ENTERPRISE if plan == "enterprise"

        :UNKNOWN
      end

      def copilot_subscription_plan(plan)
        return :UNKNOWN_PLAN unless plan

        plan = plan.to_s.downcase

        return :YEARLY if plan == "year" || plan == "yearly"
        return :MONTHLY if plan == "month" || plan == "monthly"
        :NO_SUBSCRIPTION
      end

      def copilot_free_user_type(free_user_type)
        case free_user_type
        when Copilot::FreeUser::COMPLIMENTARY_ACCESS.name
          :COMPLIMENTARY_ACCESS
        when Copilot::FreeUser::EDUCATIONAL.name
          :EDUCATIONAL
        when Copilot::FreeUser::ENGAGED_OSS.name
          :ENGAGED_OSS
        when Copilot::FreeUser::FACULTY.name
          :FACULTY
        when Copilot::FreeUser::GITHUB_STAR.name
          :GITHUB_STAR
        when Copilot::FreeUser::HEY_GITHUB.name
          :HEY_GITHUB
        when Copilot::FreeUser::MS_MVP.name
          :MS_MVP
        when Copilot::FreeUser::TECHNICAL_PREVIEW_EXTENSION.name
          :TECHNICAL_PREVIEW_EXTENSION
        when Copilot::FreeUser::WORKSHOP.name
          :WORKSHOP
        when Copilot::FreeUser::Y_COMBINATOR.name
          :Y_COMBINATOR
        else
          :FREE_USER_UNKNOWN
        end
      end

      def copilot_owner_details(owner)
        return unless owner

        is_business = owner.is_a?(::Business) ? true : false
        copilot_object = is_business ? Copilot::Business.new(owner) : Copilot::Organization.new(owner)

        {
          analytics_tracking_id: is_business ? nil : owner.analytics_tracking_id,
          billing_type: copilot_object.copilot_billing_type || "invoice",
          business: is_business ? business(owner) : nil,
          current_metered_billing_cycle_starts_at: Google::Protobuf::Timestamp.new(seconds: owner.current_metered_billing_cycle_starts_at.to_i, nanos: 0),
          next_metered_billing_cycle_starts_at: Google::Protobuf::Timestamp.new(seconds: owner.next_metered_billing_cycle_starts_at.to_i, nanos: 0),
          organization: is_business ? nil : organization(owner),
          is_standalone: (is_business && copilot_object.copilot_standalone?) || false,
        }
      end

      def copilot_seat(seat)
        return unless seat

        owner = seat.seat_assignment.owner

        is_business = owner.is_a?(::Business) ? true : false

        {
          assigned_user: user(seat.assigned_user),
          assignment: copilot_seat_assignment(seat.seat_assignment),
          created_at: Google::Protobuf::Timestamp.new(seconds: seat.created_at.to_i, nanos: 0),
          enterprise_id: is_business ? owner.id : nil,
          id: seat.id,
          organization_id: is_business ? nil : owner&.id,
        }
      end

      def copilot_seat_emission(seat_emission)
        return unless seat_emission

        is_business = seat_emission.owner.is_a?(::Business) ? true : false

        {
          business: is_business ? business(seat_emission.owner) : nil,
          created_at: Google::Protobuf::Timestamp.new(seconds: seat_emission.created_at.to_i, nanos: 0),
          emission: JSON.dump(seat_emission.emission),
          id: seat_emission.id,
          occurred_at: Google::Protobuf::Timestamp.new(seconds: seat_emission.occurred_at.to_i, nanos: 0),
          organization: is_business ? nil : organization(seat_emission.owner),
          quantity: seat_emission.quantity.to_f,
          unique_id: seat_emission.unique_id,
        }
      end

      def copilot_seat_assignment(assignment)
        return unless assignment

        pending_cancellation_date_value = nil

        pending_cancellation_date = assignment.pending_cancellation_date

        if pending_cancellation_date.present?
          pending_cancellation_date_value = Google::Protobuf::Timestamp.new(seconds: pending_cancellation_date.to_time.to_i, nanos: 0)
        end

        owner = assignment.owner
        is_business = owner.is_a?(::Business) ? true : false

        {
          assignable_id: assignment.assignable_id,
          assignable_type: assignment.assignable_type,
          business: is_business ? business(assignment.owner) : nil,
          created_at: Google::Protobuf::Timestamp.new(seconds: assignment.created_at.to_i, nanos: 0),
          id: assignment.id,
          organization: is_business ? nil : organization(assignment.owner),
          pending_cancellation_date: pending_cancellation_date_value,
          updated_at: Google::Protobuf::Timestamp.new(seconds: assignment.updated_at.to_i, nanos: 0),
        }
      end

      def copilot_for_business_details(details)
        return unless details

        details.map do |detail|
          copilot_for_business_detail(detail)
        end
      end

      def copilot_for_business_detail(detail)
        return unless detail
        {
          key: detail[0].to_s,
          value: detail[1].to_s
        }
      end

      def dashboard_saved_collection(saved_collection)
        return unless saved_collection
        {
          id: saved_collection.id,
          dashboard_id: saved_collection.dashboard_id,
          name: saved_collection.name,
          created_at: saved_collection.created_at,
          updated_at: saved_collection.updated_at,
        }
      end

      def dashboard_saved_view(saved_view)
        return unless saved_view
        {
          id: saved_view.id,
          name: saved_view.name,
          compressed_query: saved_view.compressed_query,
          created_at: saved_view.created_at,
          updated_at: saved_view.updated_at,
        }
      end

      def push(ref:, before:, after:)
        return unless ref && before && after
        {
          ref:,
          before:,
          after:
        }
      end

      def rule_run(rule_run)
        return unless rule_run
        ruleset = rule_run.rule_config&.repository_ruleset

        result = if RuleEngine::RuleRun::RESULTS.keys.include?(rule_run.result)
          rule_run.result.upcase.to_sym
        else
          :RESULT_UNKNOWN
        end

        source_type = if ruleset
          type = ruleset.source.class.name
          if %w[Repository Organization].include?(type)
            type.upcase.to_sym
          else
            :RULESET_SOURCE_TYPE_UNKNOWN
          end
        else
          :RULESET_SOURCE_TYPE_NOT_APPLICABLE
        end

        enforcement = if RepositoryRuleset.enforcements.include?(ruleset&.enforcement)
          ruleset.enforcement.upcase.to_sym
        else
          # default to enabled
          :ENABLED
        end

        target = if ruleset
          if RepositoryRuleset.targets.include?(ruleset.target)
            ruleset.target.upcase.to_sym
          else
            :RULESET_TARGET_UNKNOWN
          end
        else
          :RULESET_TARGET_NOT_APPLICABLE
        end

        {
          id: rule_run.id,
          result: result,
          message: rule_run.message,
          rule_type: rule_run.rule_type,
          rule_suite_id: rule_run.repository_rule_suite_id,
          rule_configuration_id: rule_run.repository_rule_configuration_id,
          ruleset_id: ruleset&.id,
          ruleset_name: ruleset&.name,
          ruleset_target: target,
          ruleset_source_type: source_type,
          enforcement: enforcement,
          rule_provider: rule_run.rule_provider,
          violations: (rule_run.violations || {}).to_json,
          evaluation_metadata: (rule_run.evaluation_metadata || {}).to_json
        }
      end

      def public_key(key)
        return unless key
        {
          id: key.id,
          user: user(key.user),
          repository: repository(key.repository),
          username: key.username,
          title: key.title,
          created_at: key.created_at,
          updated_at: key.updated_at,
          verified_at: key.verified_at,
          creator: user(key.creator),
          verifier: user(key.verifier),
          accessed_at: key.accessed_at,
          created_by: key.created_by.upcase.to_sym,
          read_only: key.read_only
        }
      end

      def model_feedback_type(type)
        case type
        when 1
          :POSITIVE
        when 2
          :NEGATIVE
        else
          :UNKNOWN
        end
      end

      def model_feedback_choices(choices)
        choices.each_with_object([]) do |choice, array|
          case choice
          when "harmful"
            array << :HARMFUL
          when "not true"
            array << :NOT_TRUE
          when "unhelpful"
            array << :UNHELPFUL
          when "other"
            array << :OTHER
          else
            array << :UNKNOWN_CHOICE
          end
        end
      end

      sig { params(change_request: Billing::SalesServeSubscriptionChangeRequest).returns(T.nilable(T::Hash[Symbol, T.untyped])) }
      def sales_serve_subscription_change_request(change_request)
        {
          request_id: change_request.request_uuid,
          zuora_subscription_id: change_request.zuora_subscription_id,
          product: change_request.items.map do |item|
            sales_serve_subscription_change_request_item(item)
          end
        }
      end

      sig { params(item: Billing::SalesServeSubscriptionChangeRequestItem).returns(T.nilable(T::Hash[Symbol, T.untyped])) }
      def sales_serve_subscription_change_request_item(item)
        {
          product_rate_plan_charge_id: item.product_rate_plan_charge_id,
          quantity: item.quantity,
          price: item.price.to_f,
          start_date: item.start_date,
          end_date: item.end_date,
          type: enum_from_string(item.change_type),
        }
      end
    end
  end
end
