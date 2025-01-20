# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class RequestAFeature < Seeds::Runner
      def self.help
        <<~HELP
        Create sample feature requests to demonstrate Request a feature (MemberFeatureRequest).
        HELP
      end

      def self.run(options = {})
        require_relative "../factory_bot_loader"

        org_name = options.fetch(:org_name,  "request-a-feature-org")
        user_count = options.fetch(:user_count,  5)
        plan = options.fetch(:plan,  GitHub::Plan.free)
        enterprise_request = options.fetch(:enterprise, false)

        timestamp = Time.zone.parse(options[:timestamp]) if options[:timestamp]
        timestamp ||= Time.current

        mona = Seeds::Objects::User.monalisa
        organization = Seeds::Objects::Organization.create(login: org_name, admin: mona, plan:)
        members = Seeds::Objects::User.random_create(count: user_count)

        business = setup_business_with_org(organization) if enterprise_request
        enable_feature_flags(members + [mona], [organization, business].flatten.compact)
        members.each { |requester| create_requests(requester, organization, business, timestamp, enterprise_request) }
        create_notifications(mona, organization, business, enterprise_request) if options[:notifications]
      end

      def self.create_requests(requester, organization, business, timestamp, enterprise_request)
        enterprise_request ? organization.add_admin(requester) : organization.add_member(requester)

        MemberFeatureRequest::Feature.values.each do |feature|
          next if enterprise_request && feature != MemberFeatureRequest::Feature::CopilotForBusiness

          ts = rand(timestamp..Time.current)
          MemberFeatureRequest.create!(
            feature:,
            requester:,
            request_entity: organization,
            billing_entity: enterprise_request ? business : organization,
            created_at: ts,
            updated_at: ts
          )
        end
      end

      def self.setup_business_with_org(organization)
        name = "request-a-feature-business"
        Business.find_by(name: name)&.destroy
        factory_opts = [:business, :with_self_serve_payment, { name: name, owners: [Objects::User.monalisa] }]
        business = FactoryBot.create(*T.unsafe(factory_opts))
        business.add_organization(organization)
        business
      end

      def self.create_notifications(admin, organization, business, enterprise_request)
        MemberFeatureRequest::Feature.values.each do |feature|
          next if enterprise_request && feature != MemberFeatureRequest::Feature::CopilotForBusiness

          notification = MemberFeatureRequest::Notification.create(
            user_id: admin.id,
            feature: feature.to_s,
            entity: enterprise_request ? business : organization,
            feature_request_count: rand(1..5)
          )

          summary = NotificationSummary.new(
            list: notification.notifications_list,
            thread: notification.notifications_thread
          ).summarize!(notification)

          Newsies::NotificationEntry.insert(admin.id, summary, reason: "member_feature_requested", event_time: 1.day.ago)
        end
      end

      def self.enable_feature_flags(actors, entities)
        actor_feature_flags = %i(raf_email_notifications_notifyd)
        actors.each do |user|
          actor_feature_flags.each do |feature_flag|
            Seeds::Objects::FeatureFlag.toggle(action: :enable, feature_flag:, actor_name: user.display_login)
          end
        end
      end
    end
  end
end
