# frozen_string_literal: true
module Codeowners
  class Owner
    include Comparable

    SourceLocation = Struct.new(:line, :column)

    EMAIL     = /\A[A-Z0-9a-z\._'%\+\-]+@[A-Za-z0-9\.\-]+\.[A-Za-z]{2,6}\z/
    # TODO Use same regexes we do in dotcom
    USERNAME  = /\A@[a-zA-Z0-9\-\_]+\z/
    TEAMNAME  = /@[a-zA-Z0-9\-]+\/[a-zA-Z0-9\-\_]+/

    attr_reader :identifier, :source_locations

    def initialize(identifier)
      @identifier = identifier
      @source_locations = []
    end

    def email?
      EMAIL.match?(identifier)
    end

    def username?
      USERNAME.match?(identifier)
    end

    def teamname?
      TEAMNAME.match?(identifier)
    end

    def to_s
      identifier
    end

    def <=>(other)
      to_s <=> other.to_s
    end

    def eql?(other)
      other.is_a?(self.class) && self == other
    end

    def hash
      return @hash if defined?(@hash)

      @hash = to_s.hash
    end
  end
end
