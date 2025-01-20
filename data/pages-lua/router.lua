-- If the app-config isn't properly setup, then we can't serve connections.
-- Ensure we have a valid configuration before going any farther.
if not config then
  ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
  return
end
function dump(o)
    if type(o) == 'table' then
       local s = '{ '
       for k,v in pairs(o) do
          if type(k) ~= 'number' then k = '"'..k..'"' end
          s = s .. '['..k..'] = ' .. dump(v) .. ','
       end
       return s .. '} '
    else
       return tostring(o)
    end
end

-- Define permutations for different sizes
local permutations = {
    [3] = {
        {1, 2, 3},
        {1, 3, 2},
        {2, 1, 3},
        {2, 3, 1},
        {3, 1, 2},
        {3, 2, 1}
    },
    [2] = {
        {1, 2},
        {2, 1}
    },
    [1] = {
        {1}
    }
}

-- Function to apply permutation, it's mainly for better randomness for small size
-- see https://github.com/github/puppet/pull/36622#issuecomment-2034484092
local function apply_permutation(array)
    local size = #array
    if size < 1 or size > 3 then
        return array -- Return the array as-is for unsupported sizes
    end

    local perm_set = permutations[size]
    local seed = math.floor((1664525 * os.clock() + 1013904223) % 4294967296)
    local perm_index = (seed % #perm_set) + 1
    local perm = perm_set[perm_index]

    local original = {unpack(array)}  -- Make a copy of the original array
    for i = 1, size do
        array[i] = original[perm[i]]
    end
end

local use_nginx_retry = false
if not config.ENTERPRISE and ngx.var.gh_pages_resolver then
  use_nginx_retry = true
end

local api_request_secret = config.API_REQUEST_SECRET
local github_api = config.GITHUB_API_ADDR
local github_auth_path = "/.github/auth"
local github_search_path = "/.github/search"

if not (api_request_secret and github_api) and not config.ENTERPRISE then
    ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
  return
end

local function site()
    if config.SITE then
        return config.SITE
    end

    if host_metadata and host_metadata.site then
        return host_metadata.site
    end

    return ""
end

local function datacenter()
    if config.DATA_CENTER then
        return config.DATA_CENTER
    end

    if host_metadata and host_metadata.datacenter then
        return host_metadata.datacenter
    end

    local fe_site = site()
    if fe_site then
        for word in fe_site:gmatch("([^-]+)") do
            -- Grab just the first piece.
            return word
        end
    end

    return ""
end

local function site_aware_config(key)
    -- tries site-specific setting first, e.g. SDC42_SEA_MYSQL_HOST
    local fe_site = site()
    if fe_site then
        local site_for_env = fe_site:upper():gsub("%-", "_")
        if config[site_for_env .. "_" .. key] then
            return config[site_for_env .. "_" .. key]
        end
    end

    local fe_datacenter = datacenter()
    if fe_datacenter then
        local datacenter_for_env = fe_datacenter:upper():gsub("%-", "_")
        if config[datacenter_for_env .. "_" .. key] then
            return config[datacenter_for_env .. "_" .. key]
        end
    end

    -- fall back to just the key
    return config[key]
end

if not string.match(package.path, "/data/pages%-lua/vendor/%?%.lua%;/data/pages%-lua/vendor/%?/init%.lua") then
    package.path = package.path .. ";/data/pages-lua/vendor/?.lua;/data/pages-lua/vendor/?/init.lua"
end

local TRUE = {
    ['1'] = true,
    ['t'] = true,
    ['T'] = true,
    ['true'] = true,
    ['TRUE'] = true,
    ['True'] = true,
};

local function toboolean(str)
  if TRUE[str] == true then
    return true;
  end
  return false;
end

local json = require("vendor.json")
local liburl = require("vendor.url")
local metrics = require("lib/metrics")("pages-lua." .. ngx.var.gh_hostname .. ".", config.STATSD_HOST, config.STATSD_PORT, toboolean(config.GHAE))
local datadog = require("lib/metrics")("pages_lua.", config.DATADOG_STATSD_HOST, config.DATADOG_STATSD_PORT, toboolean(config.GHAE))

local mysql1_tls = toboolean(site_aware_config("MYSQL_TLS"))
local mysql1_db = require("lib/db") {
    host     = site_aware_config("MYSQL_HOST"),
    database = site_aware_config("MYSQL_DATABASE"),
    user     = site_aware_config("MYSQL_USER"),
    port     = site_aware_config("MYSQL_PORT"),
    password = site_aware_config("MYSQL_PASSWORD"),
    ssl      = mysql1_tls,
    ssl_verify = mysql1_tls
}

-- The connection to the database that holds the repositories schema domain.
-- This is currently mysql1 but it will soon be migrated to a new cluster using
-- vitess.  When that happens these connection details should be updated to
-- point to vitess.
local repositories_tls = toboolean(site_aware_config("MYSQL_REPOSITORIES_TLS"))
local repositories_db = require("lib/db") {
    host     = site_aware_config("MYSQL_REPOSITORIES_HOST"),
    database = site_aware_config("MYSQL_REPOSITORIES_DATABASE"),
    user     = site_aware_config("MYSQL_REPOSITORIES_USER"),
    port     = site_aware_config("MYSQL_REPOSITORIES_PORT"),
    password = site_aware_config("MYSQL_REPOSITORIES_PASSWORD"),
    ssl      = repositories_tls,
    ssl_verify = repositories_tls
}

local route_hash = require("lib/route_hash")
local thehub_search = require("lib/thehub_search")

local http = require("lua-resty-http/lib/resty/http")
local resolver = require("lua-resty-dns/lib/resty/dns/resolver")
local hmac = require("lua-resty-hmac/lib/resty/hmac")

local uuid = require("lua-resty-jit-uuid/lib/resty/jit-uuid")
uuid.seed()

local function is_defined(value)
    return value ~= ngx.null and value ~= nil
end

local function pages_group()
    if is_defined(host_metadata.attributes.github["pages:group"]) then
        return host_metadata.attributes.github["pages:group"]
    end
end

-- healthy_dfs_nodes is set by Consul and has a list of healthy servers.
local function host_is_healthy(hostname, datacenter)
        -- It's either not configured or something terrible is happening. Let the system handle these cases.
    if not healthy_dfs_nodes
        or not healthy_dfs_nodes.servers
        or not healthy_dfs_nodes.servers[datacenter]
        or not datacenter
        -- Don't use consul health status in Enterprise
        or config.ENTERPRISE then
        return true
    end

    -- If host is "passing", it's healthy. Otherwise we don't want to route to it
    return healthy_dfs_nodes.servers[datacenter][hostname] == "passing"
end

local function exit(status)
    local response_time = (ngx.now() - ngx.req.start_time()) * 1000
    metrics:time("response_time", response_time)
    datadog:time("response_time", response_time, 0.5)

    metrics:inc("status." .. status)
    datadog:inc("request", 0.5, { status = status })

    metrics:close()
    datadog:close()

    ngx.exit(status)
end


local function http_gone()
    local http_gone_html =
        io.open(config.PUBLIC_PATH .. "/410.html")
        :read("*all")
        :gsub("{HOSTNAME}", ngx.var.host)

    datadog:inc("http_gone")
    ngx.header["Content-Type"] = "text/html"
    ngx.header["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'; img-src data:; connect-src 'self'"
    ngx.status = ngx.HTTP_GONE
    ngx.print(http_gone_html)
    exit(ngx.HTTP_GONE)
end

local function query(sql, params, connection)
    -- Third param is optional
    connection = connection or repositories_db
    local start_time = ngx.now()
    local res, err = connection:query(sql, params)
    local mysql_latency = (ngx.now() - start_time) * 1000
    -- TODO once there are multiple dbs break these metrics up by host
    datadog:time("mysql_latency", mysql_latency, 0.5)

    metrics:inc("queries")

    if err then
        metrics:inc("query_errors")
        datadog:inc("mysql_queries", 0.5, { status = "error" })
        error(err)
    end

    datadog:inc("mysql_queries", 0.5, { status = "success" })

    return res
end

local function query_one(sql, params, connection)
    -- Third param is optional
    connection = connection or repositories_db
    return query(sql, params, connection)[1]
end

-- Query a username given a user id
local function query_username(user_id)
    return query_one([[
        SELECT login AS username
        FROM users
        WHERE spammy = 0
        AND id = :user_id
    ]], { user_id = user_id }, mysql1_db)
end

local function dpages_path(page_id, revision)
    local shard = route_hash(tostring(page_id))
    local partition = tonumber(shard:sub(1, 1), 16) % 8

    return config.PAGES_ROOT ..
            "/" .. partition ..
            "/" .. shard:sub(1, 2) ..
            "/" .. shard:sub(3, 4) ..
            "/" .. shard:sub(5, 6) ..
            "/" .. page_id ..
            "/" .. revision
end

local function streqi(a, b)
    return a:lower() == b:lower()
end

local function str_starts_with(string, prefix)
    return string:sub(1, prefix:len()) == prefix
end

local function str_ends_with(string, suffix)
    return string:sub(string:len() - suffix:len() + 1) == suffix
end

local function is_github_auth_uri()
    return str_ends_with(ngx.var.uri, github_auth_path)
end

-- When using `json:encode` witn a `table`, the pairs are iterated.
-- If the value of the pair is `ngx.null`, it is of type `userdata`,
-- which isn't supported by `json:encode`. Hence this function removes
-- those from the table
local function scrub_ngx_null(data)
    for k, v in pairs(data) do
        if v == ngx.null then
            data[k] = nil
        end
    end

    return data
end

local function extract_first_path_segment(path)
    local md, err = ngx.re.match(path, "^/+([^/?]*).*$")
    if err or not md then
        return "/"
    end

    return md[1]
end

local function pages_preview_domain(domain)
    return config.PAGES_PREVIEW_HOST_NAME and str_ends_with(domain, "." .. config.PAGES_PREVIEW_HOST_NAME)
end

local function github_owned_page(username)
    if streqi("github", username) then
        return true
    end

    return false
end

local function valid_result_cname(result, username)
  if result then
      if result.cname ~= ngx.null then
          return true
      end
  end
  return false
end

--
-- If the domain is a *.drafts.github.io domain, then extract the username & deployment ID from the URL.
local function extract_parts_from_preview_domain(domain)
    local preface = domain:sub(1, domain:len() - config.PAGES_PREVIEW_HOST_NAME:len() - 1)

    local md, err = ngx.re.match(preface, [[(.*)-([a-f0-9]{8,})-([0-9]+)]])
    if not err and md then
        -- contains a page id
        ngx.header["Preview-URL-Version"] = 2
        return {
            username         = md[1],
            deployment_token = md[2],
            page_id          = md[3]
        }
    end

    -- If we didn't return, check for preface that matches format without page_id
    md, err = ngx.re.match(preface, [=[(.*)-([a-f0-9]{8,})]=])
    if not err and md then
        -- doesn't contain page id
        ngx.header["Preview-URL-Version"] = 1
        return {
            username         = md[1],
            deployment_token = md[2]
        }
    end

end

local function get_client_ip()
    local client_ip = ngx.var.http_fastly_client_ip
    if not client_ip then
        datadog:inc("pages_authn", 1, { status = "IP_address_missing" })
        ngx.log(ngx.ERR, "No IP found on request. Cannot continue")
        exit(ngx.HTTP_BAD_REQUEST)
    end
    return client_ip
end

-- This function validates the query arguments for the /.github/auth route
-- It ensures the request only hits our auth backend for private pages and
-- that the URL has valid query arguments.
-- URL will match this format: https://special-guacamole-b95e9f9a.pages.github.io/.github/auth?page_id=1234&token=GHSAT0123456&path=ABCDEFG1234567&deployment_token=sometoken
-- with deployment_token optional
local function build_query_args(args)
    local valid_args = { site = nil, token = nil, nonce = nil, path = nil, page_id = nil, deployment_token = nil }

    -- Create a resolver
    local r, err = resolver:new{
        nameservers = {"8.8.8.8", {"8.8.4.4", 53}},
        retrans = 5,  -- 5 retransmissions on receive timeout
        timeout = 2000,  -- 2 sec
    }
    if not r then
        ngx.log(ngx.ERR, "Failed to instantiate resolver: " .. err)
        exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
    end

    -- page_id must be a number
    if not tonumber(args.page_id) then
        exit(ngx.HTTP_BAD_REQUEST)
    end
    valid_args.page_id = tonumber(args.page_id)

    -- token is required
    if not args.token then
        ngx.log(ngx.ERR, "No token found in query arguments")
        exit(ngx.HTTP_BAD_REQUEST)
    end

    -- A valid SAT starts with "GHSAT0" and the trailing string is encoded with
    -- a base64 alphabet. We'll check to make sure it at least looks like a valid
    -- token here. Technically the SAT is base32, but this will help break injection attacks.
    local prefix, sat = string.match(args.token, '(GHSAT0)(.+)')
    if not prefix == "GHSAT0" or sat == nil or not ngx.decode_base64(sat) then
        exit(ngx.HTTP_BAD_REQUEST)
    end
    valid_args.token = args.token

    -- page_id must point to a private Pages site
    local result = query_one([[
        SELECT subdomain, cname, public, repository_id
        FROM pages
        WHERE (id = :id)
    ]], { id = valid_args.page_id })
    if result.public == 1 then
        exit(ngx.HTTP_BAD_REQUEST)
    end

    -- deployment_token is an optional hex string
    -- between 10 and 16 characters.
    if is_defined(args.deployment_token) then
        local md = ngx.re.match(args.deployment_token, "^[0-9a-f]{10,16}$")
        if not md then
            exit(ngx.HTTP_BAD_REQUEST)
        end
        valid_args.deployment_token = md[0]
    end

    -- Build site URL to return to
    if is_defined(valid_args.deployment_token) then
        -- redirect to a preview deployment
        local owner_id_result = query_one([[
            SELECT repositories.owner_id as owner_id
            FROM pages
            INNER JOIN repositories on repositories.id = pages.repository_id
            WHERE (pages.id = :page_id)
        ]], { page_id = valid_args.page_id })
        if owner_id_result then
            local owner_username_result = query_username(owner_id_result.owner_id)
            if owner_username_result then
                valid_args.site = owner_username_result.username .. "-" .. valid_args.deployment_token .. "-" .. tostring(valid_args.page_id) .. ".drafts." .. config.PAGES_HOST_NAME
            end
        end
        if not is_defined(valid_args.site) then
            exit(ngx.HTTP_BAD_REQUEST)
        end
    elseif result.cname ~= ngx.null then
        -- redirect to a cname
        valid_args.site = result.cname
    elseif result.subdomain ~= ngx.null then
        -- redirect to a regular production deployment
        valid_args.site = result.subdomain .. ".pages." .. config.PAGES_HOST_NAME
    end

    -- To be able to redirect to any custom hostname,
    -- We first need to ensure the page we're about to redirect to
    -- is pointed at Pages servers. Otherwise we might leak tokens to
    -- servers that are not in our control
    if str_starts_with(ngx.var.uri, "/redirect") and valid_args.site then
        -- This is a utility function to dump the DNS response to a header
        -- If you pass X-DNS-Debug: 1 header, we'll be able to inspect the
        -- DNS response to determine why a redirect didn't happen
        local answers, err, tries = r:query(valid_args.site, nil, {})
        local is_valid = false

        if ngx.var.http_x_dns_debug == "1" and config.TEST then
            ngx.header["X-DNS-Debug"] = dump(answers)
        end

        if not answers or answers.errstr then
            exit(ngx.HTTP_NOT_FOUND)
        end

        for i, ans in ipairs(answers) do
            -- Check if the site is pointed at github.io
            -- or points to any of our IP addresses

            -- type = 1 are A records
            if ans.address and ans.type == 1 then
                if ans.address == "192.30.252.153"
                or ans.address == "192.30.252.154"
                or ans.address == "185.199.108.153"
                or ans.address == "185.199.109.153"
                or ans.address == "185.199.110.153"
                or ans.address == "185.199.111.153" then
                    is_valid = true
                    break
                end
            end

            -- type = 28 are AAAA records
            if ans.address and ans.type == 28 then
                if ans.address == "2606:50c0:8000::153"
                or ans.address == "2606:50c0:8001::153"
                or ans.address == "2606:50c0:8002::153"
                or ans.address == "2606:50c0:8003::153" then
                    is_valid = true
                    break
                end
            end
        end

        if not is_valid then
            exit(ngx.HTTP_NOT_FOUND)
        end

    end

    -- nonce is required
    if not args.nonce then
        exit(ngx.HTTP_BAD_REQUEST)
    end
    valid_args.nonce = args.nonce

    -- path is a base64 string
    local path = ngx.decode_base64(args.path)
    -- Parse the path so we discard any illegal characters
    -- In details:
    --  * make sure it starts with /
    --  * make sure it does not start with // (double slash would allow someone to provide a path changing the authority, i.e. the domain of the path in the context of a redirection)
    --  * make sure it does not contains \r\n (a CRLF sequence which is the line return of the HTTP protocol that would allow one to inject body or headers in the path in the context of a redirection)
    --  * see https://github.com/github/pages-engineering/issues/992
    local parsed = liburl.parse(path)
    if not parsed or not str_starts_with(path, "/") or str_starts_with(path, "//") or string.find(path, "\r\n") then
        exit(ngx.HTTP_BAD_REQUEST)
    end
    valid_args.path = args.path

    -- return the validated arguments
    return valid_args
end

local function fqdn(host)
    if config.ENTERPRISE then
        return host
    elseif host:find("%-cp1%-prd$") then
        return host .. ".iad.github.net"
    elseif host:find("%-pe1%-prd$") then
        return host .. ".aws.github.net"
    else
        return host
    end
end

--- This function resolves the IP address of a host
local function resolve_hostname(hosts)
  local nameservers_array = {}
  local hosts_ips = {}

  -- if we are testing no need to resolve
  if config.TEST then
    for _, hostname in ipairs(hosts) do
      table.insert(hosts_ips, hostname.host)
    end
    return hosts_ips
  end
  
  for server in string.gmatch(ngx.var.gh_pages_resolver, "%S+") do
    table.insert(nameservers_array, server)
  end

  local r, err = resolver:new{
    nameservers = nameservers_array,
    retrans = 5,  -- 5 retransmissions on receive timeout
    timeout = 1000,  -- 1 sec
  }

  if not r then
    ngx.log(ngx.ERR, "Failed to instantiate resolver: " .. err)
    exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
  end

  for _, hostname in ipairs(hosts) do
    local answer, err = r:query(fqdn(hostname.host), nil, {})
    if not answer then
        ngx.log(ngx.ERR, "Failed to query for hostname: " .. err)
        exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
    end

    if answer.errcode then
        ngx.log(ngx.ERR, "Server returned error code: ", answer.errcode, ": ", answer.errstr)
        exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
    end

    -- Append the resolved IP address to the table
    if answer[1] and answer[1].address then
      table.insert(hosts_ips, answer[1].address)
    end
  end

  return hosts_ips
end

local function token_cache(key, ttl, fn)
    local cached = ngx.shared.auth:get(key)

    if cached then
        ngx.header["X-Token-Status"] = "cached"
        return json:decode(cached)
    end

    local value = fn()
    ngx.shared.auth:set(key, json:encode(value), ttl)

    return value
end

local function validate_session_token(page_id, signed_token_from_header)
    --
    -- The `Fastly-Client-IP` header is the "true" IP Address of the client making the request
    -- as seen from Fastly's datacenters.
    --
    -- If client attempts to send another value in this header it will be cleared
    -- and reset to the true IP address to prevent spoofing.
    --
    -- This is used to validate the client against
    -- the IP Allow list feature in dotcom.
    --
    local client_ip = get_client_ip()

    local httpc = http.new()

    local auth_url = github_api .. "/internal/pages/auth"

    -- Initialize the hmac object
    local hmac_sha256 = hmac:new(api_request_secret, hmac.ALGOS.SHA256)
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

    -- Add timestamp data to the hmac
    local hmac = hmac_sha256:final(timestamp, true)
    if not hmac then
        ngx.log(ngx.ERR, "Failed to create Request-HMAC value")
        exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
    end

    local json_body = json:encode({ page_id = tonumber(page_id), token = signed_token_from_header, ip_address = client_ip })

    local res, err = httpc:request_uri(auth_url, {
        method = "POST",
        body = json_body,
        headers = {
            ["Content-Type"] = "application/json",
            ["Request-HMAC"] = timestamp .. "." .. hmac
        }
    })

    if err then
        return err
    elseif res then
        if res.status == ngx.HTTP_OK then
            local response = json:decode(res.body)
            response.status = res.status
            return response
        else
            ngx.log(ngx.ERR, "Invalid response from internal API for client " .. ngx.var.http_fastly_client_ip .. ", body: " .. res.body)
            return { status = res.status, body = res.body }
        end
    end
end

local function authenticate(result)
    if is_defined(ngx.var.gh_pages_public) and is_defined(result.public) then
        ngx.var.gh_pages_public = result.public
    end

    local session_uuid = uuid.generate_v4()

    local encoded_path
    if is_github_auth_uri() and not is_defined(result.path) then
        -- no path was set on result, so build the path argument from the request
        local req_args, err = ngx.req.get_uri_args(5)
        if not req_args or err == "truncated" then
            exit(ngx.HTTP_BAD_REQUEST)
        end
        local args = build_query_args(req_args)
        encoded_path = args.path
    elseif is_github_auth_uri() then
        -- If we need to re-authenticate at this point, use the
        -- previously encoded path instead of the current URI
        encoded_path = result.path
    else
        encoded_path = ngx.encode_base64(ngx.var.request_uri, true)
    end

    -- Build the URL to redirect to
    local url = liburl.parse()
    url.scheme = "https"
    url.host = "github.com"
    url.path = "login"
    local return_to = "/pages/auth?nonce=" .. session_uuid .. "&page_id=" .. result.page_id .. "&path=" .. encoded_path
    if is_defined(result["deployment_token"]) then
        return_to = return_to .. "&deployment_token=" .. result.deployment_token
    end
    url.query = url.buildQuery({
        return_to = return_to
    })

    -- Generate a cookie with a unique ID
    ngx.header["Set-Cookie"] = {
        "__Host-gh_pages_session=" .. session_uuid ..
        "; Secure" ..
        "; path=/" ..
        "; HttpOnly"
    }

    -- Prevent fastly and browser from caching authentication requests
    ngx.header["Cache-Control"] = "private, no-store"

    -- Set header to tell Fastly this is a Private Page
    ngx.header["X-Pages-Private"] = "1"

    -- Prevent internal caches from storing the response
    ngx.header["X-Origin-Cache"] = "no-store"

    -- Make a redirection
    ngx.header["Location"] = url:build()
    exit(ngx.HTTP_MOVED_TEMPORARILY)
end

local function resolve_auth_route(result)
    local client_ip = get_client_ip()

    local session_id_from_header = ngx.var.http_x_pages_session

    -- If request doesn't have a session ID, the browser needs to be authenticated
    if not session_id_from_header then
        datadog:inc("pages_authn", 1, { status = "session_missing" })
        ngx.log(ngx.ERR, "No session ID found on this request")
        return authenticate(result)
    end

    -- Check to verify token is valid from internal API
    local cache_key = result.token .. ":" .. result.page_id .. ":" .. client_ip
    local res = token_cache(cache_key, 30, function()
        return validate_session_token(result.page_id, result.token)
    end)

    if res.status == ngx.HTTP_OK and res.pages_auth then
        -- Internal API says we have access to this page
        datadog:inc("pages_authn", 1, { status = "success" })

        -- Get exisiting session ID and verify it matches the `nonce` value from GitHub
        if result.nonce ~= session_id_from_header then
            datadog:inc("pages_authn", 1, { status = "session_mismatch" })
            ngx.log(ngx.ERR, "Nonce and session ID do not match: Nonce=" .. result.nonce .. " ID=" .. session_id_from_header)
            return authenticate(result)
        end

        ngx.header["Set-Cookie"] = {
            "__Host-gh_pages_token=" .. result.token ..
            "; Secure" ..
            "; HttpOnly" ..
            "; path=/"
            ,
            "__Host-gh_pages_id=" .. result.page_id ..
            "; Secure" ..
            "; HttpOnly" ..
            "; path=/"
        }
        -- Tell Fastly this is private so it's not cached. This does not effect browser caching
        ngx.header["Cache-Control"] = "private"

        -- Prevent internal caches from storing the response
        ngx.header["X-Origin-Cache"] = "no-store"

        -- The original path may contain encoded querystring args, so let the URL
        -- parser handle that
        local original_path = ngx.decode_base64(result.path)
        local url = liburl.parse(original_path)
        url.host = result.domain
        url.scheme = "https"

        ngx.header["Location"] = url:build()
        exit(ngx.HTTP_MOVED_TEMPORARILY)
    elseif res.status == ngx.HTTP_FORBIDDEN then
        local json_body = json:decode(res.body)
        local code = json_body.message
        if code == "ip_forbidden" then
            datadog:inc("pages_authn", 1, { status = "ip_address_not_allowed" })
            return {
                action     = "ip_forbidden",
                ip_address = ngx.var.http_fastly_client_ip
            }
        elseif code == "saml_session_not_found" then
            datadog:inc("pages_authn", 1, { status = "saml_session_not_found" })
            if ngx.var.http_x_pages_token ~= nil then
                return resolve_authenticated(result)
            else
                return authenticate(result)
            end
        elseif code == "access_forbidden" then
            datadog:inc("pages_authn", 1, { status = "access_forbidden" })
            return {
                action = "access_forbidden"
            }
        else
            datadog:inc("pages_authn", 1, { status = "ip_address_not_allowed" })
            return {
                action     = "ip_forbidden",
                ip_address = ngx.var.http_fastly_client_ip
            }
        end
    else
        datadog:inc("pages_authn", 1, { status = "failure" })
        ngx.log(ngx.STDERR, "Error getting response from internal API: status=" .. res.status .. " body=" .. res.body)
        exit(ngx.HTTP_NOT_FOUND)
    end
end

local function resolve_authenticated(result)
    local client_ip = get_client_ip()
    local session_id_from_header = ngx.var.http_x_pages_session
    local signed_token_from_header = ngx.var.http_x_pages_token

    local type = result.subdomain and "subdomain" or "owner"

    if not signed_token_from_header then
        datadog:inc("pages_authz", 1, { status = "no_token", type = type })
        ngx.log(ngx.ERR, "No token from header. This should never happen")
        exit(ngx.HTTP_BAD_REQUEST)
    end

    local cache_key = signed_token_from_header .. ":" .. result.page_id .. ":" .. client_ip
    local response = token_cache(cache_key, 30, function()
        return validate_session_token(result.page_id, signed_token_from_header)
    end)

    if response.status == ngx.HTTP_OK and response.pages_auth then
        -- Token is valid. Give them their content!
        datadog:inc("pages_authz", 1, { status = "success", type = type })
        ngx.header["X-Pages-Private"] = "1"

        -- Leverage security headers for private pages
        ngx.header["Referrer-Policy"] = "no-referrer"

        return {
            action                   = "resolved",
            page_id                  = result.page_id,
            deployment_token         = result.deployment_token,
            site_type                = type,
            repo_nwo                 = result.repo_nwo,
            public                   = result.public,
            hsts_max_age             = result.hsts_max_age,
            hsts_include_sub_domains = result.hsts_include_sub_domains,
            hsts_preload             = result.hsts_preload
        }
    else
        datadog:inc("pages_authz", 1, { status = "failure", type = type })
        ngx.log(ngx.STDERR, "Error getting response from interal API. Status: " .. response.status )
        -- The token we received is not valid. Send user back to GitHub to get a new one.
        -- If they still have access on dotom, we'll get a new token.
        -- If they don't have access, this lets dotcom deliver the 404.
        return authenticate(result)
    end
end

local function resolve_pages_site(scheme, domain, first_path_segment)
    --
    -- first, see if we have a CNAME for this domain
    --

    local alt_domain
    local hsts_max_age
    local hsts_include_sub_domains
    local hsts_preload
    local public

    if str_starts_with(domain, "www.") then
        alt_domain = domain:sub(5, -1)
    else
        alt_domain = "www." .. domain
    end

    local result = query_one([[
        SELECT repositories.owner_id AS user_id,
               repositories.name AS repo,
               pages.built_revision as revision,
               pages.cname AS cname,
               pages.id AS page_id,
               pages.https_redirect AS https_redirect,
               pages.hsts_max_age AS hsts_max_age,
               pages.hsts_include_sub_domains AS hsts_include_sub_domains,
               pages.hsts_preload AS hsts_preload,
               pages.subdomain as subdomain,
               pages.public AS public
        FROM pages
        INNER JOIN repositories ON repositories.id = pages.repository_id
        WHERE (pages.cname = :domain OR pages.cname = :alt_domain)
          AND pages.deleted_at IS NULL
          AND repositories.disabled_at IS NULL
          AND repositories.active = 1
    ]], { domain = domain, alt_domain = alt_domain })

    if result then
        local user_login_result = query_username(result.user_id)
        if user_login_result then
            result.username = user_login_result.username
            result.repo_nwo = result.username .. "/" .. result.repo

            -- if this is a request for a pages site's alternate domain (eg. if the
            -- cname has a www. prefix, the alt domain won't), then redirect to the
            -- canonical domain
            if result.cname == alt_domain then
                if result.https_redirect == 1 or result.public == 0 then
                  return { action = "redirect", scheme = "https", domain = alt_domain }
                end

                return { action = "redirect", scheme = scheme, domain = alt_domain }
            end

            -- If the CNAME relates to a private page, don't do path based routing
            if valid_result_cname(result) and result.public == 0 then
                if is_github_auth_uri() then
                    -- Add CSP header to /__/auth https://github.com/github/pages-engineering/issues/116
                    ngx.header["Content-Security-Policy"] = "default-src 'none'; sandbox; frame-ancestors 'none'"
                    local req_args, err = ngx.req.get_uri_args(5)
                    if not req_args or err == "truncated" then
                        exit(ngx.HTTP_BAD_REQUEST)
                    end
                    local args = build_query_args(req_args)
                    -- Domain we're resolving on should match the CNAME of the site:
                    -- e.g. https://gh-pages.dev/
                    if domain == result.cname then
                        local result = {
                            action = "resolve_auth_route",
                            domain = domain,
                            subdomain = result.subdomain,
                            nonce = args.nonce,
                            page_id = args.page_id,
                            token = args.token,
                            path = args.path,
                            hsts_max_age = result.hsts_max_age,
                            hsts_include_sub_domains = result.hsts_include_sub_domains,
                            hsts_preload = result.hsts_preload,
                            public = result.public,
                            repo_nwo = result.repo_nwo
                        }
                        return resolve_auth_route(result)
                    else
                        exit(ngx.HTTP_NOT_FOUND)
                    end
                else
                    local session_token = ngx.var.http_x_pages_token
                    if session_token ~= nil then
                        return resolve_authenticated(result)
                    else
                        return authenticate(result)
                    end
                end
            end

            -- if the CNAME points to a user pages site
            if streqi(result.repo, result.username .. "." .. config.PAGES_HOST_NAME) or streqi(result.repo, result.username .. "." .. config.PAGES_HOST_NAME_OLD) then
                -- look up to check if the first path segment matches one of the user's project pages sites
                local project_result = query_one([[
                    SELECT pages.id AS page_id,
                           pages.built_revision AS revision,
                           pages.cname AS cname,
                           pages.https_redirect AS https_redirect,
                           pages.hsts_max_age AS hsts_max_age,
                           pages.hsts_include_sub_domains AS hsts_include_sub_domains,
                           pages.hsts_preload AS hsts_preload,
                           pages.subdomain as subdomain,
                           pages.public AS public
                    FROM pages
                    INNER JOIN repositories ON repositories.id = pages.repository_id
                    WHERE repositories.owner_id = :user_id
                      AND pages.deleted_at IS NULL
                      AND repositories.disabled_AT IS NULL
                      AND repositories.name = :repo_name
                      AND BINARY repositories.name = :repo_name /* indexed case sensitive comparison */
                      AND repositories.active = 1
                ]], { user_id = result.user_id, repo_name = first_path_segment })
                -- if it does, resolve to the project site rather than the user site


                if project_result then
                    if project_result.public == 0 and is_defined(project_result.cname) then
                        return { action = "project_redirect", scheme = "https", domain = project_result.cname }
                    end

                    if project_result.public == 0 and is_defined(project_result.subdomain) then
                        return { action = "project_redirect", scheme = "https", domain = project_result.subdomain .. ".pages." .. config.PAGES_HOST_NAME }
                    end

                    -- Fallback case if the page is private and for some reason
                    -- the cname or subdomain are not defined
                    if project_result.public == 0 then
                        -- This should never happen, so send a metric to datadog to warn us
                        -- if for some reason private pages are failing to load because of missing data
                        datadog:inc("private_page_no_subdomain_cname")
                        return { action = "not_found" }
                    end

                    if project_result.cname ~= ngx.null then
                        if project_result.https_redirect == 1 then
                            return { action = "project_redirect", scheme = "https", domain = project_result.cname }
                        else
                            return { action = "project_redirect", scheme = "http", domain = project_result.cname }
                        end
                    end

                    if project_result.hsts_max_age ~= ngx.null then
                        hsts_max_age             = tonumber(project_result.hsts_max_age)
                        hsts_include_sub_domains = (tonumber(project_result.hsts_include_sub_domains) == 1)
                        hsts_preload             = (tonumber(project_result.hsts_preload) == 1)
                    end

                    if project_result.https_redirect == 1 and scheme == "http" then
                        return { action = "redirect", scheme = "https", domain = domain }
                    end

                    return {
                        action                   = "resolved",
                        page_id                  = project_result.page_id,
                        project_site             = true,
                        hsts_max_age             = hsts_max_age,
                        hsts_include_sub_domains = hsts_include_sub_domains,
                        hsts_preload             = hsts_preload,
                        repo_nwo                 = result.username .. "/" .. first_path_segment,
                        public                   = result.public,
                        revision                 = tostring(project_result.revision)
                    }
                end
            end

            if result.hsts_max_age ~= ngx.null then
                hsts_max_age             = tonumber(result.hsts_max_age)
                hsts_include_sub_domains = (tonumber(result.hsts_include_sub_domains) == 1)
                hsts_preload             = (tonumber(result.hsts_preload) == 1)
            end

            if result.https_redirect == 1 and scheme == "http" then
                return { action = "redirect", scheme = "https", domain = domain }
            end

            -- otherwise resolve to the user pages site
            return {
                action                   = "resolved",
                page_id                  = result.page_id,
                project_site             = false,
                hsts_max_age             = hsts_max_age,
                hsts_include_sub_domains = hsts_include_sub_domains,
                hsts_preload             = hsts_preload,
                repo_nwo                 = result.username .. "/" .. result.repo,
                public                   = result.public,
                revision                 = tostring(result.revision)
            }
        end
    end

    --
    -- no CNAME for this domain, check it's *.github.com or *.github.io, return
    -- 404 otherwise
    --

    local username
    local deployment_token
    local page_id

    if not config.ENTERPRISE then
        -- if the request is for a *.github.com domain, redirect to .io
        if str_ends_with(domain, "." .. config.PAGES_HOST_NAME_OLD) then
            username = domain:sub(1, domain:len() - config.PAGES_HOST_NAME_OLD:len() - 1)

            -- Extract username from subdomain
            local subdomain_of_user
            local md = ngx.re.match(username, [[(.*)\.(.*)]])
            if md ~=nil then
                subdomain_of_user = md[1]
                username = md[2]
            end

            if not github_owned_page(username) then
                local result = query_one([[
                    SELECT login, created_at FROM users
                    WHERE login = :username AND spammy = 0
                ]], { username = username }, mysql1_db)

                if not result or result.created_at == ngx.null then
                    return { action = "not_found" }
                end

                -- don't redirect .com to .io for non-github owned pages
                -- the interstial tells the user to update their links
                return { action = "interstitial", username = result.login }
            end
        end
    end

    --
    -- if it's a preview url, figure out which type based on string parts
    --
    if pages_preview_domain(domain) then
        local preview_results = extract_parts_from_preview_domain(domain)
        -- If it's a preview domain but it doesn't align with our required syntax, then 404.
        if is_defined(preview_results) and not preview_results.deployment_token then
            return { action = "not_found" }
        end

        if is_defined(preview_results) then
            ngx.header["Preview-URL-Version"] = 1
            ngx.header["X-Robots-Tag"] = 'none'

            if preview_results.page_id then
                -- if preview results returns a value for page_id,
                -- set a header so we can determine how it routed
                ngx.header["Preview-URL-Version"] = 2
                page_id = preview_results.page_id
            end

            username = preview_results.username
            deployment_token = preview_results.deployment_token
        end
    end

    --
    -- Check if the domain is using multiple subdomains on *.github.io
    --
    local subdomain
    local subdomain_result

    if str_ends_with(domain, ".github.com") and username == "github" then
        -- handle subdomains on github.com
        local md = ngx.re.match(domain, [[(.*\..*)\.github\.com]])
        if md ~=nil then
            subdomain = md[1]
        end
    else
        -- Subdomain is stored as <repo-name>.<org>
        -- This regex gets the first two hostnames in front of *.github.io
        local md = ngx.re.match(domain, [[(.*\..*)\.github\.io]])
        if md ~=nil then
            subdomain = md[1]
        end
    end

    --
    -- If there's two hostnames, query to see if it relates to a Page
    --
    if subdomain ~= nil then
        -- Don't allow "www." subdomains
        if str_starts_with(subdomain, "www.") then
            return { action = "not_found" }
        end

        -- Check if the subdomain is using the new routing experience, which the pattern is subdomain.pages. Currently there is no user name pages, more power validation may required.
        new_routing_experience_subdomain = subdomain:match"([^.]*)%.pages"
        if new_routing_experience_subdomain ~= nil then
            subdomain = new_routing_experience_subdomain
        end

        subdomain_result = query_one([[
            SELECT repositories.owner_id AS user_id,
                repositories.name AS repo,
                pages.built_revision AS revision,
                pages.cname AS cname,
                pages.id AS page_id,
                pages.https_redirect AS https_redirect,
                pages.hsts_max_age AS hsts_max_age,
                pages.hsts_include_sub_domains AS hsts_include_sub_domains,
                pages.hsts_preload AS hsts_preload,
                pages.public AS public,
                pages.subdomain AS subdomain
            FROM pages
            INNER JOIN repositories ON repositories.id = pages.repository_id
            WHERE (pages.subdomain = :subdomain)
                AND pages.deleted_at IS NULL
                AND repositories.disabled_at IS NULL
                AND repositories.active = 1
        ]], {subdomain = subdomain})
    end

    if subdomain_result ~= nil then
        local user_login_result = query_username(subdomain_result.user_id)
        local pages_host_name
        if user_login_result == "github" then
            pages_host_name = "github.com"
        else
            pages_host_name = "github.io"
        end

        subdomain_result.username = user_login_result.username
        subdomain_result.repo_nwo = subdomain_result.username .. "/" .. subdomain_result.repo

        if subdomain_result.hsts_max_age ~= ngx.null then
            hsts_max_age             = tonumber(subdomain_result.hsts_max_age)
            hsts_include_sub_domains = (tonumber(subdomain_result.hsts_include_sub_domains) == 1)
            hsts_preload             = (tonumber(subdomain_result.hsts_preload) == 1)
        end

        if subdomain_result.https_redirect == 1 and scheme == "http" then
            return { action = "redirect", scheme = "https", domain = domain }
        end

        if subdomain_result.public == 0 and is_github_auth_uri() then
            -- Add CSP header to /__/auth https://github.com/github/pages-engineering/issues/116
            ngx.header["Content-Security-Policy"] = "default-src 'none'; sandbox; frame-ancestors 'none'"
            local req_args, err = ngx.req.get_uri_args(5)
            if not req_args or err == "truncated" then
                exit(ngx.HTTP_BAD_REQUEST)
            end
            local args = build_query_args(req_args)
            -- Should match a project site:
            -- e.g. https://project-page.paper-spa.github.io/ or https://haikuname-{page_hash_id}.pages.github.io
            if streqi(domain, subdomain_result.subdomain .. "." .. pages_host_name) or streqi(domain, subdomain_result.subdomain .. ".pages." .. pages_host_name) then
                local result = {
                    domain = domain,
                    subdomain = subdomain_result.subdomain,
                    nonce = args.nonce,
                    page_id = args.page_id,
                    token = args.token,
                    path = args.path,
                    project_site = true,
                    hsts_max_age = hsts_max_age,
                    hsts_include_sub_domains = hsts_include_sub_domains,
                    hsts_preload = hsts_preload,
                    public = subdomain_result.public,
                    repo_nwo = subdomain_result.repo_nwo,
                    revision = subdomain_result.revision
                }
                return resolve_auth_route(result)
            else
                exit(ngx.HTTP_NOT_FOUND)
            end
        elseif subdomain_result.public == 0 then
            -- private project site (e.g. my-repo.paper-spa.github.io)
            -- Check if request contains a token that's valid
            local session_token = ngx.var.http_x_pages_token
            if session_token ~= nil then
                return resolve_authenticated(subdomain_result)
            else
                return authenticate(subdomain_result)
            end
        end
    end

    --
    -- If username is not defined here, we can extract it from the domain
    --
    if not username then
        if str_ends_with(domain, "." .. config.PAGES_HOST_NAME) then
            username = domain:sub(1, domain:len() - config.PAGES_HOST_NAME:len() - 1)
        else
            return { action = "not_found" }
        end
    end

    --
    -- otherwise resolve to either a project site or a user site
    --
    local user_id_result = query_one([[
        SELECT id, login AS username
        FROM users
        WHERE login = :username
        AND spammy = 0
    ]], { username = username }, mysql1_db)

    if user_id_result then
        user_id = user_id_result.id
    else
        return { action = "not_found" }
    end

    --
    -- If we have page id and deployment token, we can resolve
    -- that page directly
    --
    if is_defined(page_id) and is_defined(deployment_token) then
        local preview_result = query_one([[
            SELECT pages.id AS page_id,
                   pages.built_revision AS revision,
                   pages.cname AS cname,
                   pages.https_redirect AS https_redirect,
                   pages.hsts_max_age AS hsts_max_age,
                   pages.hsts_include_sub_domains AS hsts_include_sub_domains,
                   pages.hsts_preload AS hsts_preload,
                   pages.public,
                   pages.subdomain,
                   repositories.name AS repo,
                   page_deployments.revision AS built_revision,
                   page_deployments.token AS deployment_token,
                   page_deployments.ref_name AS deployment_ref_name
            FROM pages
            INNER JOIN repositories ON repositories.id = pages.repository_id
            INNER JOIN page_deployments on page_deployments.page_id = pages.id
            WHERE pages.id = :page_id
                AND page_deployments.token = :deployment_token
                AND pages.deleted_at IS NULL
                AND repositories.disabled_at IS NULL
                AND repositories.active = 1
        ]], {
            page_id = page_id,
            deployment_token = deployment_token
        })
        if not preview_result then
            -- No previews found
            return { action = "not_found"}
        end
        if preview_result.hsts_max_age ~= ngx.null then
            hsts_max_age             = tonumber(preview_result.hsts_max_age)
            hsts_include_sub_domains = (tonumber(preview_result.hsts_include_sub_domains) == 1)
            hsts_preload             = (tonumber(preview_result.hsts_preload) == 1)
        end

        preview_result.repo_nwo = username .. "/" .. preview_result.repo

        if preview_result.https_redirect == 1 and scheme == "http" and preview_result.public == 1 then
            return { action = "redirect", scheme = "https", domain = domain }
        elseif preview_result.public == 0 and is_github_auth_uri() then
            -- /.github/auth route is only valid for private pages
            -- Add CSP header to /__/auth https://github.com/github/pages-engineering/issues/116
            ngx.header["Content-Security-Policy"] = "default-src 'none'; sandbox; frame-ancestors 'none'"
            local req_args, err = ngx.req.get_uri_args(5)
            if not req_args or err == "truncated" then
                exit(ngx.HTTP_BAD_REQUEST)
            end
            local args = build_query_args(req_args)

            local result = {
                action = "resolve_auth_route",
                domain = domain,
                subdomain = preview_result.subdomain,
                nonce = args.nonce,
                page_id = args.page_id,
                token = args.token,
                path = args.path,
                project_site = false,
                hsts_max_age = hsts_max_age,
                hsts_include_sub_domains = hsts_include_sub_domains,
                hsts_preload = hsts_preload,
                public = preview_result.public,
                revision = preview_result.revision,
                -- optional attribute for resolve_auth_route
                deployment_token = deployment_token
            }
            return resolve_auth_route(result)
        elseif preview_result.public == 0 then
            -- private org site (e.g. paper-spa.github.io)
            -- Check if request contains a token that's valid
            local session_token = ngx.var.http_x_pages_token
            if session_token ~= nil then
                return resolve_authenticated(preview_result)
            else
                return authenticate(preview_result)
            end
        else
            return {
                action = "resolved",
                page_id = preview_result.page_id,
                deployment_token = deployment_token,
                project_site = false,
                hsts_max_age = hsts_max_age,
                hsts_include_sub_domains = hsts_include_sub_domains,
                hsts_preload = hsts_preload,
                repo_nwo = username .. "/" .. preview_result.repo,
                public = preview_result.public
            }
        end
    end

    --
    -- Order results with project page first based on first_path_segment
    --
    local results = query([[
        SELECT pages.id AS page_id,
               pages.built_revision AS revision,
               pages.cname AS cname,
               (BINARY repositories.name = :project_name) AS project_site,
               pages.https_redirect AS https_redirect,
               pages.hsts_max_age AS hsts_max_age,
               pages.hsts_include_sub_domains AS hsts_include_sub_domains,
               pages.hsts_preload AS hsts_preload,
               pages.public,
               pages.subdomain,
               repositories.name AS repo
        FROM pages
        INNER JOIN repositories ON repositories.id = pages.repository_id
        WHERE repositories.owner_id = :user_id
          AND (
            (repositories.name = :project_name AND BINARY repositories.name = :project_name)
            OR repositories.name IN (:repo_name, :alt_repo_name))
          AND pages.deleted_at IS NULL
          AND repositories.disabled_at IS NULL
          AND repositories.active = 1
        ORDER BY BINARY repositories.name = :project_name DESC, repositories.name = :repo_name DESC
        LIMIT 2
    ]], {
        user_id = user_id,
        project_name = first_path_segment,
        repo_name = username .. "." .. config.PAGES_HOST_NAME,
        alt_repo_name = username .. "." .. config.PAGES_HOST_NAME_OLD,
    })

    local user_result
    local project_result

    --
    -- We use the `ORDER BY` in the query to ensure that if there is a
    -- project-site it will be the first result.
    --
    if results[1] and tonumber(results[1].project_site) == 1 then
        project_result = results[1]
        user_result = results[2]
    else
        user_result = results[1]
    end

    --
    -- Skip CNAME redirects on Enterprise & for Pages Previews.
    --
    if not config.ENTERPRISE and not pages_preview_domain(domain) then
        --
        -- Check if the project-site has a CNAME and redirect to it if so.
        --
        if valid_result_cname(project_result, username) then
            if project_result.https_redirect == 1 or project_result.public == 0 then
                return { action = "project_redirect", scheme = "https", domain = project_result.cname }
            else
                return { action = "project_redirect", scheme = "http", domain = project_result.cname }
            end
        end

        --
        -- Check if the user-site has a CNAME and redirect to it if so.
        --
        if valid_result_cname(user_result, username) then
            if user_result.https_redirect == 1 or user_result.public == 0 then
                return { action = "redirect", scheme = "https", domain = user_result.cname }
            else
                return { action = "redirect", scheme = "http", domain = user_result.cname }
            end
        end
    end

    --
    -- Resolve to project or user site if we found one.
    --
    if project_result then
        if project_result.hsts_max_age ~= ngx.null then
            hsts_max_age             = tonumber(project_result.hsts_max_age)
            hsts_include_sub_domains = (tonumber(project_result.hsts_include_sub_domains) == 1)
            hsts_preload             = (tonumber(project_result.hsts_preload) == 1)
        end

        if project_result.https_redirect == 1 and scheme == "http" and project_result.public == 1 then
            return { action = "redirect", scheme = "https", domain = domain }
        elseif project_result.public == 1 then
            return {
                action = "resolved",
                page_id = project_result.page_id,
                deployment_token = deployment_token,
                project_site = true,
                hsts_max_age = hsts_max_age,
                hsts_include_sub_domains = hsts_include_sub_domains,
                hsts_preload = hsts_preload,
                repo_nwo = username .. "/" .. project_result.repo,
                revision = project_result.revision,
                public = project_result.public
            }

        -- Accessing a private (project) page using its public URL (orgname-or-username.github.io/repo-name)
        -- redirects to the proper URL on the pages.github.io domain
        elseif project_result.public == 0 and is_defined(project_result.subdomain) then
            return { action = "project_redirect", scheme = "https", domain = project_result.subdomain .. ".pages." .. config.PAGES_HOST_NAME }
        end
    elseif user_result then
        user_result.username = user_id_result.username
        user_result.repo_nwo = user_result.username .. "/" .. user_result.repo

        if user_result.hsts_max_age ~= ngx.null then
            hsts_max_age             = tonumber(user_result.hsts_max_age)
            hsts_include_sub_domains = (tonumber(user_result.hsts_include_sub_domains) == 1)
            hsts_preload             = (tonumber(user_result.hsts_preload) == 1)
        end

        if user_result.https_redirect == 1 and scheme == "http" and user_result.public == 1 then
            return { action = "redirect", scheme = "https", domain = domain }
        elseif user_result.public == 0 and is_github_auth_uri() then
            -- /.github/auth route is only valid for private pages
            -- Add CSP header to /__/auth https://github.com/github/pages-engineering/issues/116
            ngx.header["Content-Security-Policy"] = "default-src 'none'; sandbox; frame-ancestors 'none'"
            local req_args, err = ngx.req.get_uri_args(5)
            if not req_args or err == "truncated" then
                exit(ngx.HTTP_BAD_REQUEST)
            end
            local args = build_query_args(req_args)

            -- Should match an org site:
            -- e.g. https://paper-spa.github.io
            if domain == username .. ".github.io" then
                local result = {
                    action = "resolve_auth_route",
                    domain = domain,
                    subdomain = user_result.subdomain,
                    nonce = args.nonce,
                    page_id = args.page_id,
                    token = args.token,
                    path = args.path,
                    project_site = false,
                    hsts_max_age = hsts_max_age,
                    hsts_include_sub_domains = hsts_include_sub_domains,
                    hsts_preload = hsts_preload,
                    repo_nwo = user_result.repo_nwo,
                    public = user_result.public,
                    revision = user_result.revision
                }
                return resolve_auth_route(result)
            end
        elseif user_result.public == 0 then
            -- private org site (e.g. paper-spa.github.io)
            -- Check if request contains a token that's valid
            local session_token = ngx.var.http_x_pages_token
            if session_token ~= nil then
                return resolve_authenticated(user_result)
            else
                return authenticate(user_result)
            end
        else
            return {
                action = "resolved",
                page_id = user_result.page_id,
                deployment_token = deployment_token,
                project_site = false,
                hsts_max_age = hsts_max_age,
                hsts_include_sub_domains = hsts_include_sub_domains,
                hsts_preload = hsts_preload,
                repo_nwo = user_result.repo_nwo,
                revision = user_result.revision,
                public = user_result.public
            }
        end
    else
        return { action = "not_found" }
    end


    ---
    --- Catch-all 404 case
    ---
    return { action = "not_found" }
end

local function resolve_pages_replicas_via_legacy(page_id)
    -- legacy
    return query([[
        SELECT
            pages_replicas.host,
            pages.built_revision,
            pages_fileservers.datacenter,
            pages_fileservers.non_voting
        FROM pages
        INNER JOIN pages_replicas ON pages_replicas.page_id = pages.id
        INNER JOIN pages_fileservers ON pages_fileservers.host = pages_replicas.host
        WHERE
            pages.id = :page_id
            AND pages_replicas.pages_deployment_id IS NULL
            AND pages_fileservers.online = 1
    ]], { page_id = page_id })
end

local function legacy_resolve_pages_replicas(page_id)
    -- not a legacy build, has pages_replicas.pages_deployment_id!
    local results = query([[
            SELECT
                pages_replicas.host,
                page_deployments.revision AS built_revision,
                pages_fileservers.datacenter,
                pages_fileservers.non_voting
            FROM page_deployments
            INNER JOIN pages_replicas ON pages_replicas.pages_deployment_id = page_deployments.id
            INNER JOIN pages ON page_deployments.page_id = pages.id
            INNER JOIN pages_fileservers ON pages_fileservers.host = pages_replicas.host
            WHERE
                page_deployments.page_id = :page_id
                AND page_deployments.revision = pages.built_revision
                AND pages_fileservers.online = 1
        ]], { page_id = page_id })

    -- legacy
    if results and #results == 0 then
        results = resolve_pages_replicas_via_legacy(page_id)
        datadog:inc("dpages_route", 0.5, { route_type = "legacy" })
    else
        datadog:inc("dpages_route", 0.5, { route_type = "page_deployments_no_deployment_id" })
    end

    return results
end

local function resolve_pages_replicas(page_id, deployment_token)
    if not deployment_token then
        return legacy_resolve_pages_replicas(page_id)
    end

    -- look first for a deployment with that ref_name
    local results = query([[
        SELECT
            pages_replicas.host,
            page_deployments.revision AS built_revision,
            pages_fileservers.datacenter,
            pages_fileservers.non_voting
        FROM page_deployments
        INNER JOIN pages_replicas ON pages_replicas.pages_deployment_id = page_deployments.id
        INNER JOIN pages ON page_deployments.page_id = pages.id
        INNER JOIN pages_fileservers ON pages_fileservers.host = pages_replicas.host
        WHERE
            page_deployments.page_id = :page_id
            AND page_deployments.token = :deployment_token
            AND pages_fileservers.online = 1
    ]], { page_id = page_id, deployment_token = deployment_token })

    datadog:inc("dpages_route", 0.5, { route_type = "page_deployments" })
    return results
end

-- For GHES's use only to trigger lazy build when no replicas exist in the model.
-- Return all pages_fileservers that are online now
local function resolve_dummy_pages_replicas()
    local results = query([[
        SELECT
            host,
            '' AS built_revision,
            datacenter,
            non_voting
        FROM pages_fileservers
        WHERE
            online = 1
    ]], {})
    return results
end

local function is_cachable()
    if ngx.header["X-Origin-Cache"] == "no-store" then return false
    elseif config.TEST then return false
    else return true
    end
end

local function cache(key, ttl, fn)
    local cached = ngx.shared.routes:get(key)

    if cached and is_cachable() then
        ngx.header["X-Origin-Cache"] = "HIT"
        return json:decode(cached)
    end

    local value = fn()

    ngx.shared.routes:set(key, json:encode(value), ttl)

    return value
end

local function route_without_enterprise(req_scheme, domain, path)
    if ngx.re.match(domain, "[\128-\255]") then
        return { action = "not_found" }
    end

    local md, err = ngx.re.match(path, "^/+([^/?]*)(.*)$")

    if not md then
        return { action = "not_found" }
    end

    local first_path_segment, path_tail = md[1], md[2]

    local result = cache("dpages:resolution:" .. req_scheme .. "/" .. domain .. "/" .. first_path_segment, 30, function()
        local pages_site = resolve_pages_site(req_scheme, domain, first_path_segment)
        return scrub_ngx_null(pages_site)
    end)

    if result.action == "project_redirect" then
        result.redirect_uri = path_tail
    end

    -- Pass result through authentication checks if the result is
    -- a private page from the cache
    if result.public == 0 and ngx.header["X-Origin-Cache"] == "HIT" then
        if ngx.var.http_x_pages_token ~= nil then
            result = resolve_authenticated(result)
        else
            return authenticate(result)
        end
    end

    if result.action ~= "resolved" then
        return result
    end

    --
    --
    -- ************************* DELIVER CONTENT PHASE *************************
    -- Here we've resolved a page and a user is authenticated.
    -- Any logic we want to execute before proxying to dpages can be injected here
    -- ************************* DELIVER CONTENT PHASE *************************
    --
    --

    --
    -- Add a search handler to any deployments belonging to github/thehub in dotcom
    --
    if not config.ENTERPRISE and result.repo_nwo == "github/thehub" and str_starts_with(ngx.var.request_uri, github_search_path) then
        local search_args, err = ngx.req.get_uri_args(4)
        -- To prevent query param exhaustion, if there are more than 3 query arguments we treat this as an invalid request
        if not search_args or err == "truncated" then
            exit(ngx.HTTP_BAD_REQUEST)
        end

        local search_start_time = ngx.now()

        -- Search result will be a lua table representing the response payload returned from the internal search endpoint
        -- search_result.body should be a JSON string
        local search_result, err = thehub_search(search_args)

        -- Track latency and number of queries for search
        local hub_search_latency = (ngx.now() - search_start_time) * 1000
        datadog:time("thehub_searcher_latency", hub_search_latency, 1)
        datadog:inc("thehub_searcher_queries")

        -- Don't cache the response from the search backend locally
        ngx.header["X-Origin-Cache"] = "no-store"

        if err then
            ngx.log(ngx.ERR, "Received error from search request: " .. err)
            exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
        elseif search_result.status == ngx.HTTP_OK then
            ngx.header["Content-Type"] = "application/json"
            ngx.print(search_result.body)
            exit(ngx.HTTP_OK)
        end
    end

    local dpages_routes = cache("dpages:route:" .. result.page_id .. ":" .. ngx.md5(result.deployment_token or ""), 1, function()
        local results = resolve_pages_replicas(result.page_id, result.deployment_token)
        local fe_datacenter = datacenter()
        local all_healthy_replicas = {}
        local in_local_datacenter = {}
        local voting_replicas = {}

        -- On GHES only: if no replicas can be found, replace the results with all online pages_fileservers.
        -- The rest of this function will select a pages_fileservers to route the request to so lazy build can
        -- happen there.
        -- NOTE: When a Pages site is being built for the first time, no replicas are available in the model which
        -- means we will display the 503 custom page. This is expected behavior (and kind of a nice feature since it
        -- explains that the site is being built). The risk of building a new site twice is minimized by our
        -- locking mechanisms (one in the lazy build code in Lua, one in the monolith code that triggers the build).
        if config.ENTERPRISE and results and #results == 0 then
            results = resolve_dummy_pages_replicas()
        end

        for k, v in pairs(results) do
            -- the datacenter column is nullable so returns userdata, a lua type that our json library doesn't like.
            -- cast it to a string so it can be json-encodable.
            if v.datacenter ~= ngx.null then
                v.datacenter = tostring(v.datacenter)
            else
                v.datacenter = ""
            end
            if host_is_healthy(v.host, v.datacenter) then
              if v.datacenter ~= "" and v.datacenter == fe_datacenter then
                table.insert(in_local_datacenter, v)
              end

              if v.non_voting == 0 then
                table.insert(voting_replicas, v)
              end

              table.insert(all_healthy_replicas, v)
            end
        end

        routing_result = {}

        -- assign the healthy replicas an ip
        if use_nginx_retry then
            routing_result.healthy_replicas_ips = resolve_hostname(all_healthy_replicas)
            ngx.var.gh_pages_healthy_hosts = dump(routing_result.healthy_replicas_ips)
        end
        
        -- select a host to route to
        local candidates = {}
        
        if not config.ENTERPRISE and #in_local_datacenter > 0 then
            candidates = in_local_datacenter
        elseif #voting_replicas > 0 then
            candidates = voting_replicas
        else
            candidates = all_healthy_replicas
        end
        
        routing_result.selected_host = candidates[math.random(#candidates)]
        return routing_result
    end)

    if use_nginx_retry and dpages_routes.healthy_replicas_ips and #dpages_routes.healthy_replicas_ips > 0 then
        apply_permutation(dpages_routes.healthy_replicas_ips)
        ngx.ctx.healthy_replicas_ips = dpages_routes.healthy_replicas_ips
    end

    local dpages_route = dpages_routes.selected_host

    if dpages_route then
        -- Don't resolve draft domains from the main `built_revision` from the page
        if pages_preview_domain(domain) and result.revision == dpages_route.built_revision then
            return { action = "not_found" }
        end

        local route_result = {
            action = "proxy",
            host = dpages_route.host,
            path = dpages_path(result.page_id, dpages_route.built_revision),
            hsts_max_age = result.hsts_max_age,
            hsts_include_sub_domains = result.hsts_include_sub_domains,
            hsts_preload = result.hsts_preload,
            repo_nwo = result.repo_nwo,
            public = result.public,
            page_id = result.page_id
        }

        if result.project_site then
            if not str_starts_with(path_tail, "/") then
                return { action = "trailing_slash" }
            end

            route_result.proxy_uri = path_tail
            route_result.redirect_prefix = "/" .. first_path_segment .. "/"
        else
            route_result.proxy_uri = path
            route_result.redirect_prefix = "/"
        end

        return route_result
    end

    return { action = "not_found" }
end

local function route_with_enterprise(req_scheme, domain, path)
    local rewrite_regex, redirect_prefix

    -- on Enterprise, PAGES_HOST_NAME_OLD is always set to the host name of the
    -- instance. if subdomain isolation is enabled, PAGES_HOST_NAME is prefixed
    -- with "pages."
    local bare_host_name = config.PAGES_HOST_NAME_OLD

    if streqi(domain, bare_host_name) then
        rewrite_regex = "^/+pages/+([^/]+)(.*)$"
        redirect_prefix = "/pages/"
    end

    if streqi(domain, "pages." .. bare_host_name) then
        rewrite_regex = "^/+([^/]+)(.*)$"
        redirect_prefix = "/"
    end

    if rewrite_regex then
        local md = ngx.re.match(path, rewrite_regex)

        if not md then
            return { action = "not_found" }
        end

        if md[2] == "" then
            return { action = "trailing_slash" }
        end

        local result = route_without_enterprise(req_scheme, md[1] .. "." .. config.PAGES_HOST_NAME, md[2])

        if result.action == "proxy" then
            result.redirect_prefix = redirect_prefix .. md[1] .. result.redirect_prefix
        end

        return result
    end

    return route_without_enterprise(req_scheme, domain, path)
end

local route

if config.ENTERPRISE then
    route = route_with_enterprise
else
    route = route_without_enterprise
end

-- health checks
local function is_health_check_user_agent()
  return ngx.var.http_user_agent and
      (
        str_starts_with(ngx.var.http_user_agent, "Consul") or
        str_starts_with(ngx.var.http_user_agent, "Pingdom")
      )
end

local function is_health_check(request_uri)
    return str_starts_with(request_uri, "/_ping") and
    (
        ngx.var.host == "pages-origin.github.com" or
        is_health_check_user_agent()
    )
end

local function health_check_code(request_uri)
    if request_uri == "/_ping"             then return ngx.HTTP_OK
    elseif request_uri == "/_ping/fastly"  then return ngx.HTTP_OK
    elseif request_uri == "/_ping/haproxy" then return ngx.HTTP_OK
    elseif request_uri == "/_ping/pingdom" then return ngx.HTTP_OK
    elseif request_uri == "/_ping/consul"  then return ngx.HTTP_OK
    end

    return ngx.HTTP_NOT_FOUND
end

local function acme_key_authorization(domain, path)
  if str_starts_with(path, "/.well-known/acme-challenge/") then
    local result = query_one([[
        SELECT challenge_path, challenge_response, alt_challenge_path, alt_challenge_response
        FROM page_certificates
        WHERE domain = :domain OR alt_domain = :domain
    ]], { domain = domain })

    if result then
      if result.challenge_path == path then
        return { status = "found", response = result.challenge_response }
      elseif result.alt_challenge_path == path then
        return { status = "found", response = result.alt_challenge_response }
      end
      return { status = "notfound" }
    end
  end
end

--
-- Routing logic starts here
--

local request_uri = ngx.var.uri

-- Block FLoC requests on github.io domains
if str_ends_with(ngx.var.host, config.PAGES_HOST_NAME) then
    ngx.header["Permissions-Policy"] = "interest-cohort=()"
end

if ngx.var.http_x_pages_lab then
    ngx.header["X-Pages-Group"] = pages_group()
end

if is_health_check(request_uri) then
    local health_code = health_check_code(request_uri)

    datadog:close()
    metrics:close()

    ngx.header["Content-Type"] = "text/plain"
    ngx.header["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'; img-src data:; connect-src 'self'"
    ngx.status = health_code
    ngx.print(health_code >= 300 and "fail" or "ok")
    ngx.exit(health_code)
end

-- ACME domain control challenge response for Let's Encrypt
local acme_response = acme_key_authorization(ngx.var.host, request_uri)
if acme_response then
  if acme_response.status == "found" then
    ngx.status = ngx.HTTP_OK
    ngx.print(acme_response.response)
    exit(ngx.HTTP_OK)
  else
    exit(ngx.HTTP_NOT_FOUND)
  end
end

local private_pages_scheme

if ngx.var.http_fastly_ssl then
    private_pages_scheme = "https"
else
    private_pages_scheme = ngx.var.http_x_forwarded_proto or ngx.var.scheme
end

-- private pages redirect to /.github/auth
if private_pages_scheme == "https" and ngx.var.host == "pages-auth.github.com" and str_starts_with(ngx.var.request_uri, "/redirect") then
    if not ngx.var.referrer == "github.com" then
        exit(ngx.HTTP_NOT_FOUND)
    end

    -- Retrieve url query params.
    local req_args, err = ngx.req.get_uri_args(5)
    if err == "truncated" then
        ngx.log(ngx.ERR, "Too many query arguments sent")
        exit(ngx.HTTP_BAD_REQUEST)
    end

    local args = build_query_args(req_args)

    local token_validation = validate_session_token(args.page_id, args.token)
    if not token_validation or token_validation.status ~= ngx.HTTP_OK then
        exit(ngx.HTTP_UNAUTHORIZED)
    end

    local url = liburl.parse()
    url.host = args.site
    url.scheme = "https"
    url.path = github_auth_path
    url.query = url.buildQuery({
        path = args.path,
        page_id = args.page_id,
        nonce = args.nonce,
        token = args.token,
        deployment_token = args.deployment_token
    })

    ngx.header["Location"] = url:build()
    exit(ngx.HTTP_MOVED_TEMPORARILY)
end

if ngx.var.host == "pages-origin.github.com" and ngx.var.request_uri == "/auth" then
    -- Extract pages host from header
    local pages_host = ngx.var.http_x_pages_host
    -- Extract client IP address
    local client_ip = get_client_ip()
    -- Extract token from header
    local session_token = ngx.var.http_x_pages_token
    -- Need to get the page ID and user ID from somewhere
    local page_id = ngx.var.http_x_pages_id
    -- Fastly sends a base64 encoded hash that we can verify
    -- with a secret to ensure the request came from Fastly
    local fastly_sig = ngx.var.http_x_pages_fastlysig

    if not page_id or not session_token or not fastly_sig or not pages_host then
        -- Incorrect headers found. Send 404 to prevent leaking
        -- that this route expects some kind of data
        exit(ngx.HTTP_NOT_FOUND)
    end

    local string_to_sign = page_id .. ":" .. session_token
    local digest = ngx.encode_base64(ngx.hmac_sha1(config.FASTLY_SHARED_KEY, string_to_sign))

    -- Signatures match
    if digest == fastly_sig then

        -- Validate the session token
        local cache_key = session_token .. ":" .. page_id .. ":" .. client_ip
        local res = token_cache(cache_key, 30, function()
            return validate_session_token(page_id, session_token)
        end)

        -- If the session token is valid, let's make sure we are authenticating against the right Pages site
        if res.status == ngx.HTTP_OK and res.pages_auth then

            -- Resolve the incoming hostname from Fastly
            local resolution_result = cache("dpages:resolution:" .. "https" .. "/" .. pages_host .. "/" .. "/", 30, function()
                local pages_site = resolve_pages_site("https", pages_host, "/")
                return scrub_ngx_null(pages_site)
            end)

            -- Validate the resolution yields a private Pages sites with a matching id
            if resolution_result.action == "resolved" and tostring(resolution_result.page_id) == page_id and resolution_result.public == 0 then
                -- Surrogate-Control header is stripped by Fastly and not sent back to the browser
                -- This tells Fastly it's ok to cache this response for 30 seconds.
                -- The cache key for this is calculated based on the `token` + `page_id` to ensure
                -- it is only cached for the combination of the user + the page they're requesting.
                --
                ngx.header["Surrogate-Control"] = "max-age=30"
                exit(ngx.HTTP_OK)

            -- Fails
            else
                -- Extract optional fields for the error message
                local resolution_page_id = "<na>"
                if is_defined(resolution_result.page_id) then
                    resolution_page_id = resolution_result.page_id
                end
                local resolution_public = "<na>"
                if is_defined(resolution_result.public) then
                    resolution_public = resolution_result.public
                end
                ngx.log(ngx.ERR, "pages-origin.github.com/auth: Unable to resolve private page site for host=" .. pages_host .. ", action=" .. resolution_result.action .. ", incoming page_id=" .. page_id .. " (expected page_id=" .. resolution_page_id .. "), public=" .. resolution_public)
                exit(ngx.HTTP_UNAUTHORIZED)
            end
        else
            -- Exits with whatever status code we get from the internal API
            ngx.log(ngx.ERR, "pages-origin.github.com/auth: Error from GitHub internal auth API body=" .. res.body)
            exit(res.status)
        end
    else
        -- Signatures don't match
        ngx.log(ngx.ERR, "pages-origin.github.com/auth: Signature header could not be verified. Have shared secrets between Fastly/Pages-Lua have changed?")
        exit(ngx.HTTP_BAD_REQUEST)
    end
end

-- some special case redirects
if ngx.var.host == "github.io" then
    ngx.header["Location"] = "https://pages.github.com/"
    exit(ngx.HTTP_MOVED_PERMANENTLY)
end

if ngx.var.host == "git-lfs.github.com" then
    ngx.header["Location"] = "https://git-lfs.com/"
    exit(ngx.HTTP_MOVED_PERMANENTLY)
end

if ngx.var.host == "libgit2.github.com" then
    ngx.header["Location"] = "https://libgit2.org/"
    exit(ngx.HTTP_MOVED_PERMANENTLY)
end

if ngx.var.host == "boxen.github.com" then
    ngx.header["Location"] = "https://github.com/boxen/our-boxen/#our-boxen"
    exit(ngx.HTTP_MOVED_PERMANENTLY)
end

if ngx.var.host == "dodgeball.github.com" then
    ngx.header["Location"] = "https://dodgeball.brightfunds.org/"
    exit(ngx.HTTP_MOVED_PERMANENTLY)
end

if ngx.var.host == "try.github.com" or ngx.var.host == "try.github.io" then
    ngx.header["Location"] = "https://docs.github.com/en/github/getting-started-with-github/set-up-git"
    exit(ngx.HTTP_MOVED_PERMANENTLY)
end

if ngx.var.host == "twitter.github.io" and str_starts_with(ngx.var.request_uri, "/bootstrap/") then
    ngx.header["Location"] = "http://getbootstrap.com/2.3.2/"
    exit(ngx.HTTP_MOVED_PERMANENTLY)
end


if ngx.var.host == "electron.atom.io" then
    ngx.header["Location"] = "https://www.electronjs.org"

    if ngx.var.request_uri then
      ngx.header["Location"] = ngx.header["Location"] .. ngx.var.request_uri
    end

    exit(ngx.HTTP_MOVED_PERMANENTLY)
end

if ngx.var.host == "octo.github.com" then
    ngx.header["Location"] = "https://next.github.com"

    if ngx.var.request_uri then
      ngx.header["Location"] = ngx.header["Location"] .. ngx.var.request_uri
    end

    exit(ngx.HTTP_MOVED_PERMANENTLY)
end

if ngx.var.host == "mac.github.com" or ngx.var.host == "windows.github.com" then
    if ngx.var.request_uri == "/help.html" then
        ngx.header["Location"] = "https://help.github.com/desktop"
    else
        ngx.header["Location"] = "https://desktop.github.com/"
    end
    exit(ngx.HTTP_MOVED_PERMANENTLY)
end

if ngx.var.host == "natfriedman.github.io" then
    ngx.header["Location"] = "https://nat.github.io" .. ngx.var.request_uri
    exit(ngx.HTTP_MOVED_PERMANENTLY)
end

if ngx.var.host == "githubengineering.com" and ngx.var.uri == "/atom.xml" then
    ngx.header["Location"] = "https://github.blog/engineering.atom"
    exit(ngx.HTTP_MOVED_PERMANENTLY)
end

-- The categories from the old blog (https://blog.github.com) have been slightly modified for the
-- new blog (https://github.blog).
local blog_categories = {
    ["announcements"] = "product",
    ["business"]      = "at-work",
    ["community"]     = "community",
    ["data"]          = "insights",
    ["education"]     = "community/education",
    ["engineering"]   = "engineering",
    ["events"]        = "community/events",
    ["policy"]        = "company/policy"
}

-- Remaps old blog feed paths to new blog feed paths. If the feed is for a category, map from the
-- old category (/:old_slug.atom) to the new category (/:new_slug.atom). Otherwise, make no change
-- to the path.
local function new_blog_feed_path(path)
    -- Drop the leading "/" and ".atom" extension, we'll add them back at the end.
    old_slug = path:sub(2, path:len() - 5)
    new_slug = blog_categories[old_slug] or old_slug

    return "/" .. new_slug .. ".atom"
end

-- Redirect requests matching <user>.github.io/<user>.github.io to <user>.github.io
local function redirect_if_first_path_segment_is_user_page(req_scheme, host, request_uri)
    local domain_match, err = ngx.re.match(host, [[([\w-]+)\.(.*)]])
    if err then
        ngx.log(ngx.ERR, "Unable to parse domain " .. host .. " for potential username match: ", err)
    elseif is_defined(domain_match) then
        local username = domain_match[1]
        local domain = domain_match[2]
        if streqi(domain, config.PAGES_HOST_NAME) or streqi(domain, config.PAGES_HOST_NAME_OLD) then
            if streqi(host, extract_first_path_segment(request_uri)) then
                local original_uri = req_scheme .. "://" .. host .. request_uri
                local redirected_uri = req_scheme .. "://" .. host
                ngx.log(ngx.ERR, "Redirecting " .. original_uri .. " to " .. redirected_uri)
                ngx.header["Location"] = redirected_uri
                datadog:inc("first_path_segment_is_user_page")
                exit(ngx.HTTP_MOVED_PERMANENTLY)
            end
        end
    end
end

if ngx.var.host == "blog.github.com" then
    host = "https://github.blog"
    path = ngx.var.request_uri

    if str_starts_with(path, "/category") then
        path = "/"
    elseif str_ends_with(path, ".atom") then
        path = new_blog_feed_path(path)
    end

    ngx.header["Location"] = host .. path
    exit(ngx.HTTP_MOVED_PERMANENTLY)
end

-- Maps the 10 guides from guides.github.com to the equivalent
-- content on docs.github.com
local guides_docs_categories = {
    ["/introduction/flow/"]          = "/get-started/quickstart/github-flow",
    ["/activities/socialize/"]       = "/get-started/quickstart/be-social",
    ["/activities/citable-code/"]    = "/repositories/archiving-a-github-repository/referencing-and-citing-content",
    ["/features/issues/"]            = "/issues/tracking-your-work-with-issues/about-issues",
    ["/features/mastering-markdown/"]= "/github/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax",
    ["/features/pages/"]             = "/pages/quickstart",
    ["/activities/hello-world/"]     = "/get-started/quickstart/hello-world",
    ["/introduction/git-handbook/"]  = "/get-started/using-git/about-git",
    ["/features/wikis/"]             = "/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes",
    ["/activities/forking/"]         = "/get-started/quickstart/contributing-to-projects"
}

-- Redirect the 10 guides from guides.github.com to the equivalent
-- content on docs.github.com
if ngx.var.host == "guides.github.com" then
    host = "https://docs.github.com"
    path = ngx.var.request_uri

    if not str_ends_with(path, '/') then
        path = path .. '/'
     end

    -- Redirect guides.github.com/feed
    -- and guide.github.com to docs.github.com
    if guides_docs_categories[path] ~= nil then
        ngx.header["Location"] = host .. guides_docs_categories[path]
        exit(ngx.HTTP_MOVED_PERMANENTLY)
    else
        ngx.header["Location"] = host
        exit(ngx.HTTP_MOVED_PERMANENTLY)
    end
end

-- Load resource hub redirects from outside this file since there's a bunch of them
local resource_hub_redirects = require("redirects/resource_hub")
-- This will only check if a redirect exists and process it accordingly
-- Otherwise the request continues on to resolve the page normally.
if ngx.var.host == "resources.github.com" then
    host = "https://resources.github.com"
    path = ngx.var.request_uri

    local destination = resource_hub_redirects[path]
    if destination == 410 then
        return http_gone()
    end
    if destination ~= nil and str_starts_with(destination, "/") then
        ngx.header["Location"] = host .. destination
        exit(ngx.HTTP_MOVED_PERMANENTLY)
    end
    -- If the destination starts with https, don't append host
    if destination ~= nil and str_starts_with(destination, "https://") then
        ngx.header["Location"] = destination
        exit(ngx.HTTP_MOVED_PERMANENTLY)
    end
end

-- Redirect codeql.github.com/docs/codeql-cli
-- to docs.github.com/code-security/codeql-cli
if ngx.var.host == "codeql.github.com" then
    host = "https://docs.github.com"
    path = ngx.var.request_uri
    if str_starts_with(path, "/docs/codeql-cli") then
        target_path = path:gsub("/docs/codeql%-cli", "/code-security/codeql-cli", 1)
        ngx.header["Location"] = host .. target_path
        exit(ngx.HTTP_MOVED_PERMANENTLY)
    end
end

-- Redirect codeql.github.com/docs/codeql-for-visual-studio-code 
-- to docs.github.com/code-security/codeql-for-vs-code
if ngx.var.host == "codeql.github.com" then
    host = "https://docs.github.com"
    path = ngx.var.request_uri
    if str_starts_with(path, "/docs/codeql-for-visual-studio-code") then
        target_path = path:gsub("/docs/codeql%-for%-visual%-studio%-code", "/code-security/codeql-for-vs-code", 1)
        ngx.header["Location"] = host .. target_path
        exit(ngx.HTTP_MOVED_PERMANENTLY)
    end
end

-- The categories from the developer.github.com site that have beeen
-- migrated to docs.github.com
local developer_docs_categories = {
    "/actions",
    "/apps",
    "/forum",
    "/marketplace",
    "/partnerships",
    "/v3",
    "/v4",
    "/webhooks",
    "/enterprise/2.21",
    "/enterprise/2.20",
    "/enterprise/2.19"
}

if ngx.var.host == "developer.github.com" then
    host = "https://docs.github.com"
    path = ngx.var.request_uri

    -- Redirect the landing page only but not
    -- developer.github.com/changes.atom or
    -- https://developer.github.com/graphql_changes.atom
    if path == "/" then
        ngx.header["Location"] = host .. path
        exit(ngx.HTTP_MOVED_PERMANENTLY)
    elseif str_starts_with(path, "/changes/2021-04-05-behind-githubs-new-authentication-token-formats") then
        ngx.header["Location"] = "https://github.blog/2021-04-05-behind-githubs-new-authentication-token-formats/"
        exit(ngx.HTTP_MOVED_PERMANENTLY)
    else
        for i, category in ipairs(developer_docs_categories) do
            if str_starts_with(path, category) then
                ngx.header["Location"] = host .. path
                exit(ngx.HTTP_MOVED_PERMANENTLY)
            end
        end
    end
end

if not ngx.var.host then
    exit(ngx.HTTP_NOT_FOUND)
end

-- Geoblocking is done on a per-hostname basis, with the option to limit by a particular project.
-- Add the hostname below (with optional project name like a path) and the value of the header.
-- Country codes are ISO-3166-1 values.
local geoblock = {
  ["bannerproxy.github.io"]                 = "RU",
  ["bbproxy.github.io"]                     = "RU",
  ["beznadyoga.com"]                        = "RU",
  ["cazino-booi.github.io"]                 = "RU",
  ["esthercol.github.io"]                   = "RU",
  ["fast-die.github.io"]                    = "RU",
  ["jozzcasino.github.io"]                  = "RU",
  ["jozz-casino.github.io"]                 = "RU",
  ["leonaccess.github.io"]                  = "RU",
  ["mdz-rus.github.io"]                     = "RU",
  ["otkroveniya.github.io"]                 = "RU",
  ["snustop.github.io"]                     = "RU",
  ["spinslots.github.io"]                   = "RU",
  ["thesnipergodproxy.github.io"]           = "RU",
  ["cherurg.github.io/investing-coins"]     = "RU",
  ["vulkanolog.github.io"]                  = "RU",
  ["wm2ch.github.io/wm2ch"]                 = "RU",
  ["pimopavez.github.io/metsikayet"]        = "TR",
  ["yangwenbo99.github.io/leavehomesafer"]  = "HK",
  ["bartertone.github.io/leavehomesafer"]   = "HK",
  ["evilboy1973.github.io"]                 = "HK"
}

if geoblock[ngx.var.host] ~= nil then
  ngx.header["X-Geo-Block-List"] = geoblock[ngx.var.host]
else
  local host_plus_first_path_segment = ngx.var.host .. "/" .. extract_first_path_segment(ngx.var.request_uri)
  if geoblock[host_plus_first_path_segment] ~= nil then
    ngx.header["X-Geo-Block-List"] = geoblock[host_plus_first_path_segment]
  end
end

local req_scheme

if ngx.var.http_fastly_ssl then
  req_scheme = "https"
else
  req_scheme = ngx.var.http_x_forwarded_proto or ngx.var.scheme
end

redirect_if_first_path_segment_is_user_page(req_scheme, ngx.var.host, ngx.var.request_uri)

local result = route(req_scheme, ngx.var.host, ngx.var.request_uri)

if is_defined(result.hsts_max_age) and req_scheme == "https" then
    local hsts_header = "max-age=" .. result.hsts_max_age
    if result.hsts_include_sub_domains then
        hsts_header = hsts_header .. "; includeSubDomains"
    end
    if result.hsts_preload then
        hsts_header = hsts_header .. "; preload"
    end
    ngx.req.set_header("Strict-Transport-Security", hsts_header)
else
    -- Remove the HSTS header if it was set previously since it is a response header only
    -- See bug bounty: https://github.com/github/pages-engineering/issues/1031
    ngx.req.set_header("Strict-Transport-Security", nil)
end

if result.action == "proxy" then
    if use_nginx_retry then
      ngx.var.gh_pages_host = "backend"
      ngx.var.gh_pages_port = ""
      ngx.var.gh_balancer_by_lua = "True"
    else
      ngx.var.gh_pages_host = fqdn(result.host)
    end
    ngx.var.gh_pages_path = result.path
    ngx.var.gh_pages_proxy_uri = result.proxy_uri
    ngx.var.gh_pages_redirect_prefix = result.redirect_prefix

    -- Define the header to use as our rate limiting key: hash of (client IP + hostname)
    if is_defined(ngx.var.gh_pages_client_key) then
        -- Try to get the client IP from Fastly, then
        -- from X-Real-IP (from GLB), then
        -- fallback to a constant (which would heavily rate limit anything we don't expect)
        local incoming_ip = ""
        if is_defined(ngx.var.http_fastly_client_ip) and ngx.var.http_fastly_client_ip ~= "" then
            incoming_ip = ngx.var.http_fastly_client_ip
        elseif is_defined(ngx.var.http_x_real_ip) and ngx.var.http_x_real_ip ~= "" then
            incoming_ip = ngx.var.http_x_real_ip
        else
            incoming_ip = "unknown"
        end
        ngx.var.gh_pages_client_key = ngx.md5(incoming_ip .. ":" .. ngx.var.host)
    end

    -- $gh_pages_repo_nwo is not defined in the Enterprise nginx config. We must check for its existence.
    if is_defined(ngx.var.gh_pages_repo_nwo) and is_defined(result.repo_nwo) then
        ngx.var.gh_pages_repo_nwo = result.repo_nwo
    end

    if is_defined(ngx.var.gh_pages_public) and is_defined(result.public) then
        ngx.var.gh_pages_public = result.public
    end

    if is_defined(ngx.var.gh_pages_page_id) and is_defined(result.page_id) then
        ngx.var.gh_pages_page_id = result.page_id
    end

    exit(ngx.OK) -- note OK != HTTP_OK, OK will continue to run the rest of the request.
elseif result.action == "trailing_slash" then
    local url = liburl.parse(ngx.var.request_uri)
    url.scheme = req_scheme
    url.host = ngx.var.host
    url.path = url.path .. "/"
    ngx.header["Location"] = url:build()
    exit(ngx.HTTP_MOVED_PERMANENTLY)
elseif result.action == "redirect" then
    -- remove CR or LF characters from the domain to protect us from header
    -- splitting attacks:
    local domain = result.domain:gsub("[\r\n]", "")
    ngx.header["Location"] = result.scheme .. "://" .. domain .. ngx.var.request_uri
    exit(ngx.HTTP_MOVED_PERMANENTLY)
elseif result.action == "project_redirect" then
  -- remove CR or LF characters from the domain to protect us from header
  -- splitting attacks:
  local domain = result.domain:gsub("[\r\n]", "")
  ngx.header["Location"] = result.scheme .. "://" .. domain .. result.redirect_uri
  exit(ngx.HTTP_MOVED_PERMANENTLY)
elseif result.action == "not_found" then
    exit(ngx.HTTP_NOT_FOUND)
elseif result.action == "access_forbidden" then
    local access_forbidden_html =
        io.open(config.PUBLIC_PATH .. "/403.html")
        :read("*all")

    ngx.header["Content-Type"] = "text/html"
    ngx.header["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'; img-src data:; connect-src 'self'"
    ngx.status = ngx.HTTP_FORBIDDEN
    ngx.print(access_forbidden_html)
    exit(ngx.HTTP_FORBIDDEN)
elseif result.action == "ip_forbidden" then
    local ip_forbidden_html =
        io.open(config.PUBLIC_PATH .. "/403-ip-disallow.html")
        :read("*all")
        :gsub("{IP_ADDRESS}", result.ip_address)

    ngx.header["Content-Type"] = "text/html"
    ngx.header["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'; img-src data:; connect-src 'self'"
    ngx.status = ngx.HTTP_FORBIDDEN
    ngx.print(ip_forbidden_html)
    exit(ngx.HTTP_FORBIDDEN)
elseif result.action == "interstitial" then
    local interstitial_html =
        io.open(config.PUBLIC_PATH .. "/interstitial.html")
        :read("*all")
        :gsub("{USERNAME}", result.username)

    datadog:inc("interstitial_request")
    ngx.header["X-Pages-Interstitial"] = "1"
    ngx.header["Content-Type"] = "text/html"
    ngx.header["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'; img-src data:; connect-src 'self'"
    ngx.status = ngx.HTTP_NOT_FOUND
    ngx.print(interstitial_html)
    exit(ngx.HTTP_NOT_FOUND)
end
