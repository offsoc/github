module Scout
  class Base
    def to_h
      instance_variables.map do |iv|
        value = instance_variable_get(:"#{iv}")
        [
          iv.to_s[1..-1],
          case value
          when Base then value.to_h
          when Array
            value.map do |e|
              e.respond_to?(:to_h) ? e.to_h : e
            end
          else value
          end
        ]
      end.to_h.select { |member, value| value }
    end
  end
end
