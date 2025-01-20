module Failbot
  module SensitiveDataScrubber
    FILTERED = '[FILTERED]'.freeze
    BASIC_AUTH_REGEX = /https?:\/{2}([\w%\-!]*:[\w%\-!]*)@/
    SENSITIVE_KEYWORDS = %w{ secret key access_token token password api_key oauth oauth_nonce }
    QUERY_STRING_REGEX = Regexp.new("(?<key>#{SENSITIVE_KEYWORDS.join("|")})=[\\-\\w%]+")
    MAX_DEPTH = 100

    def scrub(hash)
      transform_values(hash) do |value|
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
        transform_values(value) do |nested_value|
          scrub_urls(nested_value, max_depth - 1)
        end
      else
        value
      end
    end

    def scrub_url(url)
      filtered_url = url.gsub(QUERY_STRING_REGEX) do |_|
        "#{$~[:key]}=#{FILTERED}"
      end

      filtered_url.gsub(BASIC_AUTH_REGEX) do |m|
        ($1 && m.gsub($1, "#{FILTERED}:#{FILTERED}")) || m
      end
    rescue
      url
    end

    # Took this from ruby 2.4+ because we do not want to rely on
    # specific ruby versions.
    #
    def transform_values(hash)
      return {} if hash.empty?
      result = Hash.new
      hash.each do |key, value|
        result[key] = yield(value)
      end
      result
    end
  end
end
