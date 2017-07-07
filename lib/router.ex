defmodule CloudShack.Router do
  use Plug.Router
  use Plug.ErrorHandler

  plug Plug.Static,
    at: "/images/map",
    from: {:cloudshack, "priv/map"}

  plug Plug.Static,
    at: "/",
    from: :cloudshack,
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
    |> send_file(200, Path.join([:code.priv_dir(:cloudshack),
                                "static", "index.html"]))
  end

  forward "/flag", to: CloudShack.Controller.Flag
  forward "/dxcc", to: CloudShack.Controller.DXCC
  forward "/callbook", to: CloudShack.Controller.Callbook
  forward "/contacts", to: CloudShack.Controller.Contacts
  forward "/profiles", to: CloudShack.Controller.Profiles
  forward "/config", to: CloudShack.Controller.Config

  def handle_errors(conn, %{kind: _kind, reason: _reason, stack: _stack}) do
    send_resp(conn, conn.status, "Something went wrong")
  end
end
