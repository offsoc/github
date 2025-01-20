# frozen_string_literal: true

namespace :components do
  desc "Generate a list of components and known axe violations from previews"
  task :axe_violations => :environment do
    test_helper_path = "tmp/script/components/test_helper.rb"
    FileUtils.mkdir_p(File.dirname(test_helper_path))
    File.write(test_helper_path, "# temp override for test_helper otherwise minitest/autorun runs the tests we are loading")
    $LOAD_PATH << "tmp/script/components/"
    $LOAD_PATH << "test"

    require "test_helpers/system_test_case"
    require "test_helpers/github/view_component_system_test_case"

    violations = {}
    Dir.glob("test/system/components/**/*_system_test.rb").each do |path|
      require Rails.root.join("#{path.gsub(".rb", "")}")
      klass = path.gsub("test/system/components", "").gsub(".rb", "").classify.constantize

      next unless klass.const_defined?(:AXE_RULE_EXCLUSIONS_FOR_PREVIEW)

      violations[path] = klass.const_get(:AXE_RULE_EXCLUSIONS_FOR_PREVIEW).values.flatten.uniq.map(&:to_s)
    end

    puts violations.to_json
  end
end
