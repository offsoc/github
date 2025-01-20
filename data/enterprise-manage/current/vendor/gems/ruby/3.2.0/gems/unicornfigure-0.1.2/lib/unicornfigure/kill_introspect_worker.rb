# When unicorn kills a worker process due to exceeding the timeout, we want to
# get a backtrace of what the worker was doing. Send a kill -USR2 and wait a bit
# before killing with -KILL. The worker process traps the USR2, dumps the
# backtrace to stderr, and reports to haystack.

require 'timeout'
require 'failbot'
require 'failbot/middleware'

# Tap into the master's kill logic
module Unicorn
  class HttpServer
    def self.enable_kill_introspect_worker!
      alias_method :kill_worker_without_introspect, :kill_worker
      alias_method :kill_worker, :kill_worker_with_introspect
    end

    def kill_worker_with_introspect(signal, wpid)
      if signal == :KILL
        signal_worker_introspect(wpid)
      end
      kill_worker_without_introspect(signal, wpid)
    end

    def signal_worker_introspect(wpid)
      Process.kill(:USR2, wpid)
      sleep 0.5
    end
  end

  class WorkerTimeout < Timeout::Error
    attr_accessor :backtrace
  end

  # This must be called in the config/unicorn.rb after_fork hook to setup the
  # signal handling in the worker.
  def self.trap_introspect_signal
    trap 'USR2' do
      # dump backtrace to stderr
      warn "== worker [#$$] USR2 received. dumping backtrace."
      warn caller.join("\n")
      warn "=="

      # send exception to failbot
      boom = WorkerTimeout.new('unicorn worker killed for taking too long')
      boom.backtrace = caller.dup
      Failbot::Rescuer.report(boom, Unicornfigure::RecordRackEnvironment.last_env)
    end
  end
end

# Middleware that records the last rack env hash so that the introspect trap can
# report it to failbot.
module Unicornfigure
  class RecordRackEnvironment < Struct.new(:app)
    class <<self; attr_accessor :last_env; end

    def call(env)
      self.class.last_env = env
      app.call(env)
    end
  end
end
