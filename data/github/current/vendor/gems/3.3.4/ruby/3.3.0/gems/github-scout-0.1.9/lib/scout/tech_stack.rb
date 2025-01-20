module Scout
  class TechStack < Linguist::Language

    @languages          = []
    @independent_stacks = []
    @index              = {}
    @name_index         = {}
    @alias_index        = {}
    @language_id_index  = {}
    @stack_id_index     = {}

    @extension_index    = Hash.new { |h,k| h[k] = [] }
    @interpreter_index  = Hash.new { |h,k| h[k] = [] }
    @filename_index     = Hash.new { |h,k| h[k] = [] }
    @stack_language_map = Hash.new { |h,k| h[k] = [] }
    @stack_stack_map    = Hash.new { |h,k| h[k] = [] }
    @dependency_map     = Hash.new { |h,k| h[k] = [] }

    attr_reader :dependsOn

    attr_reader :stack_id

    def self.create(attr={})
      super
      @stack_id_index[attr[:stack_id]] = find_by_name(attr[:name]) || find_by_alias(attr[:name])

      if attr[:dependsOn].empty?
        @independent_stacks << find_by_name(attr[:name]) || find_by_alias(attr[:name])
      else
        @dependsOn = attr[:dependsOn]

        attr[:dependsOn].each do |tech_stack|
          @dependency_map[tech_stack] << find_by_name(attr[:name]) || find_by_alias(attr[:name])
        end
      end
    end

    def initialize(attr={})
      super
      @stack_id = attr[:stack_id]
    end

    def self.filter_stacks_by_languages(detected_languages)
      stacks_to_include = @dependency_map.select { |language, stacks| detected_languages.include? language }.values.flatten.uniq
      stacks_to_include += @independent_stacks

      filter_index_by_language(@extension_index, stacks_to_include)
      filter_index_by_language(@filename_index, stacks_to_include)
    end

    def self.build_stack_dependency_map
      @stack_stack_map = @dependency_map.select { |tech_stack, dependent_tech_stacks| find_by_alias(tech_stack) }
      @stack_language_map = @dependency_map.select { |tech_stack, dependent_tech_stacks| !find_by_alias(tech_stack) }
    end

    def get_types
      @types = [:buildtool, :packagemanager, :framework, :taskrunner, :cloudresource, :config]
    end

    def self.find_by_extension(filename)
      stacks = super

      add_dependent_stacks(stacks)
    end

    def self.find_by_filename(filename)
      stacks = super

      add_dependent_stacks(stacks)
    end

    private

    def self.filter_index_by_language(index, stacks_to_include)
      index.each do |filename, stacks|
        index[filename] = stacks & stacks_to_include
      end
    end

    def self.add_dependent_stacks(stacks_found)
      dependent_stacks_included = []
      dependent_stacks_included.concat(stacks_found)

      stacks_found.each do |stack|
        dependent_stacks_included.concat(@stack_stack_map[stack.name]) if @stack_stack_map[stack.name]
      end

      dependent_stacks_included.uniq
    end
  end

  stacks_yml = File.expand_path("../tech_stacks.yml",  __FILE__)

  popular = YAML.load_file(File.expand_path("../popular.yml", __FILE__))

  stacks = YAML.load_file(stacks_yml)

  stacks.each do | name, options |
    options['extensions'] ||= []
    options['interpreters'] ||= []
    options['filenames'] ||= []
    options['dependsOn'] ||= []

    Scout::TechStack.create(
      :name              => name,
      :fs_name           => options['fs_name'],
      :color             => options['color'],
      :type              => options['type'],
      :aliases           => options['aliases'],
      :tm_scope          => options['tm_scope'],
      :ace_mode          => options['ace_mode'],
      :codemirror_mode   => options['codemirror_mode'],
      :codemirror_mime_type => options['codemirror_mime_type'],
      :wrap              => options['wrap'],
      :group_name        => options['group'],
      :stack_id       => options['stack_id'],
      :extensions        => Array(options['extensions']),
      :interpreters      => options['interpreters'].sort,
      :filenames         => options['filenames'],
      :dependsOn         => options['dependsOn'],
      :popular           => popular.include?(name)
    )
  end

  Scout::TechStack.build_stack_dependency_map
end
