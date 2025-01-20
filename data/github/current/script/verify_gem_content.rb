# typed: true
# frozen_string_literal: true

# Usage:
# ./bin/safe-ruby ./script/verify_gem_content.rb <path_to_.gem> <git url> [tag]

# Function:
# Compares the contents of the .gem file we have vendored to the contents of the tag for that gem on GitHub.
# If this tool finds no differences it is more likely that the gem is the one that

require "zlib"
require "stringio"
require "fileutils"
require "open3"
require "yaml"

INFORMATION_CORRECTIONS = {}

SKIPS = [
  "actionmailer",
  "actionpack",
  "actionview",
  "activejob",
  "activerecord-trilogy-adapter", # no v2.0.0 badge
  "addressable",
  "aleph-client",
  "aqueduct-client",
  "arca", # this gem provides no tags
  "ast", # Fixable, doesn't include git url
  "aws-eventstream", # git source: https://github.com/aws/aws-sdk-ruby/tree/master/gems/aws-eventstream not sure how to handle this
  "aws-partitions", #  https://github.com/aws/aws-sdk-ruby/tree/master/gems/aws-partitions
  "aws-sdk-core", # https://github.com/aws/aws-sdk-ruby/tree/master/gems/aws-sdk-core
  "aws-sdk-s3", # https://github.com/aws/aws-sdk-ruby/tree/master/gems/aws-sdk-s3
  "aws-sigv4", # https://github.com/aws/aws-sdk-ruby/tree/master/gems/aws-sigv4
  "azure-storage-blob", # tags have file, queue and table at the end and I don't know which one is right
  "azure-storage-common", # https://github.com/azure/azure-storage-ruby probs same as above
  "azure_key_vault", # https://github.com/Azure/azure-sdk-for-ruby/tree/master/data/azure_key_vault
  "backport",
  "badge-ruler", # these tags are unprefixed i.e. 0.0.2 fixable, but not now git@github.com:github/badge-ruler.git
  "bertrpc", # unusual revision style github10 https://github.com/github/bertrpc
  "braintree", # no tag
  "builder", # no git source
  "cbor", # no git source
  "chatterbox-client", # no git source
  "codeowners", # no git source
  "coderay", # no git source
  "concurrent-ruby-ext", # no git source
  "creole", # no tag https://github.com/minad/creole
  "cvss-suite", # no git source
  "debugger-ruby_core_source", # 1.3.8 is the only unprefixed tag
  "declarative",
  "descendants_tracker",
  "diet_earthsmoke", # no git source
  "dnsruby",
  "docile", # no git source
  "dogapi", # no git source
  "domain_name", # tag is unprefixed
  "duo_api", # no tag
  "e2mmap", # no tag
  "erblint-github", # not sure how to handle this one clearly patched, but also not updated git source
  "erubi", # no git source
  "escape_utils", # no tag
  "eventmachine", # no git source
  "excon", # no git source
  "failbot", # git source: https://github.com/github/failbot#readme
  "fast_blank", # no tag
  "ffi",
  "ffi-compiler", # git source: https://wiki.github.com/ffi/ffi
  "geoip2_compat", # no tag
  "gettext", # no git source
  "github-proto-octocat", #  checkout failed
  "github_chatops_extensions", # no git source
  "google-api-client", # no tag
  "google-apis-core", # no tag
  "google-apis-discovery_v1", # no tag
  "google-apis-generator", # I forget
  "google-protobuf", # no sha
  "googleapis-common-protos-types", # no tag
  "googleauth",
  "gpgme",
  "grpc",
  "hashery",
  "homograph-detector",
  "htmlentities",
  "http-parser",
  "ice_nine",
  "json",
  "json-schema",
  "kramdown-parser-gfm",
  "levenshtein-ffi",
  "licensed",
  "locale",
  "mail",
  "memcached",
  "mono_logger",
  "monolith-twirp-actions-core",
  "monolith-twirp-auditlog-streaming",
  "monolith-twirp-billing-accounts",
  "monolith-twirp-classroom-assignment_reuse",
  "monolith-twirp-classroom-classroom_codespaces",
  "monolith-twirp-classroom-classroom_repositories",
  "monolith-twirp-classroom-integration",
  "monolith-twirp-classroom-repositories",
  "monolith-twirp-classroom-sync_classroom",
  "monolith-twirp-classroom-users",
  "monolith-twirp-conduit-feeds",
  "monolith-twirp-education_web-repos",
  "monolith-twirp-education_web-users",
  "monolith-twirp-examples-octocat",
  "monolith-twirp-insights-core",
  "monolith-twirp-insights-sql",
  "monolith-twirp-mailreplies-replies",
  "monolith-twirp-merge-queue-go-mergequeuemonolith",
  "monolith-twirp-merge-queue-go-mergequeueservice",
  "monolith-twirp-notifications-notifyd",
  "monolith-twirp-octoshift-imports",
  "monolith-twirp-octoshift-migrations",
  "monolith-twirp-packageregistry-auditlog",
  "monolith-twirp-pages-pagesdeployerapi",
  "monolith-twirp-spokesd-core",
  "monolith-twirp-support-helphub",
  "ms_rest",
  "ms_rest_azure",
  "net-smtp",
  "oa-core",
  "oa-enterprise",
  "octolytics",
  "open4",
  "opentelemetry-api",
  "opentelemetry-common",
  "opentelemetry-exporter-otlp",
  "opentelemetry-instrumentation-action_pack",
  "opentelemetry-instrumentation-action_view",
  "opentelemetry-instrumentation-active_record",
  "opentelemetry-instrumentation-active_support",
  "opentelemetry-instrumentation-base",
  "opentelemetry-instrumentation-faraday",
  "opentelemetry-instrumentation-graphql",
  "opentelemetry-instrumentation-net_http",
  "opentelemetry-instrumentation-rack",
  "opentelemetry-instrumentation-trilogy",
  "opentelemetry-registry",
  "opentelemetry-sdk",
  "opentelemetry-semantic_conventions",
  "org-ruby",
  "os",
  "pathspec",
  "prawn-table",
  "proto-dependency-graph-api",
  "pyu-ruby-sasl",
  "rack",
  "rblineprof",
  "redcloth", # missing a git source (can be added to corrections)
  "retriable",
  "rollup",
  "ruby-progressbar",
  "ruby-xxHash",
  "rugged",
  "safe_yaml",
  "selenium-webdriver",
  "service-catalog-client",
  "signet",
  "simple_uuid",
  "simplecov_json_formatter",
  "sorbet",
  "sorbet-runtime",
  "sorbet-static",
  "sorbet-static-and-runtime",
  "ssh_data",
  "sshkey",
  "statsd-ruby",
  "syntax_suggest",
  "terminal-table",
  "toml",
  "treelights-client",
  "trilogy",
  "twilio-ruby",
  "websocket-driver",
  "websocket-extensions",
  "wikicloth",
  "xpath",
  "yajl-ruby"
]

module DotGemVerifier
  class Error < StandardError; end

  def self.verify(dot_gem_path, git_source, git_tag)
    v = Verifier.new(dot_gem_path, git_source, git_tag)
    if v.trackable?
      v.verify
    end
  end

  class Verifier
    def initialize(dot_gem_path, git_source, git_tag)
      @dot_gem_path = dot_gem_path

      Dir.mktmpdir do |dir|
        unpack_metadata(dir)
      end

      @git_source = git_source || guess_git_source
      @git_tag = git_tag || guess_tag
    end

    def trackable?
      if @dot_gem_path && @git_source && @git_tag && !SKIPS.find { |s| gem_base_name.start_with?(s + "-") } && !@git_source.include?("rails")
        true
      else
        false
      end
    end

    def verify
      print "#{gem_base_name}: "

      Dir.mktmpdir do |dir|
        unpack_gem(dir)
        get_tag_code(dir)
        compare(dir)
      end
      puts
    end

    def gem_base_name
      File.basename(@dot_gem_path, ".gem")
    end

    private

    def unpack_metadata(dir)
      `gem unpack --spec #{@dot_gem_path} --target=#{dir}`
      @metadata = YAML.unsafe_load_file(File.join(dir, gem_base_name + ".gemspec"))
    end

    def unpack_gem(dir)
      `gem unpack #{@dot_gem_path} --target=#{dir}`
    end

    def guess_git_source
      if INFORMATION_CORRECTIONS.dig(gem_base_name, :source)
        INFORMATION_CORRECTIONS.dig(gem_base_name, :source)
      elsif @metadata.metadata && @metadata.metadata["source_code_uri"]
        @metadata.metadata["source_code_uri"]
      elsif URI.parse(@metadata.homepage.to_s).host == "github.com"
        @metadata.homepage
      end
    end

    def get_tag_code(dir)
      if URI.parse(@git_source).host == "github.com"
        # http github link
        match = @git_source.match(/github\.com\/([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)/)

        ssh_git_link = "git@github.com:#{match[1]}/#{match[2]}.git"
      else
        ssh_git_link = @git_source
      end

      if @git_tag.split(".").last.size > 5 # ends like v7.1.0.alpha.d6973d50d0
        clone_command = "git clone #{ssh_git_link} #{dir}/git-copy"
        checkout_command = "(cd #{dir}/git-copy; git checkout #{@git_tag.split(".").last[1...]})"

        stdout, stderr, status = Open3.capture3(clone_command)
        if status != 0
          puts "CLONING FAILED #{gem_base_name}"
          puts clone_command
          puts stdout
          puts stderr
        end



        stdout, stderr, status = Open3.capture3(checkout_command)
        if status != 0
          puts checkout_command.inspect
          puts stdout
          puts stderr
          puts "checkout FAILED #{gem_base_name}"
        end
      else
        clone_command = "git clone --depth 1 --branch #{@git_tag} #{ssh_git_link} #{dir}/git-copy"



        stdout, stderr, status = Open3.capture3(clone_command)
        if status != 0
          puts clone_command.inspect
          puts stdout
          puts stderr
          puts "CLONING FAILED #{gem_base_name}"
        end
      end
    end

    # compare only compares files that exist in the unpacked gem
    # This prevents false positives on files that are changed, but not included in the gem release
    def compare(dir)
      dot_gem_files = Dir["#{dir}/#{gem_base_name}/**/*.rb"]

      dot_gem_files.each do |file|
        matching_copy = file.gsub(gem_base_name, "git-copy")
        rel_path = file.gsub("#{dir}/#{gem_base_name}/", "")
        stdout, stderr, status = Open3.capture3("diff #{file} #{matching_copy}")

        if stdout.size > 0
          puts "file #{file} DID NOT MATCH!"
          puts stdout
        else
          print "."
        end
      end
    end

    def guess_tag
      if INFORMATION_CORRECTIONS.dig(gem_base_name, :tag)
        INFORMATION_CORRECTIONS.dig(gem_base_name, :tag)
      else
        "v" + T.must(File.basename(@dot_gem_path).match(/-([\w\.]+)\.gem/))[1].to_s
      end
    end
  end
end


gem_file = ARGV[0]
git_source = ARGV[1]
git_tag = ARGV[2]

if gem_file.nil?
  puts "Please pass either a directory of .gem files, or the path to a specific .gem file"
  exit
end

if File.directory?(gem_file)
  Dir["#{gem_file}/*.gem"].each do |dot_gem|
    v = DotGemVerifier.verify(dot_gem, nil, nil)
  end
else
  DotGemVerifier.verify(gem_file, git_source, git_tag)
end
