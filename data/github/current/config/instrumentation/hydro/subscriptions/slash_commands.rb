# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("slash_commands.update") do |payload|
    command = payload[:command]
    context = command.context
    platform = payload[:platform]&.upcase&.to_sym
    phase =
      if command.first_page? && command.last_page?
        :STARTED_AND_FINISHED
      elsif command.first_page?
        :STARTED
      elsif command.last_page?
        :FINISHED
      else
        :CONTINUED
      end

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      command_name: command.class.name,
      trigger: {
        name: command.trigger.name,
        title: command.trigger.title,
        description: command.trigger.description
      },
      page_number: command.page_number,
      page_type: command.page.type,
      has_footer: command.footer.present?,
      command_data: command.data.to_json,
      resource_type: context.subject_type,
      resource_id: context.subject_id.to_i,
      surface: context.surface,
      user: serializer.user(context.current_user),
      repository: serializer.repository(context.current_repository),
      category: command.class._category,
      phase: phase,
      platform: platform,
      employee_triggered: context.current_user.employee?,
    }

    publish(message, schema: "github.v1.SlashCommandCalled", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }) # rubocop:disable GitHub/HydroPublishLegacyTopicFormat
  end
end
