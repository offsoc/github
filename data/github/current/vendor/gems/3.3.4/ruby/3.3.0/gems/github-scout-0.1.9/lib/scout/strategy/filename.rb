module Scout
  module Strategy
    # Detects stack based on filename
    class Filename
      def self.non_filename_stacks
        if @non_filename_stacks
          return @non_filename_stacks
        end

        @non_filename_stacks ||= TechStack.all.select { |stack| stack.filenames.empty? }
      end

      def self.call(blob, candidates)
        stacks = TechStack.find_by_filename(blob.name.to_s)
        allowed_stacks = stacks | non_filename_stacks
        candidates.any? ? candidates & allowed_stacks : stacks
      end
    end
  end
end
