# typed: true
# frozen_string_literal: true

$LOAD_PATH.unshift File.expand_path("../lib", __dir__)

require "sorbet-runtime"
require "github/sorbet/module_patch"
require "code_stats"
require "optparse"

# ------------------------------------------------------------------------------------------------------------------
#                                                  Register reports
# ------------------------------------------------------------------------------------------------------------------
# Register reports here. Each report requires a `name` and a `key` which is used to identify the report.
#
# - `name`: The name of the report. This is used to call the report from the command line.
# - `key` : The key used to identify the report. This is used to identify the report in the datadog event.
# - block: The block that will be called when the report is called. The block will be passed a Report object.
#
# ------------------------------------------------------------------------------------------------------------------

# Count the number of JS files that are custom elements
CodeStats::Reporter.register_report(name: :custom_elements, key: "assets.js.custom-elements") do |report|
  # Load matching sources into report
  report.match_sources(CodeStats::JS_GLOBS, / extends HTMLElement/)

  report.sources.each do |source|
    if source.matching_lines(/@controller/).any?
      source.increment(tag: { type: "catalyst" })
    else
      source.increment(tag: { type: "plain" })
    end
  end
end

# Count the number of JS files outside of the monorepo
CodeStats::Reporter.register_report(name: :ui_monorepo_migration) do |report|
  # Load matching sources into report
  report.match_sources(CodeStats::NON_MONOREPO_JS_GLOBS, /./, /node_modules|ui\/packages\/memex/)

  files_to_migrate = report.sources.size

  report.match_sources(CodeStats::MONOREPO_JS_GLOBS, /./, /node_modules|ui\/packages\/memex/)

  total_files = report.sources.size
  monorepo_files = report.sources.size - files_to_migrate

  report.sources.clear
  report.match_sources(%w[
    ui/packages/*/package.json
  ], /./)
  packages_count = report.sources.size

  report.gauge("ui_monorepo.js.files_to_migrate", files_to_migrate)
  report.gauge("ui_monorepo.js.files", monorepo_files)
  report.gauge("ui_monorepo.packages.count", packages_count)
end

# Count ts comment rules.
CodeStats::Reporter.register_report(name: :typescript_comments, key: "assets.js.typescript.comments") do |report|
  # Load matching sources into report
  report.match_sources(CodeStats::JS_GLOBS, /@ts-/)

  report.sources.each do |source|
    source.matching_lines(/@ts-(?<rule>nocheck|expect-error|ignore|check)/).each do |line|
      source.increment(tag: { rule: line[:match][:rule] })
    end
  end
end

# Report bundle sizes
CodeStats::Reporter.register_report(name: :bundle_sizes, key: "assets.size") do |report|
  # Load matching sources into report
  report.match_sources(%w[
    public/assets/*.{css,js}
  ], /./)

  report.sources.each do |source|
    source.add_tag(:component, :bundle)

    next if ["/vendors-node_modules", ".css.js"].any? { |m| source.path.include?(m) }

    size = File.lstat(source.path).size
    gz_size = IO.popen("gzip -c #{source.path} | wc -c").read.to_i

    source.increment(value: size)
    report.gauge("assets.size.gzip", gz_size, source.tag_array)
  end
end

CodeStats::Reporter.register_report(name: :pvc_experimental_count, key: "primer.component.count") do |report|
  # Load matching sources into report
  report.match_sources(CodeStats::ERB_GLOBS + CodeStats::RB_GLOBS, /Primer::Experimental/)

  report.sources.each do |source|
    source.matching_lines(/Primer::Experimental::(?<name>[a-zA-Z]+)?/).each do |line|
      if line[:line].match?(" < #{line[:match]}") || line[:line].match?("#{line[:match]}.new")
        source.increment(tag: { name: line[:match][:name], status: "experimental", accessibility: "unreviewed", library: "primer/view_components" })
      end
    end
  end
end

CodeStats::Reporter.register_report(name: :rails_view_count, key: "github.components.count") do |report|
  report.match_sources(%w[
    app/components/**/*.rb
    packages/**/app/components/**/*.rb
    ] + CodeStats::ERB_GLOBS, /./)

  report.sources.each do |source|
    filepath = source.path

    next if filepath.end_with?(".rb") && (File.exist?(filepath.gsub(".rb", ".html.erb")) || File.exist?(filepath.gsub(".rb", ".erb")))
    next if filepath.end_with?(".rb") && source.matching_lines(/< (\S+Component|Primer::|ApplicationForm).*\z/).empty?

    component_index = filepath.index("app/components/")
    axe_scanned = !!component_index && File.exist?("test/system/components/#{filepath[component_index + 15..-1].gsub(/(\.html)*\.(e)*rb/, "_system_test.rb")}")
    scannable = !!component_index &&
      (File.exist?("test/system/components/#{filepath[component_index + 15..-1].gsub(/(\.html)*\.(e)*rb/, "_system_test.rb")}") ||
        !File.exist?(filepath.gsub("app/components/", "test/components/").gsub(/(\.html)*\.(e)*rb/, "_test.rb")) ||
        File.read(filepath.gsub("app/components/", "test/components/").gsub(/(\.html)*\.(e)*rb/, "_test.rb")).include?("ViewComponent/EncouragePreviewsForScannableComponents"))

    source_type = if filepath.end_with?(".rb") || (filepath.end_with?(".erb") && File.exist?(filepath.gsub(/(\.html)*\.erb/, ".rb")))
      :view_component
    else
      :rails_view
    end

    source.add_tag(:type, source_type)
    source.increment(tag: { axe_scanned: axe_scanned, scannable: scannable })
  end
end

CodeStats::Reporter.register_report(name: :view_component_axe_violations, key: "github.components.axe_violations.count") do |report|
  report.match_sources(%w[test/system/components/**/*_system_test.rb], /./)

  axe_violations = JSON.parse(`RAILS_ENV=test bin/rake components:axe_violations`)

  report.sources.each do |source|
    violations = axe_violations[source.path]
    next unless violations.present?
    violations.each do |violation|
      report.gauge(report.metric_key, 1, ["path:#{source.path}", "catalog_service:#{source.serviceowner}", "type:view_component",  "repo:github/github", "violation:#{violation}"])
    end
  end
end

def stories_file_exists?(files, filepath)
  stories_filepath = filepath.gsub(".tsx", ".stories.tsx")
  return true if File.exist?(stories_filepath)
  component_basename = File.basename(stories_filepath)
  path_parts = filepath.split("/")

  in_monorepo = filepath.include?("ui/packages/")
  package_index = path_parts.find_index do |part|
    if in_monorepo
      part == "packages"
    else
      %w[components src layouts routes pages stories helpers hooks].include?(part)
    end
  end

  package_index += 2 if in_monorepo
  package_dirname = path_parts[0...package_index].join("/")
  package_files = files.select do |p|
    p.start_with?(package_dirname)
  end
  package_files.any? do |package_file|
    package_file.include?("/#{component_basename}")
  end
end

def get_react_shared_components(format = "list")
  raw_audit_output = `FORMAT=#{format} npm run react-component-audit -w ui/packages/react-audit`
  shared_components_list = JSON.parse(raw_audit_output[(raw_audit_output.index("\n\n") + 2)..-1])
  if format == "list"
    shared_components_list.each_with_object({}) do |shared_component_path, shared_components|
      trim_path = shared_component_path[shared_component_path.index(/(ui\/packages|app\/)/)..-1]
      shared_components[trim_path] = true
    end
  else
    shared_components_list
  end
end

CodeStats::Reporter.register_report(name: :react_component_count, key: "github.components.count") do |report|
  report.match_sources(%w[
    app/assets/modules/**/*.tsx
    ui/packages/**/*.tsx
    ], /./, /(__tests__|\/tests\/|__fixtures__)/)

  shared_components = get_react_shared_components

  source_files = report.sources.map(&:path)
  report.sources.each do |source|
    filepath = source.path
    next if filepath.end_with?(".stories.tsx")

    source.add_tag(:type, "react")
    source.increment(tag: { scannable: !!shared_components[filepath], axe_scanned: stories_file_exists?(source_files, filepath) })
  end
end

CodeStats::Reporter.register_report(name: :collab_shared_components_count, key: "github.components.count") do |report|
  report.match_sources(%w[
    app/assets/modules/**/*.tsx
    ui/packages/**/*.tsx
  ], /./, /(__tests__|\/tests\/|__fixtures__)/)

  component_packages = get_react_shared_components("json")["packages"]

  package_names = component_packages.map { |package| package["name"] }

  report.sources.each do |source|
    source.matching_lines(package_names.join("|")).each do |line|
      matched_package = line[:match].to_s
      name = matched_package.split("/").last
      status = component_packages.find { |p| p["name"] == matched_package }.dig("componentInfo", "status")
      pkgtype = component_packages.find { |p| p["name"] == matched_package }.dig("componentInfo", "type")

      source.add_tag(:type, "react")
      source.increment(tag: { name: name, status: status, pkgtype: pkgtype }.compact)
    end
  end
end

CodeStats::Reporter.register_report(name: :react_component_axe_violations, key: "github.components.axe_violations.count") do |report|
  ## This report requires the Storybook test suite to have been run first.
  report.match_sources(%w[app/assets/modules/**/*.stories.tsx ui/packages/**/*.stories.tsx], /./, /__fixtures__/)

  report.sources.each do |source|
    violations_filepath = "storybook-stats/--#{source.path.gsub(/[\/\.]/, "-")}.json"
    next unless File.exist?(violations_filepath)

    violations = JSON.parse(File.read(violations_filepath))["stories"].map { |_, details| details["disabledRuleNames"] }.flatten.uniq
    violations.each do |violation|
      report.gauge(report.metric_key, 1, ["path:#{source.path}", "catalog_service:#{source.serviceowner}", "type:react",  "repo:github/github", "violation:#{violation}"])
    end
  end
end

CodeStats::Reporter.register_report(name: :i18n_hardcoded_strings_count, key: "github.components.hardcoded_strings.count") do |report|
  report.match_sources(CodeStats::ERB_GLOBS, /./)

  raw_audit_output = `bundle exec erblint --format json --enable-linters i18n_hardcoded_string_counter #{CodeStats::ERB_GLOBS.join(" ")}`
  lint_report = JSON.parse(raw_audit_output)

  report.sources.each do |source|
    file = lint_report["files"].find { |file| file["path"] == source.path && file["offenses"].any? }
    next unless file
    offenses = file["offenses"]
      # don't count the counters as actual offenses
      .filter { |offense| !offense["message"].start_with?("I18nHardcodedStringCounter") }

    tags = source.tag_array
    report.gauge(report.metric_key, offenses.count, tags)
  end
end

CodeStats::Reporter.register_report(name: :rails_view_lines_count, key: "primer.rails_view.lines.count") do |report|
  # Load matching sources into report
  report.match_sources(%w[
    app/views/**/*.erb
    app/view_models/**/*.rb
    app/components/**/*.erb
                       ], /./)

  report.sources.each do |source|
    source.increment(value: File.readlines(source.path).length)
  end
end

CodeStats::Reporter.register_report(name: :custom_css_classes, key: "code_stats.css_classes.count") do |report|
  primer_classes =
    JSON.parse(
      File.read(File.join(File.dirname(__FILE__), "../node_modules/@primer/css/dist/stats/primer.json"))
    )["selectors"]["values"].
      flat_map { |c| c.gsub(/(\w)\./, '\1 .').split(/[\s:\[+>]+/) }.
      select { |c| c[0] == "." }.
      uniq.
      map { |s| s.delete(".") }

  IDENT = /[a-z][_a-z0-9-]*/i
  CLASS_LIST = /#{IDENT}(?:\s+#{IDENT})*/
  CSS_REGEX = /
    (?:
        (?<!-)\bclass= # HTML class attribute
      |
        :class\s+=>\s+ # :class option to a Rails helper
      |
        \sclass:\s+ # class option to a Rails helper (HashSyntax 1.9)
    )
    ["']\s*            # Opening quote and optional whitespace
    (#{CLASS_LIST})    # The classes themselves
    \s*["']            # Optional whitespace and closing quote
  /ix
  # regex = /(?<name>primer_octicon|primer_heading|primer_time_ago|primer_image)/

  # Load matching sources into report
  report.match_sources(CodeStats::ERB_GLOBS, CSS_REGEX)

  report.sources.each do |source|
    custom_css = []
    primer_css = []

    source.matching_lines(CSS_REGEX).each do |line|
      line[:match][1].split(" ").each do |class_name|
        next if class_name.start_with?("js-")

        if primer_classes.include?(class_name)
          primer_css << class_name
        else
          custom_css << class_name
        end
      end
    end

    if primer_css.any?
      source.increment(tag: { css_type: "primer-css" }, value: primer_css.length)
      report.gauge("code_stats.css_classes.unique_count", primer_css.uniq.length, source.tag_array + ["css_type:primer-css"])
    end

    if custom_css.any?
      source.increment(tag: { css_type: "custom-css" }, value: custom_css.length)
      report.gauge("code_stats.css_classes.unique_count", custom_css.uniq.length, source.tag_array + ["css_type:custom-css"])
    end
  end
end

require "gh/dev/code_stats"

code_stats = GH::Dev::CodeStats.new(::CodeStats::SERVICEOWNERS)
code_stats.register_package_stats(:package_stats)
code_stats.register_sorbet_stats(:sorbet_stats)
code_stats.register_count_stats(:count_stats)
code_stats.register_query_stats(:query_stats)
code_stats.register_circular_dependencies_stats(:circular_dependencies_stats)
code_stats.register_downcast_stats(:downcast_stats)

# Option Parser for command line usage
#
# -a, --all — Run all reports that have been registered
# -r, --reports — Run the comma separated list of specified report(s)
#
OptionParser.new do |opts|
  opts.banner = "Usage: ruby script/report_code_stats.rb [options]"

  opts.on("-a", "--all", "Run all reports") do |_v|
    CodeStats::Reporter.report_names.each do |report_name|
      CodeStats::Reporter.submit_report(report_name)
    end
  end

  opts.on("-r", "--reports [REPORTS]", "Comma separated list of reports") do |reports|
    reports.split(",").each do |report|
      CodeStats::Reporter.submit_report(report.to_sym)
    end
  end
end.parse! unless ENV["RAILS_ENV"] == "test"
