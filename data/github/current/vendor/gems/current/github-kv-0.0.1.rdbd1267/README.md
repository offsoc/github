# GitHub::KV

`GitHub::KV` is a key/value data store backed by MySQL.

## Installation

Add this line to your application's Gemfile:

```ruby
gem 'github-kv'
```

And then execute:

    $ bundle

Or install it yourself as:

    $ gem install github-kv

## Usage

First, you'll need to create the `key_values` table using the included Rails migration generator.

``` sh
rails generate github:kv:active_record
rails db:migrate
```

If you need to change the name of the table used for storing the key-values, you
can configure your table name as such:

``` sh
rails generate github:kv:active_record --table_name custom_key_values
rails db:migrate
```

``` ruby
GitHub::KV.configure do |config|
  config.table_name = "custom_key_values"
end
```

Once you have created and executed the migration, KV can do neat things like this:

```ruby
require "pp"

# Create new instance using ActiveRecord's default connection.
kv = GitHub::KV.new { ActiveRecord::Base.connection }

# Get a key.
pp kv.get("foo")
#<GitHub::KV::Result:0x3fd88cd3ea9c value: nil>

# Set a key.
kv.set("foo", "bar")
# nil

# Get the key again.
pp kv.get("foo")
#<GitHub::KV::Result:0x3fe810d06e4c value: "bar">

# Get multiple keys at once.
pp kv.mget(["foo", "bar"])
#<GitHub::KV::Result:0x3fccccd1b57c value: ["bar", nil]>

# Check for existence of a key.
pp kv.exists("foo")
#<GitHub::KV::Result:0x3fd4ae55ce8c value: true>

# Check for existence of key that does not exist.
pp kv.exists("bar")
#<GitHub::KV::Result:0x3fd4ae55c554 value: false>

# Check for existence of multiple keys at once.
pp kv.mexists(["foo", "bar"])
#<GitHub::KV::Result:0x3ff1e98e18e8 value: [true, false]>

# Set a key's value if the key does not already exist.
pp kv.setnx("foo", "bar")
# false

# Delete a key.
pp kv.del("bar")
# nil

# Delete multiple keys at once.
pp kv.mdel(["foo", "bar"])
# nil
```

Note that due to MySQL's default collation, KV keys are case-insensitive.

### Sharding support

If you are using KV with a sharded MySQL cluster, it can be useful to have more
control over which shard each row is stored in. To that end, KV supports an
optional additional shard key field:

``` sh
rails generate github:kv:active_record --shard_key user_id
rails db:migrate
```

``` ruby
GitHub::KV.configure do |config|
  config.shard_key_column = :user_id
end
```

Each KV instance is configured with a specific value for the specified shard
key field, and all data written or read by that instance will be scoped to that
shard key:

``` ruby
user_kv = GitHub::KV.new(shard_key_value: 1)
```

Note that keys can be reused across different shards.

## Caveats

### Expiration

KV supports expiring keys and obeys expiration when performing operations, but does not actually purge expired rows. At GitHub, we use [pt-archiver](https://www.percona.com/doc/percona-toolkit/2.1/pt-archiver.html) to nibble expired rows. We configure it to do a replica lag check and use the following options:

* **index_name**: `"index_key_values_on_expires_at"`
* **limit**: `1000`
* **where**: `"expires_at <= NOW()"`

## Development

After checking out the repo, run `script/bootstrap` to install dependencies. Then, run `script/test` to run the tests. You can also run `script/console` for an interactive prompt that will allow you to experiment.

**Note**: You will need a MySQL database with no password set for the root user for the tests. Running `docker-compose up` will boot just that. This functionality is not currently used by GitHub and was from a contributor, so please let us know if it does not work or gets out of date (pull request is best, but an issue will do).

To install this gem onto your local machine, run `script/install`. To release a new version, update the version number in `version.rb`, commit, and then run `script/release`, which will create a git tag for the version, push git commits and tags, and push the `.gem` file to [rubygems.org](https://rubygems.org).

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/github/github-ds. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](http://contributor-covenant.org) code of conduct. We recommend reading the [contributing guide](./CONTRIBUTING.md) as well.

## Roadmap

Nothing currently on our radar other than continued maintenance. Have a big idea? [Let us know](http://github.com/github/github-ds/issues/new).

* Q2 2023: <img src="https://github.com/codeminator.png?size=100" height=25 width=25> [@codeminator](https://github.com/codeminator)
* Q2 2023: <img src="https://github.com/nickh.png?size=100" height=25 width=25> [@nickh](https://github.com/nickh)
## Maintainers

| pic | @mention |
|---|---|
| ![@matthewd](https://github.com/matthewd.png?size=64) | [@matthewd](https://github.com/matthewd) |
| ![@codeminator](https://github.com/codeminator.png?size=64) | [@codeminator](https://github.com/codeminator) |

## License

The gem is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
