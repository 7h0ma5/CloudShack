defmodule Cloudshack.Plug.Api do
  import Plug.Conn

  def init(options) do
    options
  end

  def call(conn, _opts) do
    conn
    |> fetch_query_params
    |> put_resp_content_type("application/json")
  end
end
