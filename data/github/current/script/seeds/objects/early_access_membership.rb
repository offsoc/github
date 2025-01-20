# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class EarlyAccessMembership
      def self.create(member:, feature_slug:, feature_enabled: false, actor: nil, survey: nil, force: false)
        survey ||= Survey.create(title: feature_slug, slug: feature_slug)

        actor ||= member

        early_access_membership = :: EarlyAccessMembership.find_by(member: member, actor: actor, feature_slug: feature_slug, survey: survey)

        if early_access_membership
          early_access_membership.update(feature_enabled: feature_enabled)
          return early_access_membership
        end

        eam = ::EarlyAccessMembership.new(
          member: member,
          actor: actor,
          feature_slug: feature_slug,
          survey: survey,
          feature_enabled: feature_enabled,
        )
        validate = !force
        eam.save(validate: validate)
        eam
      end
    end
  end
end
