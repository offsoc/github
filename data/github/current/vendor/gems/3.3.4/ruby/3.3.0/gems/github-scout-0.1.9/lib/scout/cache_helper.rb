require 'zlib'
require 'tempfile'
require 'scout/version'

module Scout
  class CacheHelper

    LANGUAGE_CACHE_PATH = 'language-stats.cache'
    PROJECTS_CACHE_PATH = 'stacks-stats.cache'
    LANGUAGE_STATS_CACHE_VERSION = "v3:#{Linguist::VERSION}"
    PROJECTS_STATS_CACHE_VERSION = "v0:#{Scout::VERSION}"

    attr_accessor :git_dir

    def initialize(git_dir)
      @git_dir = git_dir
    end

    def load_stacks_map_from_cache
      version, oid, file_map = load(scout_cache_file)
      if version == PROJECTS_STATS_CACHE_VERSION && oid && file_map
        [file_map, oid]
      end
    end

    def load_languages_from_cache
      version, oid, file_map = load(linguist_cache_file)
      if version == LANGUAGE_STATS_CACHE_VERSION && oid && file_map
        [file_map, oid]
      end
    end

    def save_stacks_cache(commit_oid, result)
      cache = [PROJECTS_STATS_CACHE_VERSION, commit_oid, result]
      save(cache, scout_cache_file)
    end

    private

    def scout_cache_file
      File.join(git_dir, PROJECTS_CACHE_PATH)
    end

    def linguist_cache_file
      File.join(git_dir, LANGUAGE_CACHE_PATH)
    end

    def load(cache_file)
      marshal = File.open(cache_file, "rb") { |f| Zlib::Inflate.inflate(f.read) }
      Marshal.load(marshal)
    rescue SystemCallError, ::Zlib::DataError, ::Zlib::BufError, TypeError
      nil
    end

    def save(result, cache_file)
      Tempfile.open('cache_file', git_dir) do |f|
        marshal = Marshal.dump(result)
        f.write(Zlib::Deflate.deflate(marshal))
        f.close
        File.rename(f.path, cache_file)
      end

      FileUtils.chmod 0644, cache_file
    end
  end
end
