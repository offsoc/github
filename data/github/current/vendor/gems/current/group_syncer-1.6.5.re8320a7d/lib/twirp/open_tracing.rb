# frozen_string_literal: true

# Patches Rack::Tracer to add Twirp Service path info to spans operation names
module Twirp
  module OpenTracing
    def route_from_env(env)
      route = super
      if route
        route
      else
        "#{env["REQUEST_METHOD"]} #{env["PATH_INFO"]}"
      end
    end
  end
end

Rack::Tracer.prepend(Twirp::OpenTracing)
