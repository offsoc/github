module ProseDiff
  class Node
    module Proxy
      class Ins

        include SplitsChildrenAndSelfBehaviour, BaseBehaviour

        def analysis(node)
          'added'
        end

      end
    end
  end
end
