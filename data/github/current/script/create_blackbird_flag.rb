# typed: true
# frozen_string_literal: true
flag = FlipperFeature.find_by(name: "code_search_code_view")
feature = Feature.create(public_name: "New code search", slug: "code_search_code_view", flipper_feature: flag, feedback_link: "link", enrolled_by_default: true)
