# The full environment may not be available here if run from hooks, etc.
#
# Vanilla Ruby only.

require "digest/sha2"

module Rollup
  @denylist = [
    "vendor/",
  ]

  # Generate a unique identifier for an exception
  #
  # If two exceptions have the same identifier, they are considered to be the
  # same exception for the purposes of error tracking. Failbot and Haystack
  # call these "rollups".
  #
  # exception - an Exception to generate the rollup for
  #
  # scrub_root_path - String root filesystem path, typically Rails.root.to_s, to remove
  #                   from the significant backtrace frame prior to generating the rollup hash.
  #
  # Returns a String.
  def self.generate(exception, scrub_root_path: nil)
    significant_frame = first_significant_frame(exception.backtrace, scrub_root_path: scrub_root_path)

    components = [exception.class.name]

    if match = significant_frame.match(/(.*):(\d+)(?::in `([^']+)')?/) # taken from Rollbar gem
      filename, lineno, method = match[1], match[2], match[3]

      components.push(filename)

      if method
        # scrub generated template method names (ERB, builder, HAML, etc.)
        method = method.sub(/__[_\d]+\z/, '_template') if method.match?(/_app_views_.*__[_\d]+\z/)
        components.push(method)
      end
    end

    Digest::SHA256.hexdigest(components.join("|"))
  end

  # Determine whether a frame is "significant"
  #
  # "Significant" frames are ones that don't match the denylist.
  #
  # frame - String backtrace line (e.g., from Kernel#caller or
  #         Exception#backtrace)
  #
  # Returns a Boolean
  def self.significant?(frame)
    @denylist.none? { |exclusion| frame.include?(exclusion) }
  end

  # Find the first significant frame in a backtrace
  #
  # If there is no such frame, the first frame is used.
  #
  # backtrace - Enumerable that yields String backtrace lines (e.g.,
  #             Kernel#caller or Exception#backtrace)
  #
  # scrub_root_path - String root filesystem path, typically Rails.root.to_s, to remove
  #                   from the significant backtrace frame.
  #
  # Returns a String from the backtrace
  def self.first_significant_frame(backtrace, scrub_root_path: nil)
    return "" if backtrace.nil?

    significant_frame = backtrace.detect { |frame| significant?(frame) }
    significant_frame ||= backtrace.first || ""

    if scrub_root_path
      significant_frame = significant_frame.sub(/\A#{scrub_root_path}/, "")
    end

    significant_frame
  end

  # Configures extra frames to be added to the builtin denylist;
  # each backtrace will be checked against both of these.
  #
  # denylist - an array containing a set of strings against which
  #             every frame in the exception's backtrace will be
  #             compared
  #
  # Raises an ArgumentError if any of the values in `denylist`
  # aren't strings and can't be coerced into strings.
  def self.denylist=(denylist)
    if denylist.any? {|entry| !entry.respond_to?(:to_str)}
      raise ArgumentError, "All denylist entries must be able to be coerced to strings!"
    end

    @denylist = denylist
  end

  class << self
    alias :set_custom_blacklist :denylist=
  end
end
