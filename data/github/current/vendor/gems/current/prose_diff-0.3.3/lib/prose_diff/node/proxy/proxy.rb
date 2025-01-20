%w{base_behaviour can_only_correspond_to_the_same_tag_baheaviour levenshtein_distance_behaviour list_behaviour simple_text_container_behaviour span_behaviour splits_children_and_self_behaviour super_block_behaviour unsplittable_behaviour}.each do |path|
  require_relative(path)
end

%w{a article block blockquote body caption code del dd div dl dt em h img inline input ins li line ol opaque p pre span strong table td text tr ul unword word}.each do |path|
  require_relative(path)
end
