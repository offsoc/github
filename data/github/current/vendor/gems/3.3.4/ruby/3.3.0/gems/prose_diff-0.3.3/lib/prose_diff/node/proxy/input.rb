module ProseDiff
  class Node
    module Proxy
      class Input

        include BaseBehaviour

        def valid?(input)
          input['type'] == 'checkbox'
        end

        def appear_to_correspond(input, other_node)
          true
        end

        def significant(options, array_of_attrs)
          array_of_attrs & (ProseDiff::OPTIONS[:significant_attrs] + ['checked'])
        end

      end
    end
  end
end
