# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class SsoIdentityCodespaceExternalGroup < Seeds::Objects::SsoIdentityCodespaceAddMultiTenant
      def self.create(groups_seed_data, seed_data)
        groups_seed_data.each do |external_id, group_data|
          display_name = group_data[:display_name]

          puts "Creating #{display_name} external group and memberships"

          group_data[:business].each do |slug|
            business = ::Business.find_by(slug: slug)
            next unless business.present?

            shortcode = business.shortcode
            environment = seed_data.businesses_data[slug][:environment]

            # create external groups
            external_group = business.external_provider.external_groups.find_by(display_name: display_name)
            unless external_group.present?
              external_group = ::ExternalGroup.create(
                provider: business.external_provider,
                external_id:  external_id,
                display_name: display_name
              )

              raise Objects::CreateFailed, "external group didn't create!" unless external_group.persisted?
            end

            if environment == "mt"
              on_multi_tenant_enterprise(business) do
                create_external_group_memberships(group_data, external_group, shortcode)
                create_external_group_teams(group_data, external_group, slug, shortcode, environment)
              end
            else
              create_external_group_memberships(group_data, external_group, shortcode)
              create_external_group_teams(group_data, external_group, slug, shortcode, environment)
            end
          end
        end
      end

      def self.create_external_group_memberships(group_data, external_group, shortcode)
        group_data[:members].each do |login|
          user_login = shortcode ? "#{login}_#{shortcode}" : login
          user = ::User.find_by(login: user_login)

          next unless user.present?

          external_identity = user.external_identities.first
          # create external group membership
          external_group_membership = external_group.external_identity_group_memberships.where(external_identity: external_identity)
          unless external_group_membership.present?
            external_group_membership = ::ExternalIdentityGroupMembership.create(
              external_group: external_group,
              external_identity: external_identity,
            )

            raise Objects::CreateFailed, "external group membership didn't create!" unless external_group_membership.persisted?
          end
        end
      end

      def self.create_external_group_teams(group_data, external_group, slug, shortcode, environment)
        if group_data[:teams]
          # Add the group to the team
          group_data[:teams].each do |org_name, team_name|
            org_name = "#{slug}-#{org_name}"
            org_name += "_#{shortcode}" if shortcode && environment == "mt"

            # find organization
            organization = ::Organization.find_by(login: org_name)
            next unless organization.present?

            team = organization.teams.find_by(name: team_name)
            if team.present? && external_group.present?
              begin
                group_team = ::ExternalGroupTeam.create(external_group: external_group, team: team)
                external_group.external_identity_group_memberships.each do |membership|
                  group_team.add_member(membership.external_identity.user)
                end
              rescue ActiveRecord::RecordNotUnique
              end
            end
          end
        end
      end
    end
  end
end
