defmodule CloudShack.Controller.DXCC do
  use Plug.Router
  use Plug.ErrorHandler

  plug CloudShack.Plug.Api

  plug :match
  plug :dispatch

  get "/:call" do
    case DXCC.lookup(call) do
      nil -> send_resp(conn, 404, "DXCC not found")
      result -> send_resp(conn, 200, Poison.encode!(result))
    end
  end
end
