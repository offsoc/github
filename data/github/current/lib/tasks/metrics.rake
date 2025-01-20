# frozen_string_literal: true
require "csv"

namespace :metrics do
  desc "CSV summary of organizations and seats in 7-day periods aligned to UTC Mondays."
  task :org_history => :environment do
    csv = CSV.new($stdout, :write_headers => true, :headers => [:trailing_end, :new_orgs_created, :total_orgs, :large_orgs, :total_seats])

    large_org_team_size = 100
    total_orgs = 0
    prev_monday = Organization.first.created_at.utc.beginning_of_week

    ActiveRecord::Base.connected_to(role: :reading) do
      each_utc_monday_since(prev_monday) do |monday|
        params = { :prev_monday => prev_monday, :monday => monday }

        # Orgs created in during the 7-day trailing period.
        new_orgs = Organization.where(["created_at >= ? AND created_at < ?", prev_monday, monday]).count

        # Orgs with >= large_org_team_size seats as of the trailing end.
        sql = Arel.sql(<<-SQL, **params)
        SELECT COUNT(*) FROM
          (SELECT u.id, COUNT(DISTINCT m.user_id) AS team_member_count
            FROM users u, team_members m
            WHERE u.created_at < :monday AND u.type='Organization'
              AND u.id = m.organization_id AND m.created_at < :monday
            GROUP BY u.id
            HAVING team_member_count >= #{large_org_team_size}) tmp
        SQL
        large_orgs = User.connection.select_value

        # Total seats aggregated across all orgs as of the trailing end.
        sql = Arel.sql(<<-SQL, **params)
        SELECT SUM(team_member_count) FROM
          (SELECT u.id, COUNT(DISTINCT m.user_id) AS team_member_count
            FROM users u, team_members m
            WHERE u.created_at < :monday AND u.type='Organization'
              AND u.id = m.organization_id AND m.created_at < :monday
            GROUP BY u.id) tmp
        SQL

        total_seats = User.connection.select_value(sql)
        total_orgs += new_orgs

        csv << [monday, new_orgs, total_orgs, large_orgs, total_seats]

        prev_monday = monday
      end
    end
  end

  desc "CSV summary of open issues labelled 'bug' on github/github aligned to UTC Mondays."
  task :bug_history => :environment do
    csv = CSV.new($stdout, :write_headers => true, :headers => [:trailing_end, :open_issues])

    each_utc_monday_since(Issue.first.created_at) do |monday|
      open_issues = Repository.nwo("github/github").issues.labeled("bug")
      .count(:conditions => ["issues.created_at < ? AND (issues.closed_at IS NULL OR issues.closed_at >= ?)", monday, monday])

      csv << [monday, open_issues]
    end
  end

  def each_utc_monday_since(time)
    now = Time.now
    monday = time.utc.beginning_of_week + 7 * 24.hours
    while monday < now do
      yield monday
      monday += 7 * 24.hours
    end
  end
end
