# typed: true
# frozen_string_literal: true

# Bring in the big environment so we can introspect routes
require_relative "../config/environment"

require "rubocop"
require "yaml"
require "fileutils"

require "parser/current"
require_relative "../test/rubocop/erb_parser"
require_relative "../test/test_helpers/linting_helpers"

# TODO: Hunt down GitHub/RailsControllerRenderLiteral and GitHub/RailsViewRenderLiteral
# disables and refactor them out, as this tool depends on render literals always being used.
class Viewfinder
  include LintingHelpers

  # "test/integration/about/press_controller_test.rb:8:      get \"/about/press\"" =>
  # "/about/press\"
  def self.get_target_from_get_call(get_call)
    get_call.split(":")[2..].join(":").split(",").first.split("\"")[1]&.split("?")&.first
  end

  # Remove interpolation from get_target
  # If interpolation contains `nwo`, replace it with "x/x"
  # otherwise, replace it with "x"
  #
  # "/\#{@repo.nwo}/actions/manual" =>
  # "/x/x/actions/manual"
  def self.normalize_get_target(get_target)
    sections = get_target.gsub("\"", "").gsub("\#", "").split("/")

    out = sections.map do |section|
      # if url section includes nwo, replace with name/repo
      if section.include?("nwo") || section.include?("name_with_owner")
        "name/repo"
      elsif section.present?
        # otherwise, strip out non alphanumeric characters
        section.gsub(/[^0-9a-z\.\_]/i, "")
      else
        ""
      end
    end.join("/")

    out
  end

  def call(lookup_path = nil)
    @lookup_path = lookup_path
    @output = []

    # Show usage if no path or --help is passed
    if @lookup_path.nil? || @lookup_path.include?("--help")
      @output << <<~USAGE
        To trace a view, run `viewfinder VIEW_PATH` or `viewfinder MyComponent`. For example:
        \nbin/viewfinder Primer::StateComponent
        bin/viewfinder app/views/hooks/_deliveries.html.erb
        bin/viewfinder /Users/.../github/app/views/hooks/_deliveries.html.erb
      USAGE

      return @output
    end

    # For file arguments, attempt to prefix Rails.root to the path,
    # allowing for passing just the local path of a template:
    #
    # bin/viewfinder app/views/hooks/_deliveries.html.erb
    if @lookup_path.end_with?(".rb", ".erb")
      unless @lookup_path.start_with?("/")
        @lookup_path = Rails.root.join(@lookup_path).to_s
      end

      unless File.exist?(@lookup_path)
        @output << "Could not find #{@lookup_path}."
        return @output
      end
    end

    # hash all integration tests and routes file
    content =
      Zlib::crc32(Dir.glob("#{Rails.root.join("test")}/**/*.rb").map { |name| [name, File.mtime(name)] }.to_s).to_s +
      Digest::SHA256.hexdigest(File.read(Rails.root.join("config/routes.rb")))
    digest = Digest::SHA256.hexdigest(content)

    test_cache_path = Rails.root.join("script/viewfinder-cache/routes-#{digest}.yml")

    if File.exist?(test_cache_path)
      if ENV["VERBOSE"]
        puts "Loading route => test mappings from cache."
      end

      @test_lines_by_controller_action = YAML.load_file(test_cache_path)
    else
      if ENV["VERBOSE"]
        @start = Time.now.to_i
        puts "Parsing `get` calls in integration tests."
      end

      # Build a lookup table to derive integration test line numbers
      # from controller actions:
      # "settings#user_profile" => ["test/integration/controllers..."]
      test_get_calls = grep(
        /get ".*"/,
        paths: [Rails.root.join("test/integration/**/*").to_s],
        options: "-n" # include line numbers
      ).lines.map(&:strip)

      test_get_calls = test_get_calls.reject { |line| line.include? "integration/api" }

      # This test controller causes routing errors with path lookups
      test_get_calls = test_get_calls.reject { |line| line.include? "sudo_filter_test" }

      @test_lines_by_controller_action = {}

      test_get_calls.each do |get_call|
        get_target = self.class.get_target_from_get_call(get_call)

        next unless get_target

        # The reference to the test we'll return
        # "test/integration/about/press_controller_test.rb:8:      get \"/about/press\"" =>
        # "test/integration/about/press_controller_test.rb:8
        test_reference = get_call.split(":").first(2).join(":")

        # False matches: "files#disambiguate", "routing_error#index", "dashboard#index", "profiles#show", "notifications_v2#index", "hovercards/repositories#show", "marketplace_listings#show", "oauth#request_access"

        # Look up the route controller reference:
        # "/x/x/actions/manual" =>
        # {:controller=>"actions/manual", :action=>"manual_run_partial", :user_id=>"x", :repository=>"x"}
        route = Rails.application.routes.recognize_path(
          self.class.normalize_get_target(get_target)
        )

        # {:controller=>"actions/manual", :action=>"manual_run_partial", :user_id=>"x", :repository=>"x"} =>
        # "actions/manual#manual_run_partial"
        key = "#{route[:controller]}##{route[:action]}"

        @test_lines_by_controller_action[key] ||= []
        @test_lines_by_controller_action[key] << test_reference
      end

      # Cache controller => test mappings
      FileUtils.mkdir_p(File.dirname(test_cache_path))

      # remove any existing cache files
      # `rm_rf` changed in https://github.com/github/ruby/commit/983115cf3c8f75b1afbe3274f02c1529e1ce3a81
      # in the past this op failed due to insufficient permission but Ruby supressed the error
      FileUtils.rm_rf(Dir.glob("#{File.dirname(test_cache_path)}/*"), secure: true)

      # write cache file
      File.write(test_cache_path, @test_lines_by_controller_action.to_yaml, mode: "w")

      if ENV["VERBOSE"]
        puts "Parsing completed in #{Time.now.to_i - @start} seconds."
      end
    end

    if ENV["VERBOSE"]
      @start = Time.now.to_i
      puts "Generating route => controller action mappings"
    end

    # Build a lookup table to derive paths from controller actions
    @routes_by_controller_action =
      Rails.application.routes.routes.routes.inject({}) do |memo, route|
        # "rails/info#properties"
        key = "#{route.requirements[:controller]}##{route.requirements[:action]}"

        # "/rails/info/properties (rails_info_properties)"
        value = route.ast.to_s.gsub("(.:format)", "") + " (#{route.name})"

        memo[key] = value

        memo
      end

    if ENV["VERBOSE"]
      puts "Routes table generated in #{Time.now.to_i - @start} seconds."
    end

    @output << "Warning: viewfinder is VERY experimental. It probably doesn't work in all cases."

    stacks = trace(@lookup_path, [template_path_name(@lookup_path)]).uniq

    if stacks.length > 0
      @output << "\n#{stacks.length} #{'use'.pluralize(stacks.length)} of #{template_path_name_without_extension(@lookup_path)} found: \n"
    else
      @output << "\n#{template_path_name_without_extension(@lookup_path)} appears to be unused! It might be rendered via interpolation or some other violation of our ViewRenderLiteral linter."
    end

    stacks.each do |stack|
      @output << ""
      @output << stack
    end

    @output << "\nThanks for trying viewfinder! Let us know what you think in #primer-rails <3"

    @output
  end

  private

  def trace(lookup_path, stack)
    matched_files = grep(
      match_pattern(lookup_path),
      paths: [Rails.root.join("app/**/*").to_s, Rails.root.join("lib/primer/**/*").to_s],
      options: "-n" # include line numbers
    ).lines.map(&:strip)

    # default Hash value to empty array,
    # allowing us to blindly append to it
    matches = Hash.new { |h, k| h[k] = [] }

    stacks = T.let([], T::Array[T.untyped])

    matched_files.each do |matched_file|
      file_path, line_number = matched_file.split(":")

      buffer = Parser::Source::Buffer.new("(erb)")
      buffer.source =
        RuboCop::ProcessedSource.from_file_with_rails_erb(
          Rails.root.join(file_path).to_s, 2.6
        ).raw_source
      root_node = Parser::CurrentRuby.new(RuboCop::AST::Builder.new).parse(buffer)

      render_targets = extract_render_targets(root_node, file_path.include?("_controller"))

      render_targets.
        select { |target| target[:target] == template_path_name_without_extension(lookup_path) }.
        each do |target|
        if target[:action].present?
          controller =
            file_path.gsub("app/controllers/", "").
            split(".").first.gsub("_controller", "")

          controller_action = "#{controller}##{target[:action]}"

          # Look up the route entry for the controller action
          route = @routes_by_controller_action[controller_action]

          stack_copy = stack.dup
          stack_copy = stack_copy.prepend("CONTROLLER: #{file_path}##{target[:action]} =>")
          stack_copy = stack_copy.prepend("ROUTE: #{route} =>") if route

          tests = @test_lines_by_controller_action[controller_action]
          if tests
            stack_copy = stack_copy.append("")
            stack_copy = stack_copy.append("    These tests may render this template via this controller action:")

            tests.each do |test|
              stack_copy = stack_copy.append("    RUN_IN_BROWSER=1 bin/rails test #{test}")
            end
          end
          stacks << stack_copy
        else
          matches[file_path] << line_number
        end
      end
    end

    unless matches.empty?
      matches.each do |filename, line_numbers|
        stacks += trace(Rails.root.join(filename).to_s, ["#{filename}:#{line_numbers.uniq.join(",")} =>", *stack])
      end
    end

    stacks
  end

  def match_pattern(lookup_path)
    if lookup_path.include?("Component")
      /#{lookup_path}/
    elsif lookup_path.include?("_component.html")
      /#{template_path_name_without_extension(lookup_path)}/
    else
      /('|")#{template_path_name_without_extension(lookup_path)}('|")/
    end
  end

  def template_path_name(file_path)
    if file_path.include?("Component")
      file_path
    elsif file_path.include?("_component.html")
      # convert /../app/components/sponsors/dashboard/profile/featured_work_component.html.erb
      # into:
      # "Sponsors::Dashboard::Profile::FeaturedWorkComponent"
      file_path.
        gsub(Rails.root.to_s, "").
        gsub("/app/components/", "").
        split(".").
        first.
        split("/").
        map(&:camelize).
        join("::")
    else
      # remove leading underscore from partial file names, but not directories
      file_name = File.basename(file_path).gsub(/^_/, "")
      file_path = File.join(File.dirname(file_path), file_name)

      # remove path into views directory
      file_path = file_path.gsub(Rails.root.join("app", "views").to_s, "")

      # remove leading slash
      file_path = file_path.sub!(/^\//, "")

      file_path
    end
  end

  def template_path_name_without_extension(file_path)
    template_path_name(file_path).split(".").first
  end

  # Given an AST node, extract its render targets
  def extract_render_targets(node, is_controller)
    return [] unless node.is_a?(Parser::AST::Node)

    targets = T.let([], T::Array[T.untyped])

    if node.type == :send
      targets <<
        case T.unsafe(node).method_name
        when :render
          extract_target_from_render_node(node, is_controller)
        when :render_to_string
          extract_target_from_render_to_string_node(node, is_controller)
        end
    end

    node.children.each do |child|
      targets += extract_render_targets(child, is_controller)
    end

    # The target extraction process is currently incomplete,
    # meaning that sometimes we return `nil` for a node.
    #
    # In the future, it might make sense to report the nodes we can't
    # properly trace for the sake of improving this tool,
    # but for now we will ignore them with `compact`:
    targets.compact
  end

  def extract_target_from_view_node(node, is_controller)
    if node.node_parts[2].type == :str
      attach_action_name({ target: node.node_parts[2].value }, node, is_controller)
    end
  end

  def extract_target_from_render_node(node, is_controller)
    if node.node_parts[2].type == :str
      attach_action_name({ target: node.node_parts[2].value }, node, is_controller)
    elsif node.node_parts.last.type == :hash
      partial_node =
        node.node_parts.last.children.find do |pair|
          pair.node_parts.first.value == :partial && pair.node_parts.last.respond_to?(:value)
        end

      attach_action_name({ target: partial_node.node_parts.last.value }, node, is_controller) if partial_node
    elsif node.node_parts.last.type == :send
      if node.node_parts.last.children.first.type == :const
        attach_action_name({ target: node.node_parts.last.children.first.source }, node, is_controller)
      end
    end
  end

  def extract_target_from_render_to_string_node(node, is_controller)
    if node.node_parts.last.respond_to?(:type) && node.node_parts.last.type == :hash
      partial_node =
        node.node_parts.last.children.find do |pair|
          pair.node_parts.first.value == :partial
        end

      attach_action_name({ target: partial_node.node_parts.last.value } , node, is_controller)
    end
  end

  # Attach the action name to the target if possible
  def attach_action_name(target, node, is_controller)
    if is_controller
      action = extract_method_name(node)
      target[:action] = action if action
    end

    target
  end

  # Given an AST node, return the name of
  # the method containing the node
  def extract_method_name(node)
    return unless node
    return node.method_name if node.type == :def

    extract_method_name(node.parent)
  end
end
