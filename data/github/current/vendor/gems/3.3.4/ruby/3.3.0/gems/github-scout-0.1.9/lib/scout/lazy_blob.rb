require 'scout'

module Scout
  class LazyBlob < Linguist::LazyBlob
    def initialize(repo, oid, path, mode = nil)
      super
    end

    def stack
      @stack ||= Scout.detect(self)
    end

    def include_in_stack_stats?
      !vendored? && !documentation? && !generated? && stack && stack.size > 0
    end
  end
end
