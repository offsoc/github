#!/usr/bin/env safe-ruby
# typed: true
# frozen_string_literal: true

# invoke with VC_TOKEN=<token> script/vitess_query_checker.rb <cluster> <query_type> <space separated list of tables>
# optionally include PAT=<pat> and WRITE=1 to create and update github issues from results.

require_relative "../config/environment"
require "github/sql_checkers/table_sharding/vitess_query_check"

if ARGV.length < 3
  puts "Usage: bin/safe-ruby script/vitess_query_checker.rb <domain class> <query-type> <table>..."
  puts "Example: bin/safe-ruby script/vitess_query_checker.rb RepositoriesActionsChecks select check_runs check_suites"
  exit 1
end
if ARGV[1] != "select" && ARGV[1] != "update" && ARGV[1] != "delete"
  puts "Usage: bin/safe-ruby script/vitess_query_checker.rb <domain class> <query-type> <table>..."
  puts "query-type is select or update"
  puts "Example: bin/safe-ruby script/vitess_query_checker.rb RepositoriesActionsChecks select check_runs check_suites"
  exit 1
end
domain_class = ("ApplicationRecord::" + ARGV[0]).constantize
ARGV.shift
query_type = ARGV[0]
ARGV.shift
GitHub::SQLCheckers::TableSharding::VitessQueryCheck.display_queries(ARGV, domain_class, query_type)
