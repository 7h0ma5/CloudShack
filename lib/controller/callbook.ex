defmodule CloudShack.Controller.Callbook do
  use Plug.Router
  use Plug.ErrorHandler

  plug CloudShack.Plug.Api

  plug :match
  plug :dispatch

  get "/:call" do
    case Callbook.HamQTH.lookup(call) do
      {:ok, result} -> send_resp(conn, 200, Poison.encode!(result))
      {:not_found} -> send_resp(conn, 404, "Callsign not found")
      {:unauthorized} -> send_resp(conn, 401, "Unauthorized")
      {:error} -> send_resp(conn, 500, "Internal error")
    end
  end
end
