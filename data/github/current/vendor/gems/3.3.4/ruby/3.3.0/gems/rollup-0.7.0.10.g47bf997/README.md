# Rollup

![fruit rollup](http://i.imgur.com/s6INA6o.jpg)

Yeah, it's something like that.

Rollup takes an exception and generates a unique identifier, based on the exception's name and backtrace.

## Installation

Add this line to your application's Gemfile:

```ruby
gem 'rollup'
```

And then execute:

    $ bundle

Or install it yourself as:

    $ gem install rollup

## Usage

Rollup uses an exception instance. For example:

```ruby
# using the output of a Minitest test
Rollup.generate(result.failure.error) #=> "57762aeced845d4a13d48eb3519b75b2"
```

## Development

1. Clone this repo
2. Run `script/boostrap`
3. Ensure tests are passing via `bin/rake test`
