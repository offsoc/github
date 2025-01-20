local mysql = require("vendor/lua-resty-mysql/lib/resty/mysql")

db = {}
db.__index = db

function db:_execute_query(sql)
    local conn, err = mysql:new()

    if err then
        return nil, "could not create new mysql object: " .. err
    end

    -- this is backed by a connection pool, so it's not actually reconnecting
    -- to mysql for each query.
    local ok, err, errno, sqlstate = conn:connect(self.connection_details)

    if err then
        return nil, err
    end

    local res, err, errcode, sqlstate = conn:query(sql)

    if err then
        return nil, err
    end

    -- return connection back to the pool once we're done with it
    conn:set_keepalive(300 * 1000, 8)

    return res
end

local function interpolate(sql, params)
    return sql:gsub(":([%w_]+)", function(name)
        return ngx.quote_sql_str(params[name] or error("unbound sql variable: " .. name))
    end)
end

local function retryable_error(err)
    return err:find(": closed$") or err:find(": connection reset by peer$")
end

function db:query(sql, params)
    if params then
        sql = interpolate(sql, params)
    end

    local res, err = self:_execute_query(sql)

    -- we routinely close mysql connections at mysqlproxy, so if the query
    -- fails due to a closed connection, we can just retry
    if err and retryable_error(err) then
        res, err = self:_execute_query(sql)
    end

    -- if the original error was not a retryable error, or if the retry failed,
    -- just bail out
    if err then
        return nil, err
    end

    return res
end

return function(connection_details)
    local obj = { connection_details = connection_details }
    setmetatable(obj, db)
    return obj
end
