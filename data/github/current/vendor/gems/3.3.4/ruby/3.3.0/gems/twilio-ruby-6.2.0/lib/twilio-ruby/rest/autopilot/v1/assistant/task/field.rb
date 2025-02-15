##
#    This code was generated by
#    ___ _ _ _ _ _    _ ____    ____ ____ _    ____ ____ _  _ ____ ____ ____ ___ __   __
#     |  | | | | |    | |  | __ |  | |__| | __ | __ |___ |\ | |___ |__/ |__|  | |  | |__/
#     |  |_|_| | |___ | |__|    |__| |  | |    |__] |___ | \| |___ |  \ |  |  | |__| |  \
#
#    Twilio - Autopilot
#    This is the public Twilio REST API.
#
#    NOTE: This class is auto generated by OpenAPI Generator.
#    https://openapi-generator.tech
#    Do not edit the class manually.
#


module Twilio
    module REST
        class Autopilot < AutopilotBase
            class V1 < Version
                class AssistantContext < InstanceContext
                class TaskContext < InstanceContext

                     class FieldList < ListResource
                    ##
                    # Initialize the FieldList
                    # @param [Version] version Version that contains the resource
                    # @return [FieldList] FieldList
                    def initialize(version, assistant_sid: nil, task_sid: nil)
                        super(version)
                        # Path Solution
                        @solution = { assistant_sid: assistant_sid, task_sid: task_sid }
                        @uri = "/Assistants/#{@solution[:assistant_sid]}/Tasks/#{@solution[:task_sid]}/Fields"
                        
                    end
                    ##
                    # Create the FieldInstance
                    # @param [String] field_type The Field Type of the new field. Can be: a [Built-in Field Type](https://www.twilio.com/docs/autopilot/built-in-field-types), the `unique_name`, or the `sid` of a custom Field Type.
                    # @param [String] unique_name An application-defined string that uniquely identifies the new resource. This value must be a unique string of no more than 64 characters. It can be used as an alternative to the `sid` in the URL path to address the resource.
                    # @return [FieldInstance] Created FieldInstance
                    def create(
                        field_type: nil, 
                        unique_name: nil
                    )

                        data = Twilio::Values.of({
                            'FieldType' => field_type,
                            'UniqueName' => unique_name,
                        })

                        payload = @version.create('POST', @uri, data: data)
                        FieldInstance.new(
                            @version,
                            payload,
                            assistant_sid: @solution[:assistant_sid],
                            task_sid: @solution[:task_sid],
                        )
                    end

                
                    ##
                    # Lists FieldInstance records from the API as a list.
                    # Unlike stream(), this operation is eager and will load `limit` records into
                    # memory before returning.
                    # @param [Integer] limit Upper limit for the number of records to return. stream()
                    #    guarantees to never return more than limit.  Default is no limit
                    # @param [Integer] page_size Number of records to fetch per request, when
                    #    not set will use the default value of 50 records.  If no page_size is defined
                    #    but a limit is defined, stream() will attempt to read the limit with the most
                    #    efficient page size, i.e. min(limit, 1000)
                    # @return [Array] Array of up to limit results
                    def list(limit: nil, page_size: nil)
                        self.stream(
                            limit: limit,
                            page_size: page_size
                        ).entries
                    end

                    ##
                    # Streams Instance records from the API as an Enumerable.
                    # This operation lazily loads records as efficiently as possible until the limit
                    # is reached.
                    # @param [Integer] limit Upper limit for the number of records to return. stream()
                    #    guarantees to never return more than limit.  Default is no limit
                    # @param [Integer] page_size Number of records to fetch per request, when
                    #    not set will use the default value of 50 records.  If no page_size is defined
                    #    but a limit is defined, stream() will attempt to read the limit with the most
                    #    efficient page size, i.e. min(limit, 1000)
                    # @return [Enumerable] Enumerable that will yield up to limit results
                    def stream(limit: nil, page_size: nil)
                        limits = @version.read_limits(limit, page_size)

                        page = self.page(
                            page_size: limits[:page_size], )

                        @version.stream(page, limit: limits[:limit], page_limit: limits[:page_limit])
                    end

                    ##
                    # When passed a block, yields FieldInstance records from the API.
                    # This operation lazily loads records as efficiently as possible until the limit
                    # is reached.
                    def each
                        limits = @version.read_limits

                        page = self.page(page_size: limits[:page_size], )

                        @version.stream(page,
                            limit: limits[:limit],
                            page_limit: limits[:page_limit]).each {|x| yield x}
                    end

                    ##
                    # Retrieve a single page of FieldInstance records from the API.
                    # Request is executed immediately.
                    # @param [String] page_token PageToken provided by the API
                    # @param [Integer] page_number Page Number, this value is simply for client state
                    # @param [Integer] page_size Number of records to return, defaults to 50
                    # @return [Page] Page of FieldInstance
                    def page(page_token: :unset, page_number: :unset, page_size: :unset)
                        params = Twilio::Values.of({
                            
                            'PageToken' => page_token,
                            'Page' => page_number,
                            'PageSize' => page_size,
                        })

                        response = @version.page('GET', @uri, params: params)

                        FieldPage.new(@version, response, @solution)
                    end

                    ##
                    # Retrieve a single page of FieldInstance records from the API.
                    # Request is executed immediately.
                    # @param [String] target_url API-generated URL for the requested results page
                    # @return [Page] Page of FieldInstance
                    def get_page(target_url)
                        response = @version.domain.request(
                            'GET',
                            target_url
                        )
                    FieldPage.new(@version, response, @solution)
                    end
                    


                    # Provide a user friendly representation
                    def to_s
                        '#<Twilio.Autopilot.V1.FieldList>'
                    end
                end


                ##
                #PLEASE NOTE that this class contains preview products that are subject to change. Use them with caution. If you currently do not have developer preview access, please contact help@twilio.com.
                class FieldContext < InstanceContext
                    ##
                    # Initialize the FieldContext
                    # @param [Version] version Version that contains the resource
                    # @param [String] assistant_sid The SID of the [Assistant](https://www.twilio.com/docs/autopilot/api/assistant) that is the parent of the Task associated with the resource to fetch.
                    # @param [String] task_sid The SID of the [Task](https://www.twilio.com/docs/autopilot/api/task) resource associated with the Field resource to fetch.
                    # @param [String] sid The Twilio-provided string that uniquely identifies the Field resource to fetch.
                    # @return [FieldContext] FieldContext
                    def initialize(version, assistant_sid, task_sid, sid)
                        super(version)

                        # Path Solution
                        @solution = { assistant_sid: assistant_sid, task_sid: task_sid, sid: sid,  }
                        @uri = "/Assistants/#{@solution[:assistant_sid]}/Tasks/#{@solution[:task_sid]}/Fields/#{@solution[:sid]}"

                        
                    end
                    ##
                    # Delete the FieldInstance
                    # @return [Boolean] True if delete succeeds, false otherwise
                    def delete

                        @version.delete('DELETE', @uri)
                    end

                    ##
                    # Fetch the FieldInstance
                    # @return [FieldInstance] Fetched FieldInstance
                    def fetch

                        payload = @version.fetch('GET', @uri)
                        FieldInstance.new(
                            @version,
                            payload,
                            assistant_sid: @solution[:assistant_sid],
                            task_sid: @solution[:task_sid],
                            sid: @solution[:sid],
                        )
                    end


                    ##
                    # Provide a user friendly representation
                    def to_s
                        context = @solution.map{|k, v| "#{k}: #{v}"}.join(',')
                        "#<Twilio.Autopilot.V1.FieldContext #{context}>"
                    end

                    ##
                    # Provide a detailed, user friendly representation
                    def inspect
                        context = @solution.map{|k, v| "#{k}: #{v}"}.join(',')
                        "#<Twilio.Autopilot.V1.FieldContext #{context}>"
                    end
                end

                class FieldPage < Page
                    ##
                    # Initialize the FieldPage
                    # @param [Version] version Version that contains the resource
                    # @param [Response] response Response from the API
                    # @param [Hash] solution Path solution for the resource
                    # @return [FieldPage] FieldPage
                    def initialize(version, response, solution)
                        super(version, response)

                        # Path Solution
                        @solution = solution
                    end

                    ##
                    # Build an instance of FieldInstance
                    # @param [Hash] payload Payload response from the API
                    # @return [FieldInstance] FieldInstance
                    def get_instance(payload)
                        FieldInstance.new(@version, payload, assistant_sid: @solution[:assistant_sid], task_sid: @solution[:task_sid])
                    end

                    ##
                    # Provide a user friendly representation
                    def to_s
                        '<Twilio.Autopilot.V1.FieldPage>'
                    end
                end
                class FieldInstance < InstanceResource
                    ##
                    # Initialize the FieldInstance
                    # @param [Version] version Version that contains the resource
                    # @param [Hash] payload payload that contains response from Twilio
                    # @param [String] account_sid The SID of the
                    #   {Account}[https://www.twilio.com/docs/iam/api/account] that created this Field
                    #   resource.
                    # @param [String] sid The SID of the Call resource to fetch.
                    # @return [FieldInstance] FieldInstance
                    def initialize(version, payload , assistant_sid: nil, task_sid: nil, sid: nil)
                        super(version)
                        
                        # Marshaled Properties
                        @properties = { 
                            'account_sid' => payload['account_sid'],
                            'date_created' => Twilio.deserialize_iso8601_datetime(payload['date_created']),
                            'date_updated' => Twilio.deserialize_iso8601_datetime(payload['date_updated']),
                            'field_type' => payload['field_type'],
                            'task_sid' => payload['task_sid'],
                            'assistant_sid' => payload['assistant_sid'],
                            'sid' => payload['sid'],
                            'unique_name' => payload['unique_name'],
                            'url' => payload['url'],
                        }

                        # Context
                        @instance_context = nil
                        @params = { 'assistant_sid' => assistant_sid  || @properties['assistant_sid']  ,'task_sid' => task_sid  || @properties['task_sid']  ,'sid' => sid  || @properties['sid']  , }
                    end

                    ##
                    # Generate an instance context for the instance, the context is capable of
                    # performing various actions.  All instance actions are proxied to the context
                    # @return [FieldContext] CallContext for this CallInstance
                    def context
                        unless @instance_context
                            @instance_context = FieldContext.new(@version , @params['assistant_sid'], @params['task_sid'], @params['sid'])
                        end
                        @instance_context
                    end
                    
                    ##
                    # @return [String] The SID of the [Account](https://www.twilio.com/docs/iam/api/account) that created the Field resource.
                    def account_sid
                        @properties['account_sid']
                    end
                    
                    ##
                    # @return [Time] The date and time in GMT when the resource was created specified in [RFC 2822](https://www.ietf.org/rfc/rfc2822.txt) format.
                    def date_created
                        @properties['date_created']
                    end
                    
                    ##
                    # @return [Time] The date and time in GMT when the resource was last updated specified in [RFC 2822](https://www.ietf.org/rfc/rfc2822.txt) format.
                    def date_updated
                        @properties['date_updated']
                    end
                    
                    ##
                    # @return [String] The Field Type of the field. Can be: a [Built-in Field Type](https://www.twilio.com/docs/autopilot/built-in-field-types), the unique_name, or the SID of a custom Field Type.
                    def field_type
                        @properties['field_type']
                    end
                    
                    ##
                    # @return [String] The SID of the [Task](https://www.twilio.com/docs/autopilot/api/task) resource associated with this Field.
                    def task_sid
                        @properties['task_sid']
                    end
                    
                    ##
                    # @return [String] The SID of the [Assistant](https://www.twilio.com/docs/autopilot/api/assistant) that is the parent of the Task associated with the resource.
                    def assistant_sid
                        @properties['assistant_sid']
                    end
                    
                    ##
                    # @return [String] The unique string that we created to identify the Field resource.
                    def sid
                        @properties['sid']
                    end
                    
                    ##
                    # @return [String] An application-defined string that uniquely identifies the resource. It can be used in place of the resource's `sid` in the URL to address the resource.
                    def unique_name
                        @properties['unique_name']
                    end
                    
                    ##
                    # @return [String] The absolute URL of the Field resource.
                    def url
                        @properties['url']
                    end
                    
                    ##
                    # Delete the FieldInstance
                    # @return [Boolean] True if delete succeeds, false otherwise
                    def delete

                        context.delete
                    end

                    ##
                    # Fetch the FieldInstance
                    # @return [FieldInstance] Fetched FieldInstance
                    def fetch

                        context.fetch
                    end

                    ##
                    # Provide a user friendly representation
                    def to_s
                        values = @params.map{|k, v| "#{k}: #{v}"}.join(" ")
                        "<Twilio.Autopilot.V1.FieldInstance #{values}>"
                    end

                    ##
                    # Provide a detailed, user friendly representation
                    def inspect
                        values = @properties.map{|k, v| "#{k}: #{v}"}.join(" ")
                        "<Twilio.Autopilot.V1.FieldInstance #{values}>"
                    end
                end

             end
             end
            end
        end
    end
end


