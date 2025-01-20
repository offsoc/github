# typed: true
# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class CheckRun
      MD_TABLE_OUTPUT = {
        title: "Report",
        text: <<~TEXT,
        | [Build details](https://codedev.ms/foo/web/build.aspx?pcguid=05b3962d-21d1-4530-bc6f-78d10a9744bd&builduri=vstfs:%2f%2f%2fBuild%2fBuild%2f21)  |  [Test details](https://codedev.ms/foo/web/build.aspx?pcguid=05b3962d-21d1-4530-bc6f-78d10a9744bd&builduri=vstfs:%2f%2f%2fBuild%2fBuild%2f21&_a=summary&tab=ms.vss-test-web.test-result-details)  | [Code coverage details](https://codedev.ms/foo/web/build.aspx?pcguid=05b3962d-21d1-4530-bc6f-78d10a9744bd&builduri=vstfs:%2f%2f%2fBuild%2fBuild%2f21&_a=summary&tab=ms.vss-codecoverage-web.code-coverage-details)|
        |-----------------|-----------------|-----------------|
        | <br />:x: 1 errors / 0 warnings  |  :x: 1 failed / 9 passed / 0 others  |  0% blocks covered<br />Started at 4/13/2018 7:32:41 PM
        | 90% passing  |  0 / 0 blocks covered<br />Finished at 4/13/2018 7:33:04 PM  |  1 new failure(s)
        |  0% lines covered<br />Duration 23.01 seconds  |  0 recurring failure(s)  |  0 / 0 lines covered<br /> |
        TEXT
      }
      MD_OUTPUT = {
        title: "Report",
        text: <<~TEXT,
        Lots more info about the report \n\n and more data: \n\n
        - :x: Make doughnuts
        - :x: Make cherry cobbler
        - :white_check_mark: Make banana pudding
        TEXT
      }
      IMAGE_OUTPUT = {
        title: "Report",
        images: [{
          alt: "Impacted file tree graph",
          image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Graph_of_example_function.svg/600px-Graph_of_example_function.svg.png",
          caption: "Coverage reach",
        }],
        text: "Lots more info about the report \n\n and more data",
        summary: "Build info.\r\n",
      }

      def self.create(check_suite, name:, status:, completed_at:, conclusion:, started_at:, details_url:, with_steps: true, repository:)
        run = check_suite.check_runs.build(
          name: name,
          status: status,
          completed_at: completed_at,
          conclusion: conclusion,
          started_at: started_at,
          details_url: details_url,
          repository: repository,
        )
        create_steps(run, is_actions_app: check_suite.actions_app?) if with_steps
        unless run.save
          raise Seeds::Objects::CreateFailed, "Check run couldn't be saved: #{run.errors.full_messages.to_sentence}"
        end
        run
      end

      def self.create_actions(check_run, action_data: nil, additional: nil)
        action_data ||= [{ label: "Fix", identifier: "fix_errors", description: "Let me fix that for you" }]
        action_data << additional if additional.present?

        actions = action_data.map do |attrs|
          CheckRunAction.new(attrs[:label], attrs[:identifier], attrs[:description])
        end

        check_run.update(actions: actions)
        check_run
      end

      def self.create_steps(check_run, is_actions_app: true)
        max_number = check_run.steps.maximum(:number) || 0

        check_run.steps.build([
          {
            name: "Step1",
            number: max_number + 1,
            started_at: Time.new(2019, 5, 3, 12, 0, 0).utc,
            completed_at: Time.new(2019, 5, 3, 12, 1, 0).utc,
            completed_log_url: "https://logs.github.com/some-unique-slug-step1",
            completed_log_lines: 100,
            status: :completed,
            conclusion: :success,
          },
          {
            name: "Step2",
            number: max_number + 2,
            started_at: Time.new(2019, 5, 3, 12, 2, 0).utc,
            status: :in_progress,
          },
          { name: "Step3", number: max_number + 3 },
        ])

        if is_actions_app && check_run.number.blank?
          used_numbers = ::CheckRun.all.annotate("cross-shard-query-exempted").select(:number).pluck(:number)
          number = 1
          while used_numbers.include?(number)
            number = rand(100000)
          end
          check_run.number = number
        end

        check_run.save
        check_run
      end

      def self.create_images_output(check_run)
        photo_ids = (1...1084).to_a - [86, 97, 105, 138, 148, 150, 205, 207, 224, 226, 245, 246, 262, 285, 286, 298, 303, 332, 333, 346, 359, 394, 414, 422, 438, 462, 463, 470, 489, 540, 561, 578, 587, 589, 592, 595, 597, 601, 624, 632, 636, 644, 647, 673, 697, 706, 707, 708, 709, 710, 711, 712, 713, 714, 720, 725, 734, 745, 746, 747, 748, 749, 750, 751, 752, 753, 754, 759, 761, 762, 763, 771, 792, 801, 812, 843, 850, 854, 864, 886, 891, 895, 897, 905, 917, 920, 934, 956, 963, 968, 1007, 1017, 1030, 1034, 1046]

        images = rand(1..5).times.map do
          {
            alt: "Valuable information about your code",
            image_url: "https://picsum.photos/300/200?image=#{photo_ids.sample(random: Random.new)}",
            caption: "Valuable information about your code.",
          }
        end

        output_attrs = {
          title: "Report",
          summary: "Build info.\r\n",
          images: images,
          text: "Lots more info about the report \n\n and more data",
        }

        check_run.update(output_attrs)
        check_run
      end
    end
  end
end
