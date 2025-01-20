# frozen_string_literal: true

require "turboscan/proto/results_twirp"
require "turboscan/proto/managed_analyses_twirp"
require "turboscan/proto/insights_twirp"
require "turboscan/proto/suggested_fixes_twirp"
require "turboscan/workflow"
require "turboscan/suggested_fix"

module Turboscan
  ManagedAnalysesClient = Turboscan::Proto::ManagedAnalysesClient
  SuggestedFixesClient = Turboscan::Proto::SuggestedFixesClient
  ResultsClient = Turboscan::Proto::ResultsClient
end
