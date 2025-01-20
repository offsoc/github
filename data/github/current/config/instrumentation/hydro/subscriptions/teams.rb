# typed: true
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GitHub) do
  subscribe("team.rename") do |payload|
    message = {
      team: serializer.team(Team.find_by(id: payload[:team_id])),
      previous_name: payload[:name_was],
      current_name: payload[:name],
    }

    publish(message, schema: "github.v1.TeamRename")
  end
end
