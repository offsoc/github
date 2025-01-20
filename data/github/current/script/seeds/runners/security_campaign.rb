# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class SecurityCampaign < Seeds::Runner
      def self.help
        <<~HELP
        Create/update a repo with a seeded security campaign for security campaign development

        - by default creates new repo (or creates/updates named one)

        The alerts match with turbomock.

        HELP
      end

      def self.run(options = {})
        puts "\n"

        @owner = find_owner(options)

        print "Marking advanced security as purchased..."
        if @owner.business.present?
          @owner.business.mark_advanced_security_as_purchased_for_entity(actor: @owner.admins.first)
        else
          @owner.mark_advanced_security_as_purchased_for_entity(actor: @owner.admins.first)
        end
        puts " ✅\n\n"

        print "Creating/updating example repo for security campaigns..."
        @repo = Seeds::Objects::Repository.create(
          owner_name: @owner.login,
          repo_name: options[:repo_name] || "security-campaigns-#{Time.now.to_i}",
          setup_master: true,
        )
        puts " ✅\n\n"

        @repo.reload

        print "Enabling advanced security..."
        @repo.enable_advanced_security(actor: @owner.admins.first)
        puts " ✅\n\n"

        @manager = find_manager(options)

        security_campaign = ::SecurityCampaigns::SecurityCampaign.create!(
          organization: @owner,
          name: options[:campaign_name] || "User-controlled injection",
          description: options[:campaign_description] || "Directly using user input (for example, an HTTP request parameter) without first sanitizing the input might allow a user to inject SQL, HTML, JavaScript, or other code into your application.",
          ends_at: (options[:campaign_duration] || 30).days.from_now,
          manager: @manager
        )
        (1..6).each do |logical_alert_number|
          ::SecurityCampaigns::SecurityCampaignAlert.create!(
            security_campaign: security_campaign,
            repository: @repo,
            logical_alert_number:,
          )
        end

        print "Enabling feature flags..."
        GitHub.flipper[:security_campaigns].enable(@owner)
        GitHub.flipper[:security_campaigns_creation].enable(@owner)
        puts " ✅\n\n"

        puts "\n"
        puts "Your security campaign is ready:\n"
        puts "    http://#{GitHub.host_name}/#{@repo.nwo}/security/campaigns/#{security_campaign.number}"
        puts "\n"
      end

      def self.find_owner(options = {})
        return ::Organization.find_by!(login: options[:organization_name]) if options[:org]

        Seeds::Objects::Organization.github
      end

      def self.find_manager(options = {})
        return ::User.find_by!(login: options[:manager_name]) if options[:manager]

        Seeds::Objects::User.monalisa
      end
    end
  end
end
