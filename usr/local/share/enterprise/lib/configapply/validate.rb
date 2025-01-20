# frozen_string_literal: true
require "net/http"
require "uri"
require "json"

module Enterprise
  module ConfigApply
    module Validate
      def validate_services
        # we need the node_id to be able to continue, therefore bail if we can't get it (which suggests Nomad isn't running)
        begin
          # the underlying ghe-nomad-node-id call is only made once (due to memoization)
          # so load it here to handle any exception
          Nomad.node_id
        rescue
          log "Unable to validate because the current node_id can't be determined"
          return false
        end
        log "Validating the following nomad services for node #{Nomad.node_id}"

        ecs = nil
        attributes = {
          "description" => "Getting details of the containers that are expected to be running"
        }
        trace_event("Enterprise::ConfigApply::Validate#expected_containers", attributes) do |span|
          begin
            ecs = expected_containers
            ecs.keys.sort.each { |job_name| log job_name.to_s }
          rescue ValidateError => e
            log "#{e}"
            return false
          rescue => e
            span.status = OpenTelemetry::Trace::Status.error(e.message)
            exit_status = e.respond_to?(:exit_status) ? e.exit_status : 1
            span.record_exception(e, attributes: { "exit_status" => exit_status })
            raise ConfigApplyException.new(e.message, exit_status: exit_status)
          end
        end # end trace_event expected_containers

        try_count = 1
        attributes = {
          "description" => "Getting details of the containers that are running"
        }
        trace_event("Enterprise::ConfigApply::Validate#running_containers", attributes) do |span|
          # we have to instantiate the LogPrinter here so we can pass in the Run object (which we use to call the "log" method)
          printer = LogPrinter.new(self)
          loop do
            log "Checking running containers attempt #{try_count} of #{validate_try_limit}"
            begin
              rcs = running_containers
              valid, reports = ContainerComparison.compare(ecs, rcs)
              reports.each { |report| report.print(printer) }
              if valid
                log "Validation succeeded - running containers for the nomad services on node #{Nomad.node_id} match expected containers"
                return true
              end
            rescue ValidateError => e
              log "#{e}"
            rescue => e
              span.status = OpenTelemetry::Trace::Status.error(e.message)
              exit_status = e.respond_to?(:exit_status) ? e.exit_status : 1
              span.record_exception(e, attributes: { "exit_status" => exit_status })
              raise ConfigApplyException.new(e.message, exit_status: exit_status)
            end

            break if try_count >= validate_try_limit
            try_count += 1

            sleep validate_try_sleep_duration
          end
        end # end trace_event running_containers

        log "Validation of running containers failed after #{try_count} attempts"
        false
      end

      def expected_containers
        Nomad.job_containers
      end

      def running_containers
        Docker.containers
      end

      def validate_try_limit
        default_retries = 10 # number of attempts
        setting = raw_config.dig("config-apply", "validate", "retry-limit")
        return default_retries if setting.nil?
        begin
          Integer(setting)
        rescue ArgumentError
          default_retries
        end
      end

      def validate_try_sleep_duration
        default_sleep_duration = 10 # sleep time in seconds
        setting = raw_config.dig("config-apply", "validate", "retry-sleep-duration")
        return default_sleep_duration if setting.nil?
        begin
          Integer(setting)
        rescue ArgumentError
          default_sleep_duration
        end
      end

      class LogPrinter
        def initialize(run)
          @run = run
        end

        def print(report)
          report.each_line { |line| @run.log line.chomp }
        end
      end

      class ContainerComparison
        ALLOC_ID_REGEX = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"

        class << self
          # Determines if running job/task containers match expected containers.
          #
          # @param jobs [Hash]
          # @param running_containers [Array]
          # @return [boolean, Array] A boolean specifying if containers are matching, and an array of ContainerComparison::Reports for further consumption (eg. logging).
          def compare(jobs, running_containers)
            reports = []
            valid = true

            jobs.each do |job_name, expected_containers|
              report = Report.new(job_name)

              expected_containers.each do |expected_container|
                report.add_task(expected_container, running_containers)
              end
              # Validation.call populates the (nomad job) report with the valid boolean, at Job and Task levels, and sets invalid_type
              reports << Validation.call(report)
              # if any report is not valid, then the entire batch is considered invalid
              valid = false if !reports.last.valid
            end

            return valid, reports
          end
        end

        class Report
          # Returns a NomadJobReport, which contains an array of Tasks, for example:
          # {
          #   "name": "actions-api-server",
          #   "valid": false,
          #   "invalid_type":
          #   "expected_container":  {"image_sha": "a6a50b14f5bd18f22868c67c9267590e4ad81927"},
          #   "running_containers": [
          #     {"image_sha": "a6a50b14f5bd18f22868c67c9267590e4ad81927"},
          #   ]
          # }
          Container = Struct.new(:image_sha)
          # expected_container is a Container struct, running_containers is an array of Container structs
          NomadTask = Struct.new(:name, :valid, :invalid_type, :expected_container, :running_containers)
          # tasks is an array of NomadTask structs
          NomadJobReport = Struct.new(:job, :valid, :tasks)

          COL_ONE_WIDTH = 28
          COL_TWO_WIDTH = 40

          attr_accessor :job_name, :tasks, :valid

          def initialize(job_name)
            @job_name = job_name
            @tasks = [] # to be filled by calling method
            @valid = nil
          end

          def add_task(expected_container, running_containers)
            task = NomadTask.new(expected_container[:name])
            task.expected_container = Container.new(expected_container[:image_sha])
            # running_containers is an array of all containers for the job, which we have to filter on the task name
            task.running_containers = running_containers_for_task(task.name, running_containers)
            @tasks << task
          end

          def running_containers_for_task(task_name, running_containers)
            task_running_containers = []
            regex = /^#{task_name}-#{ALLOC_ID_REGEX}$/
            running_containers.each do |running_container|
              if running_container[:name] =~ regex
                task_running_containers << Container.new(running_container[:image_sha])
              end
            end
            task_running_containers
          end

          # Would normally defined this with the LogPrinter as a default:
          # def print(printer = LogPrinter.new)
          # but in this case we have to instantiate the LogPrinter object in the main loop to get access to the Run object (see above)
          def print(printer)
            message = ""
            total_correct = tasks.count { |h| h.valid }
            total_incorrect = tasks.count { |h| !h.valid }
            total = total_correct + total_incorrect # total = tasks.count
            message += sprintf("The %s service has %d out of %d container tasks running correctly\n", @job_name, total_correct, total)
            message += sprintf("The %s service task%s: %s\n", @job_name, total > 1 ? "s" : "", tasks.map { |h| h[:name] }.join(", "))
            if !@valid
              @tasks.each_with_index do |task, i|
                case task.invalid_type
                when Validation::ZERO_RUNNING_CONTAINERS
                  message += invalid_print_template(task, total, i, "no running container")
                  message += sprintf("%-#{COL_ONE_WIDTH}s%#{COL_TWO_WIDTH}s\n", "Actual running image SHA:", "not running")
                when Validation::ONE_RUNNING_CONTAINER_WRONG_SHA
                  message += invalid_print_template(task, total, i, "1 running container with the wrong image SHA")
                  message += invalid_print_running_containers(task)
                when Validation::MULTIPLE_RUNNING_CONTAINERS_ALL_SHAS_CORRECT
                  message += invalid_print_template(task, total, i, "more than 1 running container with the correct image SHA")
                  message += invalid_print_running_containers(task)
                when Validation::MULTIPLE_RUNNING_CONTAINERS_ZERO_SHAS_CORRECT
                  message += invalid_print_template(task, total, i, "more than 1 running container with the wrong image SHA")
                  message += invalid_print_running_containers(task)
                when Validation::MULTIPLE_RUNNING_CONTAINERS_ONE_SHA_CORRECT
                  message += invalid_print_template(task, total, i, "1 running container with the correct image SHA and 1 or more running containers with the wrong image SHA")
                  message += invalid_print_running_containers(task)
                when nil # shouldn't need this
                end
              end
            end
            printer.print(message)
          end

          def invalid_print_template(task, total, i, error)
            template = ""
            template += sprintf("Task %d of %d: %s - %s\n", (i + 1), total, task.name, error)
            template += sprintf("%-#{COL_ONE_WIDTH}s%#{COL_TWO_WIDTH}s\n", "Expected image SHA:", task.expected_container.image_sha)
            template
          end

          def invalid_print_running_containers(task)
            template = ""
            task.running_containers.each do |rc|
              template += sprintf("%-#{COL_ONE_WIDTH}s%#{COL_TWO_WIDTH}s\n", "Actual running image SHA:", rc.image_sha)
            end
            template
          end

        end

        class Validation
          UNKNOWN_INVALID_TYPE                              = 0
          ZERO_RUNNING_CONTAINERS                           = 1
          ONE_RUNNING_CONTAINER_WRONG_SHA                   = 2
          MULTIPLE_RUNNING_CONTAINERS_ALL_SHAS_CORRECT      = 3
          MULTIPLE_RUNNING_CONTAINERS_ZERO_SHAS_CORRECT     = 4
          MULTIPLE_RUNNING_CONTAINERS_ONE_SHA_CORRECT       = 5
          MULTIPLE_RUNNING_CONTAINERS_CORRECT_AND_INCORRECT = 6

          attr_accessor :report

          def initialize(report)
            @report = report
          end

          def self.call(report)
            new(report).validate
          end

          # Determines if the provided container match counts is valid (that is, if the running container matches expected container).
          #
          # @return [ContainerComparison::Report] A ContainerComparison::Report.
          def validate
            report.tasks.each do |task|
              correct_count = 0
              incorrect_count = 0
              task.running_containers.each do |running_container|
                task.expected_container == running_container ? correct_count += 1 : incorrect_count += 1
              end
              task.valid, task.invalid_type = valid?(correct_count, incorrect_count)
              report.valid = false if !task.valid
            end
            # since @valid has a default of nil, we need to explicitly override it to true
            report.valid = true if report.valid.nil?
            report
          end

          def valid?(correct_match_count, incorrect_match_count)
            return true, nil if correct_match_count == 1 && incorrect_match_count == 0
            return false, invalid_type(correct_match_count, incorrect_match_count)
          end

          def invalid_type(correct_match_count, incorrect_match_count)
            if correct_match_count == 0
              if incorrect_match_count == 0
                return ZERO_RUNNING_CONTAINERS
              elsif incorrect_match_count == 1
                return ONE_RUNNING_CONTAINER_WRONG_SHA
              elsif incorrect_match_count > 1
                return MULTIPLE_RUNNING_CONTAINERS_ZERO_SHAS_CORRECT
              end
            end
            if correct_match_count == 1
              if incorrect_match_count > 0
                return MULTIPLE_RUNNING_CONTAINERS_ONE_SHA_CORRECT
              end
            end
            if correct_match_count > 1
              if incorrect_match_count == 0
                return MULTIPLE_RUNNING_CONTAINERS_ALL_SHAS_CORRECT
              elsif incorrect_match_count > 0
                return MULTIPLE_RUNNING_CONTAINERS_CORRECT_AND_INCORRECT
              end
            end
            return UNKNOWN_INVALID_TYPE
          end
        end
      end

      class Nomad
        class << self
          def node_id
            @node_id ||= self.exec_ghe_node_id
          end

          def exec_ghe_node_id
            `/usr/local/share/enterprise/ghe-nomad-node-id`.chomp
          # we can't proceed with the node_id, so if there's any exception, we have to bail
          rescue StandardError => e
            raise NomadError, "couldn't run the 'ghe-nomad-node-id' command: #{e}"
          end

          def job_containers
            new.jobs_with_tasks_for_node
          end
        end

        def jobs_with_tasks_for_node
          local_services = parse_node_allocs
          jobs_with_tasks.select { |k| local_services.include?(k.to_s) }
        end

        private
        # all jobs with tasks reported by "nomad job status"
        def jobs_with_tasks
          jobs.each_with_object({}) do |job, h|
            h["#{job}".to_sym] = parse_job_inspect(job)
          end
        end

        def jobs
          parse_job_statuses(exec_job_statuses)
        end

        def exec_job_statuses
          `nomad job status`
        rescue SystemCallError => e
          raise NomadError, "couldn't run the 'nomad job status' command: #{e}"
        end

        def exec_job_inspect(job)
          `nomad job inspect #{job}`
        rescue SystemCallError => e
          raise NomadError, "couldn't run the 'nomad job inspect #{job}' command: #{e}"
        end

        def exec_api_node_allocs(node_id)
          uri = URI("http://localhost:4646/v1/node/#{node_id}/allocations")
          response = Net::HTTP.get_response(uri)
        # rescue StandardError => e
        rescue Timeout::Error, Errno::EINVAL, Errno::ECONNRESET, EOFError, Net::HTTPBadResponse, Net::HTTPHeaderSyntaxError, Net::ProtocolError => e
          raise NomadAPIError, "Nomad API call against node #{node_id} failed: #{e}"
        else
          if !response.is_a?(Net::HTTPOK)
            raise NomadAPIError, "Nomad API call against node #{node_id} failed with response #{response}"
          end
          response.body
        end

        # Parses the "nomad job inspect" output into the job tasks.
        #
        # @param job [String] Nomad job name.
        # @return [Array] An Array of Hashes. A Hash contains the name and image_sha of each nomad job task.
        def parse_job_inspect(job)
          begin
            json = JSON.parse(exec_job_inspect(job))
          rescue JSON::ParserError
            raise NomadJSONError, "couldn't parse the JSON output from 'nomad job inspect #{job}'"
          end
          containers = []
          # check we're working with a valid Nomad job template (which is in json), by checking for:
          # at least 1 TaskGroup
          # at least 1 Task per TaskGroup
          # Task must have a Name field
          # Task must have a Config.image field
          tgs = json["Job"]["TaskGroups"]
          raise NomadInvalidError.new("Nomad job template contained no TaskGroups", job) if (tgs.nil? || tgs.empty?)
          tgs.each do |tg|
            tasks = tg["Tasks"]
            raise NomadInvalidError.new("Nomad job template contained no Tasks", job) if (tasks.nil? || tasks.empty?)
            tasks.each do |task|
              name = task.dig("Name")
              raise NomadInvalidError.new("Task Name field was missing from Nomad job template", job) if name.nil?
              if task.dig("Driver") == "docker"
                image_sha = task.dig("Config", "image")
                raise NomadInvalidError.new("Task Config.image field was missing from Nomad job template", job) if image_sha.nil?
                container = {
                  name: name,
                  image_sha: image_sha_from(image_sha),
                }
                containers << container
              end
            end
          end
          containers
        end

        # Parses the "nomad job status" output into the job names.
        #
        # @param nomad_cmd_output [String] Output from running "nomad job status".
        # @return [Array] An Array of strings, the names of each nomad job.
        def parse_job_statuses(nomad_cmd_output)
          lines = nomad_cmd_output.split("\n")
          lines.shift
          job_names = []
          lines.each do |line|
            cols = line.split(" ")
            raise NomadError, "'nomad job status' output is invalid: #{line}" if cols[1].nil?
            if !cols[1].match(/batch/) && !cols[3].match(/dead/)
              job_names << cols[0]
            end
          end
          job_names
        end

        # Parses the output from calling the nomad API node allocations endpoint.
        #
        # @return [Array] An Array of the names of each Nomad job on the current node.
        def parse_node_allocs
          begin
            json = JSON.parse(exec_api_node_allocs(Nomad.node_id))
          rescue JSON::ParserError
            raise NomadJSONError, "couldn't parse the JSON output returned from calling nomad node allocations API endpoint"
          end

          jobs = []
          json.each do |job|
            job_id = job["JobID"]
            raise NomadJSONError.new("Nomad node allocs JSON contains no JobID") if (job_id.nil? || job_id.empty?)
            jobs << job_id
          end
          jobs
        end

        def image_sha_from(config_image)
          config_image.split(":")[1]
        end
      end

      class Docker
        class << self
          def containers
            new.running_containers
          end
        end

        def running_containers
          running_containers = []
          container_names.each do |name|
            image_sha = parse_docker_inspect(name)
            running_containers << {name: name, image_sha: image_sha} unless image_sha.nil?
          end
          running_containers
        end

        private
        def container_names
          parse_docker_ps(exec_ps_names)
        end

        def exec_ps_names
          `docker ps --format {{.Names}}`
        rescue SystemCallError => e
          raise DockerError, "couldn't run the 'docker ps' command: #{e}"
        end

        def exec_inspect(name)
          `docker inspect #{name} 2>/dev/null` # Ignore docker inspect errors
        rescue SystemCallError => e
          raise DockerError, "couldn't run the 'docker inspect #{name}' command: #{e}"
        end

        def image_sha_from(config_image)
          config_image.split(":")[1]
        end

        # Parses the "docker inspect" output into the container names.
        #
        # @param container_name [String] Docker container name.
        # @return [String] An image sha.
        def parse_docker_inspect(container_name)
          begin
            json = JSON.parse(exec_inspect(container_name))
          rescue JSON::ParserError
            raise DockerJSONError, "couldn't parse the JSON output from 'docker inspect #{container_name}'"
          end
          # "docker inspect <container>" returns "[]" if container doesn't exist
          return nil if json[0].nil?
          image_sha = json[0].dig("Config", "Image")
          raise DockerInvalidError.new("Docker inspect JSON contained no config.image field", container_name) if image_sha.nil?
          image_sha_from(image_sha)
        end

        # Parses the "docker ps" output into the container names.
        #
        # @param docker_cmd_output [String] Output from running "docker ps".
        # @return [Array] An Array of strings, the names of each docker container.
        def parse_docker_ps(docker_cmd_output)
          docker_cmd_output.split("\n").sort
        end
      end

      class ValidateError < StandardError
        def initialize(msg)
          super("ERROR: #{msg}")
        end
      end
      class NomadError < ValidateError; end
      class DockerError < ValidateError; end
      class NomadJSONError < ValidateError; end
      class NomadAPIError < ValidateError; end
      class DockerJSONError < ValidateError; end
      class NomadInvalidError < ValidateError
        def initialize(msg, job)
          msg = "#{msg}\n"
          msg += "Please run 'nomad job inspect #{job}' to verify."
          super(msg)
        end
      end
      class DockerInvalidError < ValidateError
        def initialize(msg, container_name)
          msg = "#{msg}\n"
          msg += "Please run 'docker inspect #{container_name}' to verify."
          super(msg)
        end
      end
    end
  end
end
