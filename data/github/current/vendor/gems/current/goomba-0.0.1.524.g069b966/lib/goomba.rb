require 'goomba.so'
require 'goomba/sanitizer'
require 'goomba/version'

module Goomba
  class Selector
    attr_reader :match_selector, :reject_selector

    Text = Selector.new(":text")
  end

  class Document
    attr_reader :__stats__

    def to_html(filters: nil)
      Serializer.new(self, filters).to_html
    end
  end

  class DocumentFragment
    def children
      @children ||= children!
    end

    attr_reader :__stats__

    def to_html(filters: nil)
      Serializer.new(self, filters).to_html
    end
  end

  class Node
    attr_reader :document

    def parent_is?(t)
      nth_ancestor_is? 1, t
    end

    def grandparent_is?(t)
      nth_ancestor_is? 2, t
    end
    
    def first_child?
      index_within_parent == 0
    end
  end

  class TextNode
    alias_method :text, :text_content
    alias_method :to_s, :to_html
    alias_method :html, :to_html
  end

  class CommentNode
    alias_method :text, :text_content
  end

  class ElementNode
    attr_reader :tag
    alias_method :name, :tag

    def children
      @children ||= children!
    end
  end
end
