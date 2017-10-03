defmodule CloudShack.Controller.Data do
  use Plug.Router
  use Plug.ErrorHandler

  plug CloudShack.Plug.Api

  plug :match
  plug :dispatch

  get "/modes" do
    result = Data.modes |> Poison.encode!
    send_resp(conn, 200, result)
  end

  get "/bands" do
    result = Data.bands |> Poison.encode!
    send_resp(conn, 200, result)
  end

  get "/dxcc" do
    result = Data.dxcc_entities |> Poison.encode!
    send_resp(conn, 200, result)
  end
end
