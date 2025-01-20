module Failbot
  module SensitiveDataScrubber
    FILTERED = '[FILTERED]'.freeze
    BASIC_AUTH_REGEX = /(https?:\/\/)[\w%\-!]*:[\w%\-!]*@/
    SENSITIVE_KEYWORDS = %w{ secret key access_token token password api_key oauth oauth_nonce }
    QUERY_STRING_REGEX = Regexp.new("(?<key>#{SENSITIVE_KEYWORDS.join("|")})=[\\-\\w%]+")
    MAX_DEPTH = 100

    def scrub(hash)
      hash.transform_values do |value|
        scrub_urls(value)
      end
    end

    def scrub_urls(value, max_depth=MAX_DEPTH)
      return value if max_depth <= 0

      case value
      when String
        scrub_url(value)
      when Array
        value.map do |element|
          scrub_urls(element, max_depth - 1)
        end
      when Hash
        value.transform_values do |nested_value|
          scrub_urls(nested_value, max_depth - 1)
        end
      else
        value
      end
    end

    def scrub_url(url)
      url = url.scrub # make sure that the string does not have invalid byte sequences

      if url.match?(QUERY_STRING_REGEX)
        url = url.gsub(QUERY_STRING_REGEX) do
          "#{$~[:key]}=#{FILTERED}"
        end
      end

      if url.match?(BASIC_AUTH_REGEX)
        url = url.gsub(BASIC_AUTH_REGEX) do
          "#{$1}#{FILTERED}:#{FILTERED}@"
        end
      end

      url
    end
  end
end
