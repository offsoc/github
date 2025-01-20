module Scout
  class Heuristics < Linguist::Heuristics
    @heuristics = []

    def self.tech_stacks
      if @tech_stacks
        return @tech_stacks
      end

      tech_stacks = []
      @heuristics.each do |heuristic|
        tech_stacks << heuristic.tech_stacks
      end

      @tech_stacks = tech_stacks.flatten.compact
    end

    def self.call(blob, candidates)
      heuristic_candidates = super
      all_tech_stacks = self.tech_stacks
      filtered_candidates = []
      candidates.each do |candidate|
        if heuristic_candidates.include?(candidate) || !all_tech_stacks.include?(candidate)
          filtered_candidates << candidate
        end
      end
      filtered_candidates
    end

    def self.load_config
      YAML.load_file(File.expand_path("../heuristics.yml", __FILE__))
    end

    def call(data)
      matched = @rules.select { |rule| rule['pattern'].match?(data) }

      if !matched.nil?
        tech_stacks = matched.map { |rule| rule['stack'] }
        if tech_stacks.is_a?(Array)
          tech_stacks.map{ |l| TechStack[l] }
        else
          TechStack[tech_stacks]
        end
      end
    end

    def tech_stacks
      @rules.map do |rule|
        stacks_flattened = [rule['stack']].flatten(2)
        stacks_flattened.map { |name| TechStack[name] }
      end.flatten.uniq
    end
  end
end
