# frozen_string_literal: true
# Socket events to be sent out to integration installation channel when installation is created/modified.
# These events will be consumed in stacks config UI for live update of app's installation status.
# These events are only sent to stack instance repos in configuration state (not_started status).

# Helper to send the events
class IntegrationInstallationEventHelper
  def self.notify_socket_subscribers(stack_instances, message)
    data = {
      timestamp: Time.now.to_i,
      reason: message,
    }

    stack_instances.each do |instance|
      channel = GitHub::WebSocket::Channels.integration_installation(instance.instance_repository)
      GitHub::WebSocket.notify_repository_channel(instance.instance_repository, channel, data)
    end
  end
end

# Triggers a socket event when app is installed in a target.
GitHub.subscribe("integration_installation.create") do |_, _, _, _, payload|
  # Do not send events for internal apps with skip_stacks_websocket_updates marked.
  next if Apps::Internal.capable?(:skip_stacks_websocket_updates, app: Integration.find_by(id: payload[:integration_id].to_i))

  installation = IntegrationInstallation.find(payload[:installation_id])
  stack_instances = StacksInstanceQuery.not_started_stacks_instances(installation.repository_ids)
  IntegrationInstallationEventHelper.notify_socket_subscribers(stack_instances, "integration installation created")
end

# Triggers a socket event when repositories are added to an installation.
GitHub.subscribe "integration_installation.repositories_added" do |_, _, _, _, payload|
  # Do not send events for internal apps with skip_stacks_websocket_updates marked.
  next if Apps::Internal.capable?(:skip_stacks_websocket_updates, app: Integration.find_by(id: payload[:integration_id].to_i))

  stack_instances = StacksInstanceQuery.not_started_stacks_instances(payload[:repositories_added])
  IntegrationInstallationEventHelper.notify_socket_subscribers(stack_instances, "repo added to installation")
end

# Triggers a socket event when repositories are removed from an installation.
GitHub.subscribe "integration_installation.repositories_removed" do |_, _, _, _, payload|
  # Do not send events for internal apps with skip_stacks_websocket_updates marked.
  next if Apps::Internal.capable?(:skip_stacks_websocket_updates, app: Integration.find_by(id: payload[:integration_id].to_i))

  stack_instances = StacksInstanceQuery.not_started_stacks_instances(payload[:repositories_removed])
  IntegrationInstallationEventHelper.notify_socket_subscribers(stack_instances, "repo removed from installation")
end
