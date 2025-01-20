local json = require("vendor.json")
local http = require("lua-resty-http/lib/resty/http")
local hmac = require("lua-resty-hmac/lib/resty/hmac")

local search_service_url = config.THEHUB_SEARCHER_ADDR
local thehub_searcher_secret = config.THEHUB_HMAC_SECRET

local function thehub_search(search_args)
    local httpc = http.new()

    -- Initialize the hmac object
    local hmac_sha256 = hmac:new(thehub_searcher_secret, hmac.ALGOS.SHA256)
    if not hmac_sha256 then
        ngx.log(ngx.ERR, "Failed to create hmac_sha256 object.")
        exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
    end
    -- Create a timestamp to add to the hmac signature
    local timestamp = tostring(math.floor(ngx.now()))
    if not timestamp then
        ngx.log(ngx.ERR, "Failed to create timestamp")
        exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
    end

    local ok = hmac_sha256:update(timestamp)
    if not ok then
        ngx.log(ngx.ERR, "failed to add timestamp to hmac.")
        exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
    end

    -- add search query to the hmac
    ok = hmac_sha256:update(search_args.query)
    if not ok then
        ngx.log(ngx.ERR, "Failed add search query to hmac")
        exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
    end

    local valid_hmac = hmac_sha256:final(nil, true)
    if not valid_hmac then
        ngx.log(ngx.ERR, "Failed to create Request-HMAC value")
        exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
    end

    -- This is where we'll actually get the response
    local res, err = httpc:request_uri(search_service_url, {
        method = "GET",
        query = search_args,
        headers = {
            ["Content-Type"] = "application/json",
            ["Request-HMAC"] = timestamp .. "." .. valid_hmac
        }
    })

    return res, err
end

return thehub_search