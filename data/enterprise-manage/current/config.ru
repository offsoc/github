# frozen_string_literal: true
root = File.dirname(__FILE__)

$LOAD_PATH.unshift(File.expand_path("lib", root))
require File.expand_path("config/development", root) if ENV["RACK_ENV"] != "production"

require "manage"
require "rack/protection"
require "rack/csrf"

Manage.setup

use Sinatra::CommonLogger, Manage.logger unless Sinatra::Base.test?

# Ported select items from the rack-ssl gem. Whereas that forces all requests to be https
# this detects if something is coming over https, and sets the secure flag on the cookie
# otherwise it just leaves it alone.
class SetSecureFlagOnSSL < Struct.new(:app)
  def call(env)
    if scheme(env) == "https"
      status, headers, body = app.call(env)
      flag_cookies_as_secure!(headers)
      [status, headers, body]
    else
      app.call(env)
    end
  end

  private

  def scheme(env)
    if env["HTTPS"] == "on"
      "https"
    elsif env["HTTP_X_FORWARDED_PROTO"]
      env["HTTP_X_FORWARDED_PROTO"].split(",")[0]
    else
      env["rack.url_scheme"]
    end
  end

  def flag_cookies_as_secure!(headers)
    if cookies = headers["Set-Cookie"]
      # Rack 1.1's set_cookie_header! will sometimes wrap
      # Set-Cookie in an array
      cookies = cookies.split("\n") unless cookies.respond_to?(:to_ary)

      headers["Set-Cookie"] = cookies.map do |cookie|
        if !/; secure(;|$)/.match?(cookie)
          "#{cookie}; secure"
        else
          cookie
        end
      end.join("\n")
    end
  end
end
use SetSecureFlagOnSSL

# Enable sessions
use Rack::Session::Cookie,
    key: "_gh_manage",
    path: "/",
    same_site: :lax,
    expire_after: 1800, # 30 minutes in seconds
    secret: ENV["ENTERPRISE_SESSION_SECRET"] || SecureRandom.hex(16),
    hmac: OpenSSL::Digest::SHA256,
    coder: Rack::Session::Cookie::Base64::JSON.new

# Enable path traversal protection for all endpoints
use Rack::Protection::PathTraversal

use Warden::Manager do |config|
  # Tell Warden how to save our User info into a session.
  # Sessions can only take strings, not Ruby code, we'll store
  # the User's `id`.
  config.serialize_into_session { |user| user[:id] }

  # Now tell Warden how to take what we've stored in the session
  # and get a User from that information.
  config.serialize_from_session { |id| Manage::WardenAuth.get_user(id) }

  config.default_scope = :operator

  config.scope_defaults(
    :operator,
    # "strategies" is an array of named methods with which to
    # attempt authentication.
    strategies: [:password, :admin, :api],
    # Route to redirect to when warden.authenticate! returns false
    action: "/unauthenticated"
  )

  # @ToDo: remove, currently just keeping this around for
  # testing `editor` role while deprecating it
  config.scope_defaults(
    :editor,
    strategies: [:authorize_editor],
    # Route to redirect to when warden.authenticate! returns false
    action: "/unauthorized"
  )

  config.scope_defaults(
    :admin,
    strategies: [:authorize_admin],
    # Route to redirect to when warden.authenticate! returns false
    action: "/unauthorized"
  )

  # When a user tries to log in and cannot, this specifies the
  # app to send the user to.
  config.failure_app = Manage::App.new
end

Warden::Manager.before_failure do |env, _opts|
  # env["REQUEST_METHOD"] contains method of the call to the application that has failed to be authenticated
  # not the method to execute for the unauthenticated redirect.
  # We handle the unauthenticated and unauthorized only under the "POST" method, therefore we need
  # to change request to POST
  env["REQUEST_METHOD"] = "POST"
  # And we need to do the following to work with Rack::MethodOverride
  # using `String.new("")` creates an unfrozen object, allowing this project
  # to work with the frozen_string_literal
  env.each do |key, _value|
    env[key]["_method"] = String.new("post") if key == "rack.request.form_hash"
  end
end

# All multipart file uploads are sent through a special /upload/*path prefix so
# that nginx can apply some features. We emulate that here so that things work
# the same way locally.
class SpecialUploadPath < Struct.new(:app)
  def call(env)
    path = env["PATH_INFO"]
    env["PATH_INFO"] = path.sub("/upload/", "/") if %r{/upload/.*$}.match?(path)
    app.call(env)
  end
end
use SpecialUploadPath

# Emulate the github app /status.json URL for testing in development. This
# returns a 404 accept for requests whose unix timestamp is divisable by 10.
class FakeInstanceStatus < Struct.new(:app)
  def call(env)
    if env["PATH_INFO"] == "/status.json"
      if Sinatra::Base.environment != :development || Time.now.to_i % 10 != 0
        [404, { "Content-Type" => "text/plain" }, "Not Found"]
      else
        json = '{ "status":"ok", "configuration_id":234234234234 }'
        req = Rack::Request.new(env)
        params = req.params
        json = "#{params['callback']}(#{json})" if params["callback"]
        [200, { "Content-Type" => "application/json" }, json]
      end
    else
      app.call(env)
    end
  end
end
use FakeInstanceStatus

# Definition is placed before Rack::Csrf since skipping those checks is intended for the API
map "/setup/api" do
  run Manage::Api
end

# Used for Rack Csrf exceptions
class RedirectCsrfErrors
  def initialize(app)
    @app = app
  end

  def call(env)
    @app.call(env)
  rescue Rack::Csrf::InvalidCsrfToken
    path = env["PATH_INFO"].gsub(%r{^/setup}, "")
    [302, { "Location" => "/setup/unlock?redirect_to=#{path}#session-expired" }, []]
  end
end
use RedirectCsrfErrors

use Rack::Csrf, raise: true, skip_if: lambda { |request|
  request.path.start_with?("/setup/grafana")
}

# Serve assets from sprockets in development
unless Manage::App.assets.deployment?
  map Sprockets::Helpers.prefix do
    run Manage::App.assets
  end
end

map "/setup" do
  run Manage::App
end

use Rack::Static, urls: { "/ssl_warning.html" => "ssl_warning.html" }, root: "public"

map "/" do
  use Rack::Rewrite do
    r302 %r{^/?(\.*)$}, "/setup/$1"
  end

  run(->(_env) { [404, {}, []] })
end
