defmodule CloudShack.Controller.Flag do
  use Plug.Router
  use Plug.ErrorHandler

  @flag_path Path.join("#{:code.priv_dir(:cloudshack)}", "flags/")

  plug :match
  plug :dispatch

  get "/:res/:id" do
    get_flag(conn, id, res)
  end

  get "/:id" do
    get_flag(conn, id)
  end

  def get_flag(conn, id, res \\ "32") do
    {id, _} = Integer.parse(id)

    flag = case Data.lookup_dxcc(id) do
      %{flag: flag} -> flag
      _ -> "unknown"
    end

    conn
      |> put_resp_header("content-type", "image/png")
      |> put_resp_header("cache-control", "public, max-age=86400000")
      |> send_file(200, Path.join([@flag_path, res, "#{flag}.png"]))
  end
end
