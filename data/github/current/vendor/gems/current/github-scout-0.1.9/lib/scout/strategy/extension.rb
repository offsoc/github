module Scout
  module Strategy
    # Detects stack based on extension
    class Extension
      def self.non_extensions_stacks
        if @non_extensions_stacks
          return @non_extensions_stacks
        end

        @non_extensions_stacks = TechStack.all.select { |stack| stack.extensions.empty? }
      end

      def self.call(blob, candidates)
        stacks = TechStack.find_by_extension(blob.name.to_s)
        allowed_stacks = stacks | non_extensions_stacks
        candidates.any? ? candidates & allowed_stacks : stacks
      end
    end
  end
end
