# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `github-scout` gem.
# Please instead update this file by running `bin/tapioca gem github-scout`.

# source://github-scout//lib/scout/heuristics.rb#1
module Scout
  class << self
    # source://github-scout//lib/scout.rb#8
    def detect(blob, allow_empty: T.unsafe(nil)); end

    # source://github-scout//lib/scout.rb#36
    def instrument(*args, &bk); end

    # Returns the value of attribute instrumenter.
    #
    # source://github-scout//lib/scout.rb#34
    def instrumenter; end

    # Sets the attribute instrumenter
    #
    # @param value the value to set the attribute instrumenter to.
    #
    # source://github-scout//lib/scout.rb#34
    def instrumenter=(_arg0); end
  end
end

# source://github-scout//lib/scout/heuristics.rb#2
class Scout::Heuristics < ::Linguist::Heuristics
  # source://github-scout//lib/scout/heuristics.rb#34
  def call(data); end

  # source://github-scout//lib/scout/heuristics.rb#47
  def tech_stacks; end

  class << self
    # source://github-scout//lib/scout/heuristics.rb#18
    def call(blob, candidates); end

    # source://github-scout//lib/scout/heuristics.rb#30
    def load_config; end

    # source://github-scout//lib/scout/heuristics.rb#5
    def tech_stacks; end
  end
end

# source://github-scout//lib/scout/strategy/extension.rb#2
module Scout::Strategy; end

# Detects stack based on extension
#
# source://github-scout//lib/scout/strategy/extension.rb#4
class Scout::Strategy::Extension
  class << self
    # source://github-scout//lib/scout/strategy/extension.rb#13
    def call(blob, candidates); end

    # source://github-scout//lib/scout/strategy/extension.rb#5
    def non_extensions_stacks; end
  end
end

# Detects stack based on filename
#
# source://github-scout//lib/scout/strategy/filename.rb#4
class Scout::Strategy::Filename
  class << self
    # source://github-scout//lib/scout/strategy/filename.rb#13
    def call(blob, candidates); end

    # source://github-scout//lib/scout/strategy/filename.rb#5
    def non_filename_stacks; end
  end
end

# source://github-scout//lib/scout/tech_stack.rb#2
class Scout::TechStack < ::Linguist::Language
  # @return [TechStack] a new instance of TechStack
  #
  # source://github-scout//lib/scout/tech_stack.rb#38
  def initialize(attr = T.unsafe(nil)); end

  # Returns the value of attribute dependsOn.
  #
  # source://github-scout//lib/scout/tech_stack.rb#19
  def dependsOn; end

  # source://github-scout//lib/scout/tech_stack.rb#56
  def get_types; end

  # Returns the value of attribute stack_id.
  #
  # source://github-scout//lib/scout/tech_stack.rb#21
  def stack_id; end

  class << self
    # source://github-scout//lib/scout/tech_stack.rb#80
    def add_dependent_stacks(stacks_found); end

    # source://github-scout//lib/scout/tech_stack.rb#51
    def build_stack_dependency_map; end

    # source://github-scout//lib/scout/tech_stack.rb#23
    def create(attr = T.unsafe(nil)); end

    # source://github-scout//lib/scout/tech_stack.rb#74
    def filter_index_by_language(index, stacks_to_include); end

    # source://github-scout//lib/scout/tech_stack.rb#43
    def filter_stacks_by_languages(detected_languages); end

    # source://github-scout//lib/scout/tech_stack.rb#60
    def find_by_extension(filename); end

    # source://github-scout//lib/scout/tech_stack.rb#66
    def find_by_filename(filename); end
  end
end
