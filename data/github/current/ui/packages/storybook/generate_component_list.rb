# frozen_string_literal: true
require "json"
require "fileutils"

module ComponentListGenerator
  SERVICEOWNERS_PATH = "SERVICEOWNERS"
  TARGET_FILE = "ui/packages/storybook/docs/Introduction.mdx"
  README_FILE_NAME = "README.mdx"

  def self.get_service_owners_map
    File.readlines(SERVICEOWNERS_PATH).map(&:strip).each_with_object({}) do |line, map|
      if (match = line.match(/(ui\/packages\/[^\s\t]+\/?)\s*:(.+)/))
        directory, owner = match[1].strip, match[2].strip
        package_path = File.join(directory, "package.json")
        map[directory] = owner if File.exist?(package_path)
      end
    end
  end

  def self.read_manifest(dir)
    file_path = File.join(dir, "package.json")
    JSON.parse(File.read(file_path))
  rescue JSON::ParserError => e
    puts "Error parsing package.json in #{dir}: #{e.message}"
    nil
  end

  def self.get_all_manifests(service_owners_map)
    manifests = []

    service_owners_map.keys.each do |dir|
      package_data = read_manifest(dir)
      dir_name = dir.split("/").last

      next unless package_data && package_data["componentInfo"]

      component = package_data["componentInfo"].merge({
        "description" => package_data["description"],
        "homepage" => package_data["homepage"]
      })
      if component && component["type"]
        manifests << { "component" => component, "dir" => dir_name }
      end
    end

    manifests.sort_by { |manifest| manifest.dig("component", "name") }
  end

  def self.get_status_class(status)
    case status
    when "Ready"
      "color-bg-success color-fg-success color-border-success-emphasis"
    when "In Review"
      "color-bg-accent color-fg-accent color-border-accent-emphasis"
    else
      "color-bg-subtle color-fg-muted color-border-subtle"
    end
  end

  def self.get_status_html(status)
    return "" unless status

    status_class = get_status_class(status)
    "<span className=\"f6 IssueLabel d-inline-flex flex-align-center text-bold #{status_class}\">#{status}</span>"
  end

  def self.generate_component_entry(manifest_with_dir, service_owners_map)
    component = manifest_with_dir["component"]
    return unless component["type"] && component["name"]

    component_homepage = component["homepage"]
    component_path = "ui/packages/#{manifest_with_dir["dir"]}/"
    component_owner = service_owners_map[component_path]
    return unless component_owner

    if component["type"] == "Recipes" && component["status"].nil?
      puts "Error: Missing status for recipe: #{component["name"]}."
      return
    end

    status = get_status_html(component["status"])

    github_issue_link = component.dig("links", "tracking")
    github_issue_link = nil if github_issue_link.to_s.strip.empty?

    figma_link = component.dig("links", "figma")
    figma_link = nil if figma_link.to_s.strip.empty?

    title = if component_homepage && !component_homepage.strip.empty?
      "<a href=\"#{component_homepage}\" className=\"h4 m-0 mr-2 color-fg-default\">#{component["name"]}</a>"
    else
      "<span className=\"h4 m-0 mr-2\">#{component["name"]}</span>"
    end

    <<~DIV.strip
      <div className="Box-row p-3">
        <div className="d-flex flex-justify-between flex-items-center mb-1">
          <div className="d-flex flex-items-center">
            #{title}
            #{status}
          </div>
          <div className="f5">
            #{github_issue_link ? "<a href=\"#{github_issue_link}\" className=\"mr-3 f5\">Tracking issue</a>" : ""}
            #{figma_link ? "<a href=\"#{figma_link}\">Figma</a>" : ""}
          </div>
        </div>
        <div>
          <p className="m-0">#{component["description"]}</p>
          <p className="m-0 f6 color-fg-muted">Owned by #{component_owner}</p>
        </div>
      </div>
    DIV
  end

  def self.update_category_entries_with_divs(content, manifests, service_owners_map)
    types_to_replace = {
      "Recipes" => "recipes-list",
      "Utilities" => "utilities-list",
      "Apps" => "apps-list",
      "Templates" => "templates-list"
    }

    types_to_replace.each do |type, placeholder_id|
      start_comment = "{/* START:#{placeholder_id} */}"
      end_comment = "{/* END:#{placeholder_id} */}"

      relevant_components = manifests.select { |manifest| manifest["component"]["type"] == type }
      divs_to_add = relevant_components.map { |manifest| generate_component_entry(manifest, service_owners_map) }.compact.join("\n")

      wrapped_divs = "<div className=\"Box\">\n#{divs_to_add}\n</div>"

      replacement_content = "#{start_comment}\n#{wrapped_divs}\n#{end_comment}"

      content.gsub!(/#{Regexp.escape(start_comment)}.*?#{Regexp.escape(end_comment)}/m, replacement_content)
    end

    content
  end

  def self.add_metadata_to_readme(package_data, readme_path, service_owners_map)
    directory = package_data["directory"]
    component_owner = service_owners_map[directory] || "N/A"
    status = get_status_html(package_data.dig("componentInfo", "status"))
    github_issue_link = package_data.dig("componentInfo", "links", "tracking")
    github_issue_link = nil if github_issue_link.to_s.strip.empty?
    figma_link = package_data.dig("componentInfo", "links", "figma")
    figma_link = nil if figma_link.to_s.strip.empty?

    readme_content = File.read(readme_path)

    title_match = readme_content.match(/^(#\s+)(.+)/)
    return if title_match.nil? # Exit if no title is present

    title = title_match[2] # Capture only the text part, excluding '#'

    metadata_block = <<-HTML
{/* METADATA_START */}
<div class="border-bottom pb-2 mb-3">
  <div className="d-flex flex-justify-between flex-items-center">
    <div class="d-flex flex-items-center">
      <h1 class="m-0 mr-2">#{title}</h1>
      <span className="f5 d-inline-block">#{status}</span>
    </div>
    <div class="d-inline-flex flex-items-center">
      #{github_issue_link ? "<span className=\"f5\"><a href=\"#{github_issue_link}\">Tracking issue</a></span>" : ""}
      #{figma_link ? "<span className=\"f5 ml-3\"><a href=\"#{figma_link}\">Figma</a></span>" : ""}
    </div>
  </div>
  <p className="m-0 f6 color-fg-muted">Owned by #{component_owner}</p>
</div>
{/* METADATA_END */}
    HTML

    metadata_regex = /{\/\* METADATA_START \*\/}.*?{\/\* METADATA_END \*\/}/m

    if readme_content.match(metadata_regex)
      updated_readme_content = readme_content.gsub(metadata_regex, metadata_block)
    else
      updated_readme_content = readme_content.sub(/^(#\s+.+)/, "#{metadata_block}")
    end

    File.write(readme_path, updated_readme_content)
  end

  def self.update_readmes(service_owners_map)
    service_owners_map.each_key do |directory|
      readme_path = File.join(directory, "README.mdx")
      package_json_path = File.join(directory, "package.json")

      next unless File.exist?(readme_path) && File.exist?(package_json_path)

      package_data = read_manifest(directory)
      package_data["directory"] = directory
      next unless package_data

      add_metadata_to_readme(package_data, readme_path, service_owners_map)
    end
  end

  def self.run
    service_owners_map = get_service_owners_map
    manifests = get_all_manifests(service_owners_map)
    content = File.read(TARGET_FILE)
    updated_content = update_category_entries_with_divs(content, manifests, service_owners_map)
    File.write(TARGET_FILE, updated_content)
    update_readmes(service_owners_map)
    puts "Generating component metadata complete"
  end
end

ComponentListGenerator.run
