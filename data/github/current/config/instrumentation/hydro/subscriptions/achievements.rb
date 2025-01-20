# frozen_string_literal: true

# These are Hydro event subscriptions related to Achievements.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("achievement.create") do |payload|
    achievement = payload[:achievement]
    serialized_user = serializer.user(achievement.user)

    message = {
      user: serialized_user,
      achievable: achievement.achievable.slug.underscore.upcase,
      tier: achievement.tier,
      visibility: achievement.private_scope? ? :PRIVATE : :PUBLIC,
    }.freeze

    publish(
      message,
      schema: "github.achievements.v1.AchievementUnlock",
      publisher: GitHub.user_generated_content_hydro_publisher,
    )
  end
end
