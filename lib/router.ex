defmodule Cloudshack.Router do
  use Plug.Router
  use Plug.ErrorHandler

  @static_path Path.join("#{:code.priv_dir(:cloudshack)}", "static/")

  plug Plug.Static,
    at: "/",
    from: @static_path,
    only_match: ["images", "css", "js", "templates", "fonts", "app"]

  plug :match
  plug :dispatch

  get "/version" do
    send_resp(conn, 200, "0.5.0")
  end

  get "/" do
    conn
    |> put_resp_header("content-type", "text/html")
    |> send_file(200, Path.join(@static_path, "index.html"))
  end

  forward "/callbook", to: Controller.Callbook

  #match _ do
  #  send_resp(conn, 404, "oops")
  #end
end
