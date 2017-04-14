defmodule CloudShack.Router do
  use Plug.Router
  use Plug.ErrorHandler

  @static_path Path.join("#{:code.priv_dir(:cloudshack)}", "static/")
  @map_path Path.join("#{:code.priv_dir(:cloudshack)}", "map/")

  plug Plug.Static,
    at: "/images/map",
    from: @map_path

  plug Plug.Static,
    at: "/",
    from: @static_path,
    only_match: ["images", "css", "js", "templates", "fonts", "app"]

  plug :match
  plug :dispatch

  get "/version" do
    version = Application.spec(:cloudshack, :vsn)
    send_resp(conn, 200, version)
  end

  get "/" do
    conn
    |> put_resp_header("content-type", "text/html")
    |> send_file(200, Path.join(@static_path, "index.html"))
  end

  forward "/flag", to: CloudShack.Controller.Flag
  forward "/dxcc", to: CloudShack.Controller.DXCC
  forward "/callbook", to: CloudShack.Controller.Callbook
  forward "/contacts", to: CloudShack.Controller.Contacts
  forward "/profiles", to: CloudShack.Controller.Profiles
  forward "/config", to: CloudShack.Controller.Config

  match _ do
    send_resp(conn, 404, "not found")
  end
end
