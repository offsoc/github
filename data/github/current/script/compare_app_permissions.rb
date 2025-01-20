# typed: true
#!/usr/bin/env ruby
# frozen_string_literal: true

require_relative "../config/environment"
require "terminal-table"

unless Rails.env.development?
  puts "This can only be run in the development environment!"
  exit 1
end

app_id = ARGV.shift

unless app_id
  puts "Please supply the ID of a GitHub App"
  exit 1
end

app = Integration.find_by(id: app_id)

unless app
  puts "Could not find Integration with ID #{app_id}"
  exit 1
end

unless app.installations.any?
  puts "The App does not have any installations"
  exit 1
end

puts "App: '#{app.name}' is installed on the following targets:"
table = Terminal::Table.new(headings: %w[Target ID]) do |t|
  app.installations.each do |installation|
    t << [installation.target.login, installation.id]
  end
end
puts table

puts "Please choose an installation by ID:"

installation = T.let(nil, T.nilable(IntegrationInstallation))

while installation.nil?
  installation_id = gets.chomp
  installation = app.installations.find_by(id: installation_id)
  if installation.nil?
    puts "The installation with ID '#{installation_id}' could not be found"
    puts "Please choose an installation by ID:"
  end
end

puts "\nComparing fine-grained `abilities` and `permissions` records..."
puts ""

sql = Arel.sql(<<~SQL, actor_id: installation.id)
  SELECT id, actor_id, actor_type, subject_id, subject_type
  FROM abilities
  WHERE actor_id = :actor_id
  AND actor_type = 'IntegrationInstallation'
SQL

results = Ability.connection.select_rows(sql)
if results.any?
  table = Terminal::Table.new(
    title: "'abilities'",
    headings: %w(ID actor_id, actor_type, subject_id, subject_type),
    rows: results,
  )
  puts table
else
  puts "No `abilities` records for this installation"
end

sql = Arel.sql(<<~SQL, actor_id: installation.id)
  SELECT id, actor_id, actor_type, subject_id, subject_type
  FROM permissions
  WHERE actor_id = :actor_id
  AND actor_type = 'IntegrationInstallation'
SQL

results = ApplicationRecord::Permissions.connection.select_rows(sql)
if results.any?
  table = Terminal::Table.new(
    title: "`permissions`",
    headings: %w(ID actor_id, actor_type, subject_id, subject_type),
    rows: results,
  )
  puts table
else
  puts "No `permissions` records for this installation"
end
