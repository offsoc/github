# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class Generate < Seeds::Runner
      def self.run(name, options = {})
        base_path = options[:base_path] || Rails.root

        case options[:type]
        when "runner"
          template name, "runner.rb.erb", File.join(base_path, "script/seeds/runners/#{name.underscore}.rb")
          template name, "runner_test.rb.erb",
            File.join(base_path, "test/script/seeds/runners/#{name.underscore}_test.rb")
          add_command_to_app(base_path, name, options)
        when "object"
          template name, "object.rb.erb", File.join(base_path, "script/seeds/objects/#{name.underscore}.rb")
          template name, "object_test.rb.erb",
            File.join(base_path, "test/script/seeds/objects/#{name.underscore}_test.rb")
        end
      end

      def self.template(name, template_name, output_file)
        template_file = File.expand_path("../templates/#{template_name}", __FILE__)
        template = File.read(template_file)
        data = OpenStruct.new(name: name)
        result = ERB.new(template).result(data.instance_eval { binding })

        FileUtils.mkpath(File.dirname(output_file))
        puts "Writing file to #{output_file}"
        File.write(output_file, result)
      end

      def self.add_command_to_app(base_path, name, options)
        to_add = <<~EOF
        desc "#{name.underscore}", Seeds::Runner::#{name.camelize}.help.lines.first
            long_desc Seeds::Runner::#{name.camelize}.help
            # method_option :nwo, type: :string, aliases: "-r", desc: "NWO of repo to use", required: true
            def #{name.underscore}
              Seeds::Runner::#{name.camelize}.execute(options)
            end
        EOF

        app_file = File.join(base_path, "script/seeds/app.rb")
        puts "Adding command to #{app_file}"
        new_content = File.read(app_file).sub(/desc "console"/, "#{to_add}\n    desc \"console\"")
        File.write(app_file, new_content)
      end
    end
  end
end
