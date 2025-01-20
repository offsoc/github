module Goomba
  class Sanitizer
    def initialize
      @protocol = {}
      @classes = {}
    end

    def self.from_hash(h)
      s = self.new
      s.allow_element (h[:elements] || []).reject { |e| e == "!DOCTYPE" }

      (h[:attributes] || {}).each do |element, attrs|
        s.allow_attribute element, attrs
      end

      (h[:protocols] || {}).each do |element, protocols|
        protocols.each do |attribute, pr|
          s.allow_protocol element, attribute, pr
        end
      end
      
      if h.include?(:remove_contents)
        s.remove_contents h[:remove_contents]
      end

      if h.include?(:whitespace_elements)
        s.wrap_with_whitespace h[:whitespace_elements]
      end

      s.allow_comments = h.fetch(:allow_comments, false)
      s.name_prefix = h.fetch(:name_prefix, nil)
      s
    end

    def self.define(&block)
      sanitizer = self.new
      sanitizer.instance_eval(&block)
      sanitizer
    end

    def allowed_elements
      element_flags.map { |k,v| k if (v & ALLOW) != 0 }.compact
    end

    def allow_element(*elements)
      elements.flatten.each { |e| set_flag e, ALLOW, true }
    end
    alias_method :allow, :allow_element

    def disallow_element(*elements)
      elements.flatten.each { |e| set_flag e, ALLOW, false }
    end
    alias_method :disallow, :disallow_element

    def allow_attribute(element, *attr)
      attr.flatten.each { |a| set_allowed_attribute element, a, true }
    end

    def require_any_attributes(element, *attr)
      if attr.empty?
        set_required_attribute element, '*', true
      else
        attr.flatten.each { |a| set_required_attribute element, a, true }
      end
    end

    def disallow_attribute(element, *attr)
      attr.flatten.each { |a| set_allowed_attribute element, a, false }
    end

    def allow_class(element, *klass)
      @classes = {} unless @classes
      @classes[element] = klass
      klass.flatten.each { |k| set_allowed_class element, k, true }
    end

    def allow_protocol(element, attr, protos)
      @protocol = {} unless @protocol
      @protocol[element] = {} unless @protocol.key?(element)
      @protocol[element][attr] = [] unless @protocol[element].key?(attr)
      @protocol[element][attr] = protos

      protos = [protos] unless protos.is_a?(Array)
      set_allowed_protocols element, attr, protos
    end

    def remove_contents(*elements)
      if elements.size == 1 && [true, false].include?(elements.first)
        set_all_flags REMOVE_CONTENTS, elements.first
      else
        elements.flatten.each { |e| set_flag e, REMOVE_CONTENTS, true }
      end
    end

    def wrap_with_whitespace(*elements)
      elements.flatten.each { |e| set_flag e, WRAP_WHITESPACE, true }
    end

    def allow_comments!
      self.allow_comments = true
    end

    def disallow_comments!
      self.allow_comments = false
    end

    def prefix_attribute_names(prefix)
      self.name_prefix = prefix
    end

    def to_h
      { 
        :allowed_classes => @classes.to_s,
        :allowed_protocols => @protocol.to_s,
        :element_flags => self.element_flags.to_s,
        :allowed_elements => self.allowed_elements.to_s,
        :allowed_attributes => self.allowed_attributes.to_s,
        :allow_comments => self.allowed_comments.to_s,
        :name_prefix => self.name_prefix.to_s,
        :limit_nesting => self.get_limit_nesting.to_s,
        :max_attribute_value_length => MAX_ATTR_VALUE_LENGTH
      }
    end
  end
end
