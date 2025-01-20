# frozen_string_literal: true

require_relative "utility"
require_relative "ecosystems"
require_relative "cve_id_validator"
require_relative "fqn_search_keys_adapter"
require_relative "ghsa_id_validator"
require_relative "reference_sorter"
require_relative "osv/osv"
require_relative "vulnerable_function_adapter"
require_relative "ecosystems/ecosystems"
require_relative "package_url_obtainer"

module AdvisoryDBToolkit
  def self.normalize_description_line_endings(description)
    return description if AdvisoryDBToolkit::Utility.blank?(description)

    # Convert all newlines (including carriage returns) into standard newlines.
    # We receive descriptions with carriage returns from textarea form fields,
    # which make YAML diffs difficult to read.
    description.gsub(/\R/, "\n")
  end

  def self.cache=(cache)
    cache.respond_to?(:get) || raise(ArgumentError, "Cache must implement get method")  
    cache.respond_to?(:set) || raise(ArgumentError, "Cache must implement set method")  
    @cache = cache
  end

  def self.cache
    # Set a default cache if one is not set. E.g., dotcom will not set a cache.
    @cache ||= DefaultCache.new
  end

  def self.cache_prefix_key=(cache_prefix_key)
    @cache_prefix_key = cache_prefix_key
  end

  def self.cache_prefix_key
    @cache_prefix_key
  end

  def self.logger=(logger)
    logger.respond_to?(:debug) || raise(ArgumentError, "Logger must implement log method")  
    logger.respond_to?(:info) || raise(ArgumentError, "Logger must implement info method")  
    @logger = logger
  end

  def self.logger
    raise "Logger not set" unless @logger
    @logger
  end

  # NOTE: This is a default cache that does nothing. It is used when no cache is set.
  class DefaultCache
    def get(key); end
    def set(key, value, options = {}); end
  end
end
