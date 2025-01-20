module ProseDiff

  def gem_name
    'prose_diff'
  end

  def semantic_version
    '0.3.2'
  end

  def output_version(cache = true)
    (cache && @output_version) || begin
      soft_version = Gem && Gem.loaded_specs[gem_name] && Gem.loaded_specs[gem_name].version.to_s
      soft_version ||= semantic_version
      match_data = /^(0\.|(?<major>\d+\.))(0\.|(?<minor>\d+\.))(?<step>\d+)(\.(?<fingerprint>.+))?$/.match(soft_version)
      @output_version = match_data['fingerprint'] || "#{match_data['major']}#{match_data['minor']}#{match_data['step']}"
    end
  end

  module_function :semantic_version, :output_version, :gem_name

end
