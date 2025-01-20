# typed: strict
# frozen_string_literal: true

require "active_support/xml_mini/nokogiri"
require "aleph"
require "aqueduct/test_helpers/test_server"
require "badge_ruler"
require "billing-platform"
require "blackbird"
require "chatops/controller/test_case_helpers"
require "cvss_suite"
require "driftwood/v1/client"
require "elastomer_client/notifications"
require "erb_lint/all"
require "erblint-github/linters"
require "faraday_middleware/circuit_breaker"
require "flipper/test/shared_adapter_test"
require "github-telemetry"
require "github/markup"
require "github/telemetry/logs"
require "google/apis/androidpublisher_v3"
require "googleauth"
require "graphql/client"
require "graphql/client/erubi_enhancer"
require "graphql/client/erubis_enhancer"
require "graphql/client/http"
require "graphql/client/view_module"
require "homograph_detector"
require "horcrux/entity"
require "iopromise/data_loader"
require "iopromise/deferred"
require "linguist"
require "minitest/spec"
require "money/bank/open_exchange_rates_bank"
require "monolith-twirp-actions-core"
require "monolith-twirp-octoshift-imports"
require "nokogiri"
require "octolytics/pond"
require "opentelemetry/instrumentation/faraday/middlewares/tracer_middleware"
require "opentelemetry/instrumentation/graphql/tracers/graphql_tracer"
require "opentelemetry/instrumentation/graphql/tracers/graphql_trace"
require "rails/backtrace_cleaner"
require "rails/command"
require "rails/test_help"
require "rails/test_unit/reporter"
require "rails/test_unit/runner"
require "s4/v1/client"
require "scout"
require "scout/tech_stack"
require "secret_scanning_proto"
require "security_center_proto"
require "spamurai_dev_kit"
require "treelights"
require "treelights/gzip_request"
require "turboscan_vcr"
require "turboscan"
require "turboghas"
require "turbomodel"
require "turbomodel_vcr"
require "twirp/hmac"
require "webauthn/fake_client"
require "will_paginate/array"
require "will_paginate/active_record"
require "will_paginate/view_helpers/action_view"
require "actions-usage-metrics"

# required for vexi
require "vexi/adapters/feature_flag_hub_adapter"
require "vexi/adapters/file_adapter"
require "vexi/adapters/in_memory_adapter"
require "vexi/caches/in_memory"
require "vexi/custom_gates_evaluators/serial_gate_and_actor_evaluator"
require "vexi/observability/duration_payload"
require "vexi/observability/error_payload"
require "vexi/observability/cache_hit_or_miss_payload"

# required for latest packwerk
require "parser/current"

# Transitive dependencies from the Google API gems
require "declarative"
require "representable"
require "trailblazer/option"
require "uber/delegates"
require "uber/inheritable_attr"

# Transitive dependency from erb_linter
require "rubocop/cop/legacy/corrector"

# Primer engine classes
require "primer/forms/acts_as_component"
require "primer/forms/base"
require "primer/forms/form_list"
require "primer/view_components/engine"
require T.unsafe(ViewComponent::Engine).root.join("app/controllers/concerns/view_component/preview_actions")

# Test related requires
require "mocha/minitest"
require "minitest/mock"

# Local dependencies
require_relative "../../config/initializers/twirp_monkeypatch"
require_relative "../../config/initializers/i18n"

# Set up auto loading for constants defined in engine roots
loader = Zeitwerk::Loader.new
Rails::Engine.descendants.each do |engine|
  next if engine.abstract_railtie?

  engine.config.eager_load_paths.each do |path|
    loader.push_dir(path)
  end
end

loader.setup
