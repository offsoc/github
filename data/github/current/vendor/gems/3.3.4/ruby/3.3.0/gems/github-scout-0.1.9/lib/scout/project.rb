require 'scout/utilities'

module Scout
  class Project < Base

    attr_reader :path, :size, :tech_stack

    def initialize(attr)
      @path = attr[:path]
      @size = attr[:size]
      @tech_stack = attr[:tech_stack]
    end
  end
end
