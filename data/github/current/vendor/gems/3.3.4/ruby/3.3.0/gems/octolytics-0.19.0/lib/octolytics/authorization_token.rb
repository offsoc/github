require 'openssl'
require 'base64'
require 'json'

module Octolytics
  class AuthorizationToken
    # Public: Initializes a new authorization token
    #
    # secret - Application's secret token preshared by the analytics API
    def initialize(secret)
      @digest = 'SHA1'
      @secret = secret
    end

    # Public: Generates an authorization token string
    #
    # expires_at - `Time` or number of seconds since epoch when the
    #               token will expire (ideally should be a short; e.g., a few
    #               minutes)
    # params - Parameters to be embedded in the token
    def generate(expires_at, params)
      expires_at = expires_at.to_i
      params     = Hash[(params || {}).map { |k, v| [k, v.to_s] }]
      data       = ::Base64.strict_encode64(JSON.dump(params.merge(expires_at: expires_at)))

      "#{data}--#{generate_digest(data)}"
    end

    # Public: Verifies an authorization token is valid
    #
    # token_str - Token string generated earlier with `#generate`
    # params - Parameters expected to be embedded in the token
    # now - The current time
    def verify(token_str, params, now = Time.now)
      return false if token_str.nil? || token_str.length.zero?

      data, digest = token_str.split('--')
      if !data.nil? && !digest.nil? && secure_compare(digest, generate_digest(data))
        token_params = JSON.load(Base64.decode64(data))
        unexpired?(token_params, now) && satisfies_params?(token_params, params)
      else
        false
      end
    end

    private
    def generate_digest(data)
      OpenSSL::HMAC.hexdigest(OpenSSL::Digest.const_get(@digest).new, @secret, data)
    end

    # Private: Verifies that the token is unexpired
    def unexpired?(token_params, now)
      token_params['expires_at'] && token_params['expires_at'] > now.to_i
    end

    # Private: Verifies that the parameters embedded the token match the
    # expected parameters
    def satisfies_params?(token_params, params)
      params.all? { |k, v| v == token_params[k.to_s] }
    end

    # Private: Constant-time comparison algorithm to prevent timing attacks
    #
    # <https://github.com/rails/rails/blob/73641563917e3a69b63a1b11c8ebe33c469e8951/activesupport/lib/active_support/message_verifier.rb#L53>
    # Used under MIT License
    def secure_compare(a, b)
      return false unless a.bytesize == b.bytesize

      l = a.unpack "C#{a.bytesize}"

      res = 0
      b.each_byte { |byte| res |= byte ^ l.shift }
      res == 0
    end
  end
end
