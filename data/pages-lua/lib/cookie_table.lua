-- Adapted from https://github.com/cloudflare/lua-resty-cookie/blob/master/lib/resty/cookie.lua
local new_tab = function () return {} end

local function get_cookie_table(text_cookie)
  local byte = string.byte
  local sub = string.sub
  if type(text_cookie) ~= "string" then
      ngx.log(ngx.ERR, string.format("expect text_cookie to be \"string\" but found %s",
              type(text_cookie)))
      return {}
  end

  local EQUAL         = byte("=")
  local SEMICOLON     = byte(";")
  local SPACE         = byte(" ")
  local HTAB          = byte("\t")

  local EXPECT_KEY    = 1
  local EXPECT_VALUE  = 2
  local EXPECT_SP     = 3

  local n = 0
  local len = #text_cookie

  for i=1, len do
      if byte(text_cookie, i) == byte(";") then
          n = n + 1
      end
  end


  local cookie_table  = new_tab(0, n + 1)

  local state = EXPECT_SP
  local i = 1
  local j = 1
  local key, value

  while j <= len do
      if state == EXPECT_KEY then
          if byte(text_cookie, j) == EQUAL then
              key = sub(text_cookie, i, j - 1)
              state = EXPECT_VALUE
              i = j + 1
          end
      elseif state == EXPECT_VALUE then
          if byte(text_cookie, j) == SEMICOLON
                  or byte(text_cookie, j) == SPACE
                  or byte(text_cookie, j) == HTAB
          then
              value = sub(text_cookie, i, j - 1)
              cookie_table[key] = value

              key, value = nil, nil
              state = EXPECT_SP
              i = j + 1
          end
      elseif state == EXPECT_SP then
          if byte(text_cookie, j) ~= SPACE
              and byte(text_cookie, j) ~= HTAB
          then
              state = EXPECT_KEY
              i = j
              j = j - 1
          end
      end
      j = j + 1
  end

  if key ~= nil and value == nil then
      cookie_table[key] = sub(text_cookie, i)
  end

  return cookie_table
end

return get_cookie_table