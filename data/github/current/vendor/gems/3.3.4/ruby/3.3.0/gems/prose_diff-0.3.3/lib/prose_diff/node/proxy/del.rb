module ProseDiff
  class Node
    module Proxy
      class Del

        include SplitsChildrenAndSelfBehaviour, BaseBehaviour

        def analysis(node)
          'removed'
        end

      end
    end
  end
end
