# typed: true
# frozen_string_literal: true

class GitHub::IntegrationTestCase < GitHub::BasicTestCase
  include GeneratedPathHelpersModule
  include GeneratedUrlHelpersModule

  sig { returns(ActionDispatch::Request) }
  def request; end

  sig { returns(ActionDispatch::TestResponse) }
  def response; end

  sig { returns(ActionDispatch::Request::Session) }
  def session; end

  sig { void }
  def https!; end

  sig { returns(T.nilable(String)) }
  def body; end

  sig { returns(T.nilable(String)) }
  def host; end

  sig { params(host: String).void }
  def host!(host); end

  sig { returns(ApplicationController) }
  def controller; end

  sig { returns(T.nilable(String)) }
  def remote_addr; end

  sig { params(address: String).void }
  def remote_addr=(address); end

  sig { returns(Rack::Request) }
  def last_request; end
end
