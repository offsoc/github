# This file exists so that the unhandled exception hook may easily be injected
# into programs that don't register it themselves. It also provides a
# lightweight failbot interface that doesn't bring in any other libraries until
# a report is made, which is useful for environments where boot time is
# important.
#
# To use, set RUBYOPT or pass an -r argument to ruby:
#
#   RUBYOPT=rfailbot/exit_hook some-program.rb
#
# Or:
#
#   ruby -rfailbot/exit_hook some-program.rb
#
# Your program can also require this library instead of 'failbot' to minimize
# the amount of up-front processing required and automatically install the exit
# hook.
#
#   require 'failbot/exit_hook'
#
# The 'failbot' lib is loaded in full the first time an actual report is made.
module Failbot
  # Config hash sent to setup method. We store this off so we have it when we
  # need to actually load stuff.
  @delayed_settings = nil
  @delayed_default_context = nil

  # Have we loaded the whole failbot lib yet?
  @failbot_loaded = false if !defined?(@failbot_loaded)

  # Has the unhandled exception hook been installed yet?
  @unhandled_exception_hook_installed = false

  # Should we automatically install the exit hook? This is true when this
  # library is required directly, false when the main 'failbot' library is
  # required directly.
  @auto_install_hook = true if !defined?(@auto_install_hook)

  # Installs an at_exit hook to report exceptions that raise all the way out of
  # the stack and halt the interpreter. This is useful for catching boot time
  # errors as well and even signal kills.
  #
  # To use, call this method very early during the program's boot to cover as
  # much code as possible:
  #
  #   require 'failbot'
  #   Failbot.install_unhandled_exception_hook!
  #
  # Returns true when the hook was installed, nil when the hook had previously
  # been installed by another component.
  def install_unhandled_exception_hook!
    # only install the hook once, even when called from multiple locations
    return if @unhandled_exception_hook_installed

    # the $! is set when the interpreter is exiting due to an exception
    at_exit do
      boom = $!
      if boom && !@raise_errors && !boom.is_a?(SystemExit)
        report(boom, 'argv' => ([$0]+ARGV).join(" "), 'halting' => true)
      end
    end

    @unhandled_exception_hook_installed = true
  end

  # Shim into Failbot.setup and store config information off for the first time
  # a real method is invoked.
  def setup(settings = {}, default_context = {}, &block)
    @delayed_settings = settings.dup
    @delayed_default_context = default_context.dup
    @block = block
  end

  # Tap into any other method invocation on the Failbot module (especially report)
  # and lazy load and configure everything the first time.
  def method_missing(method, *args, &block)
    return super if @failbot_loaded
    require 'failbot'
    send(method, *args, &block)
  end

  extend self

  # If failbot/exit_hook was required directly, without the main lib, install
  # the exit hook automatically.
  install_unhandled_exception_hook! if @auto_install_hook
end
