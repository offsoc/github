# typed: true
# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class CheckAnnotation
      EXAMPLE_FILE_DATA = [
        {
          filename: "contributing.md",
          content: "stuff\nand\nthings\n",
        },
        {
          filename: "evergreen.md",
          content: Faker::Lorem.paragraphs(number: (paragraphs = 2)).join("\n\n") + "\n",
        },
        {
          filename: "non-diff-annotation-file.md",
          content: "Hey\nthis is a test\nspecifically, for non-diff annotations!",
        },
        {
          filename: "file-with-context-annotations.md",
          content: (1..30).to_a.join("\n"),
          modified_content: (1..30).to_a.insert(14, 101, 102, 103).join("\n")
        }
      ]

      EXAMPLE_WARNING_MESSAGES = {
        warning: "This might be problematic in the future because X.",
        notice: "An interesting thing about this is X.",
        failure: <<-TEXT,
        Minitest::Assertion:

        The following CSS classes were used in class attributes but have no style rules referencing them:

        Class name                     Seen in
        ======================================
        text-mono                      app/views/checks/_checks_summary.html.erb
        /github/file.rb:84
        TEXT
      }

      def self.create_examples_for_check_run(check_run)
        sha = check_run.head_sha

        raw_details = <<~TEXT
          /var/lib/jenkins/workspace/enterprise/vendor/gems/2.4.3/ruby/2.4.0/gems/readme.md-0.7.3.22.g4bf341e/lib/readme.md:168:in `settle_from_handler'\n/var/lib/jenkins/workspace/enterprise/vendor/gems/2.4.3/ruby/2.4.0/gems/readme.md-0.7.3.22.g4bf341e/lib/readme.md:188:in `bar_method'\n/var/lib/jenkins/workspace/enterprise/vendor/gems/2.4.3/ruby/2.4.0/gems/readme.md-0.7.3.22.g4bf341e/lib/readme.md:208:in `block (2 levels) in method_foo'\n/var/lib/jenkins/workspace/enterprise/vendor/gems/2.4.3/ruby/2.4.0/gems/readme.md-0.7.3.22.g4bf341e/lib/readme.md:164:in `defer'\n/var/lib/jenkins/workspace/enterprise/vendor/gems/2.4.3/ruby/2.4.0/gems/readme.md-0.7.3.22.g4bf341e/lib/readme.md:208:in `block in method_foo'\n/var/lib/jenkins/workspace/enterprise/vendor/gems/2.4.3/ruby/2.4.0/gems/readme.md-0.7.3.22.g4bf341e/lib/readme.md:207:in `each'\n/var/lib/jenkins/workspace/enterprise/vendor/gems/2.4.3/ruby/2.4.0/gems/readme.md-0.7.3.22.g4bf341e/lib/readme.md:207:in `each_slice'\n/var/lib/jenkins/workspace/enterprise/vendor/gems/2.4.3/ruby/2.4.0/gems/readme.md-
        TEXT

        titles = [
          "WorkspaceContext#test_returns_workspace",
          "MemberContext#test_does_not_include_member",
          "QueryContext#test_succeeds",
          "AuthorizationContext#test_object_has_appropriate_scope",
          "RenderContext#test_renders_correct_object",
          nil,
        ]

        EXAMPLE_FILE_DATA.each do |change|
          filename = change[:filename]

          if filename == "file-with-context-annotations.md"
            check_run.annotations.create!(
              filename: filename,
              start_line: 3,
              end_line: 3,
              annotation_level: "warning",
              repository: check_run.repository,
              message: "SQL injection attack possible here! Even though this is just a bunch of integers."
            )
            check_run.annotations.create!(
              filename: filename,
              start_line: 25,
              end_line: 26,
              annotation_level: "notice",
              repository: check_run.repository,
              message: "There's something fishy about these lines"
            )
          else
            num_lines = change[:content].lines.size
            end_line = rand(1..num_lines)
            start_line = end_line - 1

            annotation_attrs = {
              filename: filename,
              start_line: start_line,
              end_line: end_line,
              check_run: check_run,
              repository: check_run.repository,
            }

            EXAMPLE_WARNING_MESSAGES.each do |level, message|
              level_specific_attrs = annotation_attrs.merge(
                warning_level: level.to_s,
                message: message,
                title: titles[rand(1..titles.length - 1)],
              )

              if level.to_s == "failure"
                level_specific_attrs[:raw_details] = raw_details
                level_specific_attrs[:suggested_change] = "Sample Suggested Change"
              end

              check_run.annotations.create!(level_specific_attrs)
            end
          end
        end
      end
    end
  end
end
