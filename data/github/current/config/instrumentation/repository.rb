# frozen_string_literal: true

GitHub.subscribe "repo.archived" do |*_args|
  GitHub.dogstats.increment("repository.archived")
end

GitHub.subscribe "repo.unarchived" do |*_args|
  GitHub.dogstats.increment("repository.unarchived")
end

GitHub.subscribe "repo.max_manifests_hit_on_detect" do |_name, _start, _finish, _id, payload|
  amount = payload[:amount]
  GitHub.dogstats.increment("repository.max_manifests_hit_total")
  GitHub.dogstats.gauge("repository.max_manifests_hit_on_detect.count", amount)
end

GitHub.subscribe "repo.max_files_for_detection_hit_on_tree_files" do |_name, _start, _finish, _id, _payload|
  GitHub.dogstats.increment("repository.max_files_for_detection_hit_on_tree_files_total")
end

GitHub.subscribe "repo.max_manifests_hit_on_update" do |_name, _start, _finish, _id, payload|
  amount = payload[:amount]
  GitHub.dogstats.increment("repository.max_manifests_hit_total")
  GitHub.dogstats.gauge("repository.max_manifests_hit_on_update.count", amount)
end

GitHub.subscribe "repo.max_manifest_file_size_hit" do |_name, _start, _finish, _id, _payload|
  GitHub.dogstats.increment("repository.max_manifest_file_size_hit_total")
end
