module ProseDiff
  class Node
    module Proxy
      class Dd

        include LevenshteinDistanceBehaviour, CanOnlyCorrespondToTheSameTagBehaviour, BaseBehaviour

      end
    end
  end
end
