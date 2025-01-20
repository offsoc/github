# frozen_string_literal: true
# Tweak environment
ENV["RACK_ENV"] ||= ENV["RAILS_ENV"]
ENV["GITAUTH"] = "1"

# Load basics
require_relative "config/application"
require "failbot/middleware"
require "flipper/middleware/setup_env"
require "flipper/middleware/memoizer"
require "rack/process_utilization"
require "rack/reloader"
require "rack/request_id"
require "pinglish"
require "permission_cache"

# At one point this eager loaded models but not controllers or other classes,
# but in 2022 or 2023 app/models went away due to packages/.
# auto/eager loading for packages is configured elsewhere and this doesn't
# handle that (whether or not it should is left as an exercise for the reader).
# This now skips eager loading completely and instead sets those paths to
# autoload.
GitHub::Application.config.paths.all_paths.find_all(&:eager_load?).each do |path|
  path.skip_eager_load!
  path.autoload!
end

GitHub::Application.initialize!

use ActionDispatch::Executor, Rails.application.executor

# Records time each process spends actively processing a request vs. being idle
# waiting on a request.
use Rack::ProcessUtilization, "gitauth", GitHub.current_sha[0, 7],
  :stats => GitHub.create_statsd(namespace: "gitauth"),
  :dogstats => GitHub.dogstats

# Records stats about each request. Keep this near the top of this file as
# anything above it won't count toward our request timing metrics.  Depends
# on `Rack::ProcessUtilization` for GC info
use GitHub::Middleware::Stats

# Tell Failbot not to include sensitive parameters from uncaught exceptions.
# This needs to come *before* Failbot::Rescuer.
use Rack::Config do |env|
  env["filter_words"] = GitHub.filtered_params + [:otp, :app_otp, :sms_otp]
end

use Failbot::Rescuer, :app => "github"

# This middleware resets `GitHub.context`, which stores global context for each
# request. This should happen early in the chain to avoid wiping out any context
# set by other middleware.
use GitHub::ContextMiddleware

# Enable and reset the local per-request cache
use GitHub::Cache::ResetMiddleware

# Enable feature flag memoization
flipper_block = lambda { GitHub.flipper }
use Flipper::Middleware::SetupEnv, flipper_block
use Flipper::Middleware::Memoizer, preload: false
use FeatureFlag::Middleware::Memoizer

ActiveRecord::QueryLogs.tags = [{
  application: "gitauth",
  category: "gitauth"
}]

use OpenTelemetry::Instrumentation::Rack::Middlewares::TracerMiddleware

# Enable Rack middleware for capturing (or generating) request id's
use Rack::RequestId

use Rack::RequestLogger

# Automatically reload for changes during development
if Rails.env.development?
  use Rack::Reloader
end

# Serve a 200 on /_ping once we've fully initialized
use Pinglish do |ping|
  ping.check do
    !GitHub.unicorn_master_start_time.nil?
  end

  if GitHub.kube?
    # If we're inside Kubernetes fail until the last worker has started.
    ping.check do
      File.exist?(GitHub.kube_workers_ready_file)
    end
  end
end

# Middleware to set the business for the request (for use with multi tenant environment)
if GitHub.multi_tenant_enterprise?
  use GitHub::Middleware::TenantSelection
end

use PermissionCache

run GitHub::RepoPermissions

if ENV["RACK_ENV"] != "development" || ENV["PRELOAD"]
  warmup do |app|
    unless GitHub.enterprise?
      client = Rack::MockRequest.new(app)
      client.post("/_gitauth", :params => { "action" => "read", "proto" => "git", "path" => "gist/c4f4a5e127016bbcb69c.git" })
    end
    GC.start
  end
end

GitHub.unicorn_master_pid ||= Process.pid
GitHub.unicorn_master_start_time = Time.now.utc
Unicorn::ProcessName.instance.update(domain: "gitauth")
GitHub.stats.increment("unicorn.master.birth") if GitHub.enterprise?
