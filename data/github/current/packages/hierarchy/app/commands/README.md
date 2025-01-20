# Hierarchy Commands

This file aims to document the usage of the command pattern for hierarchy related code.

## Why?

Google "command pattern Ruby" for some more background context on this design pattern, but the idea is simple: as our code gets more complex we will want to present a uniform interface for interacting with hierarchy code while hiding complexity the caller does not need to know about. This is similar to what [Ousterhout](https://a.co/d/8iiIIAI) calls a "deep interface." In general, we want to be liberal in what we accept and strict in what we return.

In practice this means that callers have a clearly-defined API that we can adapt over time while getting a consistent interface in return.

## How?

Commands for Hierarchy will have a `#call` method and return a PORO (plain old Ruby object) representing the result, e.g.:

```ruby
class MyCommand
  # optionally you can add a class level method like so
  def self.call(arg1:, arg2:, dependencies: {})
    new(arg1: arg1, arg2: arg2, dependencies: dependencies).call
  end

  # Prefer named arguments and optionally a hash of dependencies
  #
  # Ideally the caller won't need the dependencies hash but it will make
  # dependency injection easier for testing. Basically any time you reference a
  # constant, like a class, it would ideally be injectable via the dependencies
  # hash.
  def initialize(arg1:, arg2:, dependencies: {})
  end

  def call
    Result.new(success: true)
  end
end

# An example Result class with a simple interface for working with the output
# of a command.
def Result
  attr_reader :message

  def initialize(success:, message: "")
    @success = success
    @message = message
  end

  def success?
    !!@success
  end
end
```

Commands can and should be composed of other operations, objects, even other commands.
