require 'unicorn'
require 'unicornfigure/kill_introspect_worker'

module Unicornfigure

  module Configuration
    # The app is in enterprise mode when the rack/rails env is
    # production and the FI environment variable is set.
    def enterprise?
      env_variable_present?('FI') && production?
    end

    # RAILS_ENV or RACK_ENV is production.
    def production?
      app_env == 'production'
    end

    # RAILS_ENV or RACK_ENV is staging.
    def staging?
      app_env == 'staging'
    end

    # RAILS_ENV or RACK_ENV is development.
    def development?
      app_env == 'development'
    end

    # RAILS_ENV or RACK_ENV is test.
    def test?
      app_env == 'test'
    end

    # Low memory systems might need to run less workers.
    #
    # True if there is less than 2GB of system memory
    def low_memory?
      if proc_filesystem?
        system_memory < 2*(1024**2) # <2GB
      end
    end

    # The RAILS_ENV, RACK_ENV, or default app environment.
    def app_env
      case
      when env_variable_present?('RAILS_ENV') then ENV['RAILS_ENV']
      when env_variable_present?('RACK_ENV')  then ENV['RACK_ENV']
      else @default_app_env
      end
    end

    # The RAILS_ROOT, RACK_ROOT, or default app root.
    def app_root
      case
      when env_variable_present?('RAILS_ROOT') then ENV['RAILS_ROOT']
      when env_variable_present?('RACK_ROOT')  then ENV['RACK_ROOT']
      else @default_app_root
      end
    end

    # Sets the default app env.
    def default_app_env(env)
      @default_app_env = env
    end

    # Sets the default app root.
    def default_app_root(root)
      @default_app_root = root
    end

    # Enables REE's copy on write functionality.
    #
    # http://www.rubyenterpriseedition.com/faq.html#adapt_apps_for_cow
    def enable_ree_cow
      if GC.respond_to?(:copy_on_write_friendly=)
        GC.copy_on_write_friendly = true
      end
    end

    # Tails the development log and prints to stdout.
    def enable_log_tailer(logfile = "#{app_root}/log/development.log")
      if File.directory?(File.dirname(logfile))
        warn "config/unicorn.rb: tailing #{logfile}"
      else
        warn "config/unicorn.rb: cannot tail #{logfile}, directory does not exist"
        return
      end

      File.open(logfile, 'ab') { }

      # fork off a tail process on development.log. unicorn will reap this on clean
      # shutdown but not when there's a boot error so kill it on process exit.
      tailer = fork { exec "tail", "-n", "0", "-f", logfile }
      at_exit do
        begin
          Process.kill('KILL', tailer)
          Process.wait(tailer)
        rescue => boom
        end
      end

      # write stuff to console immediately
      $stderr.sync = true
      $stdout.sync = true
    end

    ##
    # When sent a USR2, Unicorn will suffix its pidfile with .oldbin and
    # immediately start loading up a new version of itself (loaded with a new
    # version of our app). When this new Unicorn is completely loaded
    # it will begin spawning workers. The first worker spawned will check to
    # see if an .oldbin pidfile exists. If so, this means we've just booted up
    # a new Unicorn and need to tell the old one that it can now die. To do so
    # we send it a QUIT.
    #
    # Using this method we get 0 downtime deploys.

    # wait until last worker boots to send QUIT signal
    def kill_replaced_worker(server, worker, old_pid = oldbin_pid)
      return if worker.nr != (server.worker_processes - 1)

      if File.exist?(old_pid) && server.pid != old_pid
        begin
          Process.kill("QUIT", File.read(old_pid).to_i)
        rescue Errno::ENOENT, Errno::ESRCH
          # someone else did our job for us
        end
      end
    end

    # When unicorn kills a worker process due to exceeding the timeout, we want to
    # get a backtrace of what the worker was doing. Send a kill -USR2 and wait a bit
    # before killing with -KILL. The worker process traps the USR2, dumps the
    # backtrace to stderr, and reports to haystack.
    def kill_introspect_worker
      Unicorn::HttpServer.enable_kill_introspect_worker!
    end

    # enterprise uses environment variables to inject customer configuration. When
    # the unicorn reloads due to a customer update, it needs to slurp up the latest
    # environment variables from the shared/env.d/*.sh files.
    def reload_enterprise_env
      if ENV.key?("ENTERPRISE_APP_INSTANCE")
        lines = %x{. #{ENV["ENTERPRISE_APP_INSTANCE"]}/.app-config/production.sh && env}.split("\n")
        enterprise_variables = lines.grep(/\A(ENTERPRISE|GH_|GITHUB)/).map {|l| l.split("=", 2) }

        enterprise_variables.each do |(key, value)|
          ENV[key] = value
        end
      end
    end

    ## Internal

    def env_variable_present?(variable)
      value = ENV[variable]

      !value.nil? && !value.empty?
    end

    def proc_filesystem?
      File.exist?('/proc/meminfo')
    end

    def system_memory
      File.read('/proc/meminfo').scan(/MemTotal:\s+(\d+)/).flatten.first.to_i
    end

    def oldbin_pid
      "#{app_root}/tmp/pids/unicorn.pid.oldbin"
    end

  end
end

class Unicorn::Configurator
  include Unicornfigure::Configuration
end
