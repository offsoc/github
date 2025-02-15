# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `progeny` gem.
# Please instead update this file by running `bin/tapioca gem progeny`.

module Progeny; end

class Progeny::Command
  # Spawn a new process, write all input and read all output, and wait for
  # the program to exit. Supports the standard spawn interface:
  #   new([env], command, [argv1, ...], [options])
  #
  # The following options are supported in addition to the standard
  # Process.spawn options:
  #
  #   :input   => str      Write str to the new process's standard input.
  #   :timeout => int      Maximum number of seconds to allow the process
  #                        to execute before aborting with a TimeoutExceeded
  #                        exception.
  #   :max     => total    Maximum number of bytes of output to allow the
  #                        process to generate before aborting with a
  #                        MaximumOutputExceeded exception.
  #   :pgroup_kill => bool Boolean specifying whether to kill the process
  #                        group (true) or individual process (false, default).
  #                        Setting this option true implies :pgroup => true.
  #
  # Returns a new Command instance whose underlying process has already
  # executed to completion. The out, err, and status attributes are
  # immediately available.
  #
  # @return [Command] a new instance of Command
  #
  # source://progeny//lib/progeny/command.rb#74
  def initialize(*args); end

  # All data written to the child process's stderr stream as a String.
  #
  # source://progeny//lib/progeny/command.rb#164
  def err; end

  # Execute command, write input, and read output. This is called
  # immediately when a new instance of this object is created, or
  # can be called explicitly when creating the Command via `build`.
  #
  # source://progeny//lib/progeny/command.rb#185
  def exec!; end

  # All data written to the child process's stdin stream as a String.
  #
  # source://progeny//lib/progeny/command.rb#158
  def input; end

  # All data written to the child process's stdout stream as a String.
  #
  # source://progeny//lib/progeny/command.rb#161
  def out; end

  # The pid of the spawned child process. This is unlikely to be a valid
  # current pid since Command#exec! doesn't return until the process finishes
  # and is reaped.
  #
  # source://progeny//lib/progeny/command.rb#175
  def pid; end

  # Total command execution time (wall-clock time)
  #
  # source://progeny//lib/progeny/command.rb#170
  def runtime; end

  # A Process::Status object with information on how the child exited.
  #
  # source://progeny//lib/progeny/command.rb#167
  def status; end

  # Determine if the process did exit with a zero exit status.
  #
  # @return [Boolean]
  #
  # source://progeny//lib/progeny/command.rb#178
  def success?; end

  private

  # Start a select loop writing any input on the child's stdin and reading
  # any output from the child's stdout or stderr.
  #
  # input   - String input to write on stdin. May be nil.
  # stdin   - The write side IO object for the child's stdin stream.
  # stdout  - The read side IO object for the child's stdout stream.
  # stderr  - The read side IO object for the child's stderr stream.
  # timeout - An optional Numeric specifying the total number of seconds
  #           the read/write operations should occur for.
  #
  # Returns an [out, err] tuple where both elements are strings with all
  #   data written to the stdout and stderr streams, respectively.
  # Raises TimeoutExceeded when all data has not been read / written within
  #   the duration specified in the timeout argument.
  # Raises MaximumOutputExceeded when the total number of bytes output
  #   exceeds the amount specified by the max argument.
  #
  # source://progeny//lib/progeny/command.rb#230
  def read_and_write(input, stdin, stdout, stderr, timeout = T.unsafe(nil), max = T.unsafe(nil)); end

  # Wait for the child process to exit
  #
  # Returns the Process::Status object obtained by reaping the process.
  #
  # source://progeny//lib/progeny/command.rb#309
  def waitpid(pid); end

  class << self
    # Set up a new process to spawn, but do not actually spawn it.
    #
    # Invoke this just like the normal constructor to set up a process
    # to be run.  Call `exec!` to actually run the child process, send
    # the input, read the output, and wait for completion.  Use this
    # alternative way of constructing a Progency::Command if you want
    # to read any partial output from the child process even after an
    # exception.
    #
    #   child = Progency::Command.build(... arguments ...)
    #   child.exec!
    #
    # The arguments are the same as the regular constructor.
    #
    # Returns a new Command instance but does not run the underlying process.
    #
    # source://progeny//lib/progeny/command.rb#115
    def build(*args); end

    # Spawn a child process with all standard IO streams piped in and out of
    # the spawning process. Supports the standard `Process.spawn` interface.
    #
    # Returns a [pid, stdin, stdout, stderr] tuple, where pid is the new
    # process's pid, stdin is a writeable IO object, and stdout / stderr are
    # readable IO objects. The caller should take care to close all IO objects
    # when finished and the child process's status must be collected by a call
    # to Process::waitpid or equivalent.
    #
    # source://progeny//lib/progeny/command.rb#133
    def spawn_with_pipes(*argv); end
  end
end

# Maximum buffer size for reading
#
# source://progeny//lib/progeny/command.rb#212
Progeny::Command::BUFSIZE = T.let(T.unsafe(nil), Integer)

# Exception raised when the total number of bytes output on the command's
# stderr and stdout streams exceeds the maximum output size (:max option).
class Progeny::MaximumOutputExceeded < ::StandardError; end

# Exception raised when timeout is exceeded.
class Progeny::TimeoutExceeded < ::StandardError; end

# source://progeny//lib/progeny/version.rb#2
Progeny::VERSION = T.let(T.unsafe(nil), String)
