defmodule CloudShack.Controller.Config do
  use Plug.Router
  use Plug.ErrorHandler

  plug CloudShack.Plug.Api

  plug :match
  plug :dispatch

  get "/" do
    result = CloudShack.Config.get |> Poison.encode!

    send_resp(conn, 200, result)
  end

  post "/" do
    {:ok, body, conn} = read_body(conn)

    body
      |> Poison.decode!(keys: :atoms!)
      |> CloudShack.Config.set

    send_resp(conn, 200, "ok")
  end
end
