require 'rugged'
require 'scout/project'

module Scout
  class ProjectAnalysis

    attr_reader :forced_rescan, :rugged, :repo, :commit_oid

    def initialize(rugged, incoming_commit_oid, forced_rescan)
      @forced_rescan = forced_rescan
      @rugged = rugged
      @commit_oid = incoming_commit_oid
      @repo = Scout::Repository.new(rugged, commit_oid)
    end

    def get_repository_projects
      stacks = get_all_stacks

      fetch_projects_from_stacks(stacks)
    end

    def get_all_stacks
      stacks = get_languages
      Scout::TechStack.filter_stacks_by_languages(stacks.map(&:name))
      scout_stacks = get_stacks
      stacks.delete_if{|stack| scout_stacks.any? {|scout_stack| scout_stack.name == stack.name }} + scout_stacks
    end

    private

    def get_stacks
      unless forced_rescan
        repo.load_stacks_cache
      end

      stacks = repo.stacks

      repo.update_stacks_cache

      stack_objects = []
      stacks.each do |stack|
        stack_objects << create_stack_object(:name => stack)
      end

      stack_objects.sort_by(&:name)
    end

    def get_languages
      languages = repo.languages

      language_objects = []
      languages.each do |language, size|
        language_objects << create_stack_object(:name => language, :size => size)
      end

      language_objects.sort_by(&:size).reverse
    end

    def fetch_projects_from_stacks(stacks)
      # TODO: Project detection logic goes here
      project = Project.new(:tech_stack => stacks, :path => '/')

      [project]
    end

    def create_stack_object(attr)
      Component.new(attr)
    end
  end
end
