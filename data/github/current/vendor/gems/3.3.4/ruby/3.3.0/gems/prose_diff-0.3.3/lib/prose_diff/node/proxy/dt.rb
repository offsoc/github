module ProseDiff
  class Node
    module Proxy
      class Dt

        include LevenshteinDistanceBehaviour, SimpleTextContainerBehaviour, CanOnlyCorrespondToTheSameTagBehaviour, BaseBehaviour

      end
    end
  end
end
