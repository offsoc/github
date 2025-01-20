# frozen_string_literal: true
module Codeowners
  class Rule
    attr_reader :line, :pattern, :owners

    def initialize(line, pattern, owners)
      @line = line
      @pattern = pattern
      @owners = owners
    end

    def ==(other)
      line == other.line &&
        pattern.to_s == other.pattern.to_s &&
        owners.sort == other.owners.sort
    rescue NoMethodError
      false
    end

    def <=>(other)
      line <=> other.line
    end

    def eql?(other)
      other.is_a?(self.class) && self == other
    end

    def hash
      return @hash if defined?(@hash)

      @hash = [line, pattern.to_s, owners.sort].hash
    end
  end
end
