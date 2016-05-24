defmodule CloudShack.Controller.Profiles do
  use Plug.Router
  use Plug.ErrorHandler

  plug CloudShack.Plug.Api

  plug :match
  plug :dispatch

  get "/" do
    options = %{"include_docs" => true}
      |> Map.merge(conn.query_params)

    {:ok, results} = Database.profiles
      |> CouchDB.Database.all_docs(options)

    send_resp(conn, 200, results)
  end

  get "/:id" do
    {:ok, result} = Database.profiles
      |> CouchDB.Database.get(id)

    send_resp(conn, 200, result)
  end

  post "/" do
    {:ok, body, conn} = read_body(conn)

    {:ok, result} = Database.profiles
      |> CouchDB.Database.insert(body)

    send_resp(conn, 200, result)
  end

  post "/activate" do
    {:ok, body, conn} = read_body(conn)

    {:ok, result} = Database.profiles
      |> CouchDB.Database.get(body)

    profile = result |> Poison.decode!

    CloudShack.State.set(:profile, profile)

    send_resp(conn, 200, result)
  end

  delete "/:id" do
    rev = conn.query_params["rev"]

    {:ok, result} = Database.contacts
      |> CouchDB.Database.delete(id, rev)

    send_resp(conn, 200, result)
  end
end
