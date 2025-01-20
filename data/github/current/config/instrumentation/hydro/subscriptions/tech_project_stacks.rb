# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("tech_project_stack_analysis.repository") do |payload|
    message = {
      repository: serializer.repository(payload[:repository]),
      commit_oid: payload[:commit_oid],
      tech_project_stacks: payload[:tech_project_stacks].map do |tech_project_stack|
        {
          path: tech_project_stack["path"],
          tech_stack: tech_project_stack["tech_stack"].map do |tech_stack|
            {
              name: tech_stack["name"],
              settings: tech_stack["settings"],
              size_value: tech_stack["size"]
            }
          end
        }
      end
    }

    publish(message,
      schema: "github.tech_project_stacks.v0.RepositoryTechProjectStacks",
      topic_format_options: { format_version: Hydro::Topic::FormatVersion::V2 })
  end
end
