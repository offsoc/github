# frozen_string_literal: true
ActiveRecord::Base.connected_to(role: :reading) do
  puts "Version 1.2.1"
  start_time = 30.days.ago.beginning_of_day
  sql = ApplicationRecord::Base.github_sql.run(<<-SQL, {start_time: start_time})
    SELECT DISTINCT repository_id FROM ts_analyses WHERE created_at >= :start_time
  SQL
  code_scanning_repos = Set.new(sql.results.flatten)
  emails = Set.new
  start_time = 90.days.ago.beginning_of_day
  Repository.where(active: true).find_in_batches do |batch|
    Configurable.try(:preload_configuration, batch)
    batch.each do |repo|
      next unless code_scanning_repos.member?(repo.id) || repo.token_scanning_enabled?
      Push
        .where(repository: repo)
        .where("created_at >= ?", start_time)
        .find_each do |push|
          begin
            push.commits_pushed.each do |commit|
              commit.author_emails.each do |email|
                emails << email unless UserEmail.belongs_to_a_bot?(email)
              end
            end
          rescue GitRPC::BadObjectState, GitRPC::BadGitmodules, GitRPC::SymlinkDisallowed, GitRPC::Timeout => e
            puts "Git error while fetching commit: '#{push.after}'. #{e.class}: #{e.message}"
          end
        end
    end
  end
  users = Set.new
  emails.each_slice(1000) do |batch|
    emails_to_users_hash = User.find_by_emails(batch)
    active_users = emails_to_users_hash.values.select do |user|
      !(user.disabled? || user.suspended?)
    end
    users.merge(active_users)
  end
  puts "Advanced Security committers in the past 90d: #{users.size}"
end
