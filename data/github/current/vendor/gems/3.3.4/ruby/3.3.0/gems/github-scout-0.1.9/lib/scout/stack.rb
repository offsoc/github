require 'yaml'
require 'scout/utilities'

module Scout
  class Component < Base
    attr_reader :name, :size, :settings

    def initialize(attributes={})
      @name = attributes[:name]
      @size = attributes[:size]
      @settings = attributes[:settings]
    end
  end
end
