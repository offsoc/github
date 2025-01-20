# frozen_string_literal: true

GlobalInstrumenter.subscribe("repository.deleted") do |event|
  repo = event.payload[:deleted_repository]

  RepositorySecurityConfiguration.where(repository_id: repo.id).destroy_all
end
