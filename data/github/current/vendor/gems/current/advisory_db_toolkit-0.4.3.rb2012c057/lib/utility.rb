# frozen_string_literal: true

module AdvisoryDBToolkit
  # Why do we have a module that does what Rails does? Why aren't we just using .present? and .blank? ???
  # BECAUSE this gem avoids a dependency on ActiveSupport, and the designers of Rails haven't been pushing
  # their utility functions back up into Ruby. So, sans ActiveSupport we are left with some uglier code
  # or some replicated utility methods.
  module Utility
    def self.present?(s)
      !blank?(s)
    end

    def self.blank?(s)
      s.nil? || s == "" || s == false || (s.respond_to?(:empty?) && s.empty?)
    end

    def self.compact_blank(a)
      a.reject { |item|  blank?(item) }
    end

    def self.group_by(enumerable)
      grouped = {}
      enumerable.each do |e|
        key = yield e
        value = grouped[key]
        grouped[key] = value ? (value << e) : [e]
      end
      grouped
    end
  end
end
