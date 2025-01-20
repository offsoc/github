require 'active_support'
require 'active_support/inflector'
require 'active_support/hash_with_indifferent_access'
require 'active_support/core_ext'

class Zuorest::Model::Base
  attr_reader :body

  def self.zuora_rest_namespace(namespace = nil, delete: false, reformatter: nil)
    if namespace
      namespace += "/" unless namespace.end_with? "/"
      @zuora_rest_namespace = namespace
    end
    if delete
      delete = namespace if delete == true
      delete += "/" unless delete.end_with? "/"
      @zuora_delete_namespace = delete
    end

    if reformatter
      @rest_namespace_reformatter = reformatter
    end

    @zuora_rest_namespace
  end

  def self.zuora_delete_namespace
    return @zuora_delete_namespace
  end

  def self.path_for_id(id)
    raise "zuora_rest_namespace has not been declared for #{self}" unless @zuora_rest_namespace
    @zuora_rest_namespace + id.to_s
  end

  def self.zuora_rest_client
    @@zuora_rest_client
  end

  def self.zuora_rest_client=(zuora_rest_client)
    @@zuora_rest_client = zuora_rest_client
  end

  def self.get(id)
    zuora_rest_client.get path_for_id(id)
  end

  def self.find(id)
    data = get(id)
    if defined?(@rest_namespace_reformatter) && @rest_namespace_reformatter
      data = self.send(@rest_namespace_reformatter, data)
    end
    new(data)
  end

  def self.class_name_for_name(name, plural: true)
    camelized_name = name.to_s.camelize(:upper)
    camelized_name = camelized_name.singularize if plural
    "Zuorest::Model::" + camelized_name
  end

  # contains_many defines a method that returns an array
  # of objects based on an array of hashes in this object's body
  #
  # name - name of the method to create
  # key - key of this objects body that contains the array of hashes
  # class_name - the class that the hash will be passed to
  #              defaults to a guess based on `name`
  def self.contains_many(name, class_name: nil, key: nil)
    class_name ||= class_name_for_name(name)
    key ||= name.to_s.camelize(:lower)

    define_method(name) do
      klass = class_name.to_s.constantize

      self[key].map do |item|
        klass.new(item)
      end
    end
  end

  # has_many defines a method that searches for objects of another class
  # using this object's id as a key
  #
  # name - name of the method to create
  # result_key - key of this objects body that contains the array of hashes
  #              defaults to a camelCased version of name
  # class_name - the class that the hash will be passed to,
  #              defaults to a guess based on `name`
  def self.has_many(name, rest_namespace:, class_name: nil, result_key: nil)
    class_name ||= class_name_for_name(name)
    result_key ||= name.to_s.camelcase(:lower)
    rest_namespace += "/" unless rest_namespace.end_with? "/"

    define_method(name) do
      return [] unless id

      klass = class_name.to_s.constantize

      result = self.class.zuora_rest_client.get(rest_namespace + id).with_indifferent_access
      fail Zuorest::UnsuccessfulResponseError.new(result["reasons"]) unless result["success"]
      records = result[result_key]
      records.map do |item|
        klass.new(item)
      end
    end
  end

  # has_many defines a method that finds an object of another class
  # using a value in this object as the id
  #
  # name - name of the method to create
  # key - key of this objects body that contains the id
  #       defaults to a camelCased version of name + "Id"
  # class_name - the class that find will be called on,
  #              defaults to a guess based on `name`
  def self.belongs_to(name, class_name: nil, key: nil)
    class_name ||= class_name_for_name(name, plural: false)
    key ||= name.to_s.camelcase(:lower) + "Id"

    define_method(name) do
      class_name.to_s.constantize.find(self[key])
    end
  end

  # find_by defines a method that searches for instances of this object
  # using an alternate REST namespace
  #
  # name - method will be created as find_by_{name}
  # rest_namespace - URL prefix for the REST request
  # result_key - the key of the response hash that contains the array of results
  #              defaults to a guess based upon our class name
  def self.find_by(name, rest_namespace:, result_key: nil)
    result_key ||= self.to_s.sub(/Zuora::/,"").camelcase(:lower).pluralize
    rest_namespace += "/" unless rest_namespace.end_with? "/"

    define_singleton_method("find_by_#{name}") do |value|
      result = zuora_rest_client.get(rest_namespace + value.to_s).with_indifferent_access
      (result[result_key] || []).map do |record|
        new(record)
      end
    end
  end

  def initialize(body)
    @body = body.with_indifferent_access
  end

  def id
    body[:id] \
    || body[:Id] \
    || (body.has_key?(:basicInfo) && body[:basicInfo][:id])
  end

  def reload!
    @body = self.class.get(id).with_indifferent_access
  end

  def [](key)
    body[key]
  end

  # Updates the Zuora object with attributes specified in the attrs hash.
  #
  # Returns response from the Zuora API.
  def update!(attrs)
    attrs.merge! Id: id
    self.class.zuora_rest_client.post('v1/action/update', body: { type: self.class.name.demodulize, objects: [attrs] })
  end

  def delete
    raise "you must pass `delete: true` to zuora_rest_namespace to enable the DELETE action" unless self.class.zuora_delete_namespace

    url = self.class.zuora_delete_namespace + self.id
    self.class.zuora_rest_client.delete(url)
  end
end
