# frozen_string_literal: true

require 'rack'
require 'rackup'
require 'webrick'
require "authzd-client"

class TestAuthorizationHandler
  def authorize(request, env)
    reason = env[:reason].nil? ? "reason" : env[:reason]
    case env[:result]
    when "INDETERMINATE"
      Authzd::Proto::Decision.new(result: :INDETERMINATE, reason: reason)
    else
      Authzd::Proto::Decision.new(result: :DENY, reason: reason)
    end
  end
end

class TestEnumerationHandler
  def for_actor(request, env)
    Authzd::Enumerator::ForActorResponse.new(result_ids: result_ids(env))
  end

  def for_subject(request, env)
    Authzd::Enumerator::ForSubjectResponse.new(result_ids: result_ids(env))
  end

  private

  def result_ids(env)
    raw_result = env[:result_ids]
    return [] if raw_result.nil?

    raw_result.split(/\s*,\s*/).map(&:to_i)
  end
end

authorization_handler = TestAuthorizationHandler.new
enumeration_handler = TestEnumerationHandler.new
authorization_service = Authzd::Proto::AuthorizerService.new(authorization_handler)
enumeration_service = Authzd::Enumerator::EnumeratorService.new(enumeration_handler)

# Injects environment variables into RPC env, so we can piggyback data
# for testing purposes
authorization_service.before do |rack_env, env|
  puts "rack env: #{rack_env}"
  env[:result] = rack_env['HTTP_RESULT']
  env[:reason] = rack_env['HTTP_REASON']
end
enumeration_service.before do |rack_env, env|
  puts "rack env: #{rack_env}"
  env[:result_ids] = rack_env['HTTP_RESULT_IDS']
end

addr = ENV.fetch("PORT", "18082")
server = WEBrick::HTTPServer.new(Port: addr)
[authorization_service, enumeration_service].each do |svc|
  path_prefix = "/twirp/" + svc.full_name
  server.mount path_prefix, Rackup::Handler::WEBrick, svc
end
trap('INT') { server.stop }
trap('TERM') { server.stop }
server.start
