metrics = {}
metrics.__index = metrics

function metrics:close()
    if self.sock then
        self.sock:close()
    end
end

-- Encodes associative table `tags` as string in datagram format.
--
-- The "datagram" format, a take on the statsd for Datadog is defined:
--
--  metric.name:value|type|@sample_rate|#tag1:value,tag2
--
-- source: http://docs.datadoghq.com/guides/dogstatsd/#datagram-format
function metrics:encode_tags(tags)
    if tags then
        local joined_tags = {}
        for k, v in pairs(tags) do
            joined_tags[#joined_tags+1] = k .. ":" .. v
        end
        return "|#" .. table.concat(joined_tags, ",")
    end
    return ""
end

function metrics:encode_sample_rate(sample_rate)
    if sample_rate and not self.ghae then
        return string.format("|@%f", sample_rate)
    end
    return ""
end

function metrics:count(name, delta, sample_rate, tags)
    self:send(string.format("%s%s:%d|c%s%s",
        self.prefix,
        name,
        delta,
        self:encode_sample_rate(sample_rate),
        self:encode_tags(tags)
    ), sample_rate)
end

function metrics:time(name, ms, sample_rate, tags)
    self:send(string.format("%s%s:%f|ms%s%s",
        self.prefix,
        name,
        ms,
        self:encode_sample_rate(sample_rate),
        self:encode_tags(tags)
    ), sample_rate)
end

function metrics:inc(name, sample_rate, tags)
    self:count(name, 1, sample_rate, tags)
end

-- Whether the metric should should be included in the sample.
function metrics:sampleable(sample_rate)
    return sample_rate == nil or math.random() <= sample_rate or self.ghae
end

function metrics:send(metric, sample_rate)
    if self.sock ~= nil and self:sampleable(sample_rate) then
        self.sock:send(metric)
    end
end

return function(prefix, host, port, ghae)
    local sock = ngx.socket.udp()
    if host and port then
        sock:setpeername(host, port)
    else
        ngx.log(ngx.DEBUG, "not connecting to metrics because host or port is missing")
        sock = nil
    end
    local obj = { prefix = prefix, sock = sock, ghae = ghae }
    setmetatable(obj, metrics)
    return obj
end
