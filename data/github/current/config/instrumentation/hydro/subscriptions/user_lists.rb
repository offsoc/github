# frozen_string_literal: true

# These are Hydro event subscriptions related to user-created lists of starred items.

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("user_list.create") do |payload|
    user_list = payload[:user_list]
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user_list: serializer.user_list(user_list),
      user: serializer.user(user_list.user),
    }
    publish(message, schema: "github.user_lists.v1.UserListCreate")
  end

  subscribe("user_list.update") do |payload|
    old_user_list = payload[:old_user_list]
    new_user_list = payload[:new_user_list]
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      old_user_list: serializer.user_list(old_user_list),
      user: serializer.user(new_user_list.user),
      new_user_list: serializer.user_list(new_user_list),
    }
    publish(message, schema: "github.user_lists.v1.UserListUpdate")
  end

  subscribe("user_list.delete") do |payload|
    user_list = payload[:user_list]
    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user_list: serializer.user_list(user_list),
      user: serializer.user(user_list.user),
    }
    publish(message, schema: "github.user_lists.v1.UserListDelete")
  end

  subscribe("user_list.add_item") do |payload|
    user_list_item = payload[:user_list_item]
    user_list = payload[:user_list]
    repo = payload[:repository]

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user_list: serializer.user_list(user_list),
      user: serializer.user(user_list.user),
      user_list_item: serializer.user_list_item(user_list_item),
    }

    if repo
      message[:repository] = serializer.repository(repo)

      repo_owner = repo.owner
      if repo_owner
        message[:repository_owner] = serializer.user(repo_owner)
      end
    end

    publish(message, schema: "github.user_lists.v1.UserListAddItem")
  end

  subscribe("user_list.remove_item") do |payload|
    user_list_item = payload[:user_list_item]
    user_list = payload[:user_list]
    repo = payload[:repository]

    message = {
      request_context: serializer.request_context(GitHub.context.to_hash),
      user_list: serializer.user_list(user_list),
      user: serializer.user(user_list.user),
      user_list_item: serializer.user_list_item(user_list_item),
    }

    if repo
      message[:repository] = serializer.repository(repo)

      repo_owner = repo.owner
      if repo_owner
        message[:repository_owner] = serializer.user(repo_owner)
      end
    end

    publish(message, schema: "github.user_lists.v1.UserListRemoveItem")
  end
end
