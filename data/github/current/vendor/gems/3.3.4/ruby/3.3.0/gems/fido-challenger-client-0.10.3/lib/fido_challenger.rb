# frozen_string_literal: true
require "json"
require "net/http"
require "ostruct"

require_relative "token_stash"

class FIDOChallenger
  class FIDOChallengerError < StandardError; end
  class FIDOChallengerFailOpenError < FIDOChallengerError; end
  DEFAULT_BYPASS_DURATION = 600
  MAX_BYPASS_DURATION = 432000

  def self.challenge(uid, resource)
    if uid.to_s.size == 0
      raise ArgumentError, "uid must not be blank"
    end

    if resource.to_s.size == 0
      raise ArgumentError, "resource must not be blank"
    end

    uri = URI("#{service_url}/challenges")
    response = Net::HTTP.post_form(uri, { "resource" => resource, "uid" => uid })
    if response.code == "201"
      json = JSON.parse(response.body)
      OpenStruct.new(json)
    else
      raise FIDOChallengerFailOpenError, "error contacting fido-challenger: #{response.inspect}"
    end
  end

  def self.token_status(response)
    if response.code == "200"
      parsed = JSON.parse(response.body)
      if parsed["status"] == "success"
        :success
      else
        :pending
      end
    elsif response.code == "404"
      :not_found
    else
      raise FIDOChallengerFailOpenError, "error contacting fido-challenger: #{response.inspect}"
    end
  end

  def self.status(token)
    uri = URI("#{service_url}/challenges/#{token}/status")
    response = Net::HTTP.get_response(uri)
    token_status(response)
  end

  def self.status_user_resource(token, uid, resource)
    uri = URI("#{service_url}/challenges/#{token}/status/user/#{uid}/resource/#{resource}")
    response = Net::HTTP.get_response(uri)
    token_status(response)
  end

  def self.poll_status(token, attempts)
    attempts.times do
      status = FIDOChallenger.status(token)
      case status
      when :pending
        sleep 1
      else
        return status
      end
    end

    :pending
  end

  def self.bypass(uid, resource, duration)
    duration ||= DEFAULT_BYPASS_DURATION
    if duration > MAX_BYPASS_DURATION
      raise ArgumentError, "duration cannot exceed #{MAX_BYPASS_DURATION} seconds."
    end

    uri = URI("#{service_url}/bypass")
    str = "resource=#{resource}&uid=#{CGI.escape(uid)}&duration=#{duration}"

    req = Net::HTTP::Post.new(uri)
    req["X-FIDO-Hmac-Token"] = hmac_token(str, timestamp)
    req["X-FIDO-Hmac-Timestamp"] = timestamp
    req.set_form_data(
      "resource" => resource,
      "uid" => uid,
      "duration" => duration
    )

    http = Net::HTTP.start(uri.hostname, uri.port, :use_ssl => use_ssl)
    response = http.request(req)
    http.finish

    if response.code == "201"
      true
    else
      raise FIDOChallengerError, "error adding fido-challenger bypass: #{response.inspect}"
    end
  end

  def self.clear_bypass(uid)
    uri = URI("#{service_url}/bypass/clear")
    str = "uid=#{CGI.escape(uid)}"

    req = Net::HTTP::Post.new(uri)
    req["X-FIDO-Hmac-Token"] = hmac_token(str, timestamp)
    req["X-FIDO-Hmac-Timestamp"] = timestamp
    req.set_form_data(
      "uid" => uid,
    )

    http = Net::HTTP.start(uri.hostname, uri.port, :use_ssl => use_ssl)
    response = http.request(req)
    http.finish

    if response.code == "200"
      true
    else
      raise FIDOChallengerError, "error clearing fido-challenger bypass: #{response.inspect}"
    end
  end

  def self.list_bypass
    uri = URI("#{service_url}/bypass")

    req = Net::HTTP::Get.new(uri)
    req["X-FIDO-Hmac-Token"] = hmac_token("", timestamp)
    req["X-FIDO-Hmac-Timestamp"] = timestamp

    http = Net::HTTP.start(uri.hostname, uri.port, :use_ssl => use_ssl)
    response = http.request(req)
    http.finish

    if response.code == "200"
      json = JSON.parse(response.body)
      OpenStruct.new(json)
    else
      raise FIDOChallengerError, "error listing fido-challenger bypass: #{response.inspect}"
    end
  end

  def self.timestamp
    Time.now.utc.strftime("%Y-%m-%dT%H:%M:%SZ")
  end

  def self.hmac_token(body, timestamp)
    str = "#{body}|#{timestamp}"
    OpenSSL::HMAC.hexdigest(OpenSSL::Digest.new("sha256"), ENV["FIDO_CHALLENGER_FIDO_HMAC_SECRET"], str)
  end

  def self.service_url
    ENV["FIDO_CHALLENGER_URL"] || "https://fido-challenger-production.service.iad.github.net"
  end

  def self.use_ssl
    true
  end
end
