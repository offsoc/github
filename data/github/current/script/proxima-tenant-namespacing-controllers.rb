#!/usr/bin/env ruby
# frozen_string_literal: true
ENV["PRELOAD"] = "1" unless ENV["PRELOAD"]
require_relative "../config/environment"

date = DateTime.now.strftime("%Y-%m-%d")

def ancestor_chain(klass)
  return [] unless klass < ApplicationController
  [klass.superclass] + ancestor_chain(klass.superclass)
end

def interesting_method_source(klass, meth)
  klass.instance_method(meth).source_location.first.sub(Rails.root.to_s + "/", "")
rescue # rubocop:todo Lint/GenericRescue
  nil
end

$grep = GitHub::Grep.new
$grep.instance_variable_set(:@caller_file, Rails.root.to_s)
def source_includes_chokepoint_usage(source, chokepoint_pattern)
  return unless source.present?
  res = $grep.code_use(chokepoint_pattern, dirs: [Rails.root.join(source).to_s])
  return if res.empty?
  res
rescue => e # rubocop:todo Lint/GenericRescue
  $error = e
  [source, chokepoint_pattern, e.inspect, e.backtrace.first]
end

interesting_methods = [
  :current_organization,
  :current_repository,
  :this_user,
  :this_organization,
  :this_repository,
]

chokepoint_patterns = [
  "find_by_login",
  "with_name_with_owner",
  "Repository.nwo",
  "Repositories::Public.find_active!",
  "Repository.find_by",
  "Repository.find_by_id",
  "User.with_logins",
  "User.find_by",
  "User.where",
  "Organization.find_by",
  "Organization.where",
  "current_user.organizations.find_by",
  "current_user.organizations.where",
  "repositories.find_by_id",
]

$findings = {
  "app/controllers/application_controller.rb" => { current_repository: "nil" },
  "app/controllers/git_content_controller.rb" => { current_repository: "super" },
  "app/controllers/memexes/items_controller.rb" => { this_repository: "memex_owner.repositories.find_by_id" },
  "app/controllers/memexes/shared_memexes_controller_actions.rb" => { this_repository: "memex_owner.repositories.find_by_id" },
  "app/controllers/orgs/discussions_controller.rb" => { current_repository: "this_organization.discussion_repository.repository" },
  "app/controllers/pages_auth_controller.rb" => { current_repository: "@page.repository" },
  "app/controllers/profiles/avatars_controller.rb" => { this_organization: "this_user" },
  "app/controllers/profiles_controller.rb" => { this_organization: "this_user" },
  "app/controllers/registry_two/package_versions_controller.rb" => { current_repository: "@metadata&.package&.repository" },
  "app/controllers/repos/projects_controller.rb" => { this_organization: "current_repository.owner" },
  "app/controllers/stafftools/commit_comments_controller.rb" => { this_user: "this_comment.try(:user)", current_repository: "this_comment.try(:repository)" },
}

def safe_sources?(sources, patterns)
  found = {}
  sources.each do |meth, src|
    $findings[src] ||= {}
    if !$findings[src].key?(meth)
      $findings[src][meth] =
        patterns.find do |pat|
          source_includes_chokepoint_usage(src, pat)
        end
    end
    found[meth] = $findings[src][meth]
  end
  found
end

if ENV["PRELOAD"] != "1"
  # force load a sample of controllers
  Users::StaffAccessRequestsController
  Voltron::RoutesController
  Billing::Notifications::DismissalsController
  Hovercards::Repositories::CitationsController
  Orgs::BillingSettings::PlanDowngradeController
  Users::SecurityCenter::SurveyController
  Orgs::PeopleController
end

ApplicationController.descendants.each do |controller|
  ac = ancestor_chain(controller)
  ims = {}; interesting_methods.each { |m| f = interesting_method_source(controller, m); ims[m] = f if f.present? }
  cpf = safe_sources?(ims.dup, chokepoint_patterns)
  all = cpf.all? { |_k, v| v.present? }
  some = !all && cpf.any? { |_k, v| v.present? }

  assessment =
    case
    when cpf.empty?
      "audit-required:no-chokepoints-found"
    when all
      "safe"
    when some
      "audit-required:some-safe"
    else
      "unsafe"
    end

  puts [
    date,
    "Web",
    "Controllers",
    controller.name,
    nil,
    nil
  ].join(",") if assessment != "safe"
end

if ENV["FINDINGS"] == "yaml"
  puts $findings.to_yaml
end

if $error
  $stderr.puts [$error.class, $error.message].inspect
  $stderr.puts $error.backtrace
end
