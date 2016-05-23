defmodule CloudShack.Controller.Contacts do
  use Plug.Router
  use Plug.ErrorHandler

  plug CloudShack.Plug.Api

  plug :match
  plug :dispatch

  get "/" do
    options = %{"limit" => 10, "include_docs" => true, "descending" => true}
      |> Map.merge(conn.query_params)

    {:ok, results} = Database.get
      |> CouchDB.Database.view("logbook", "byDate", options)

    send_resp(conn, 200, results)
  end

  get "/_stats" do
    options = %{"group_level" => 3}
      |> Map.merge(conn.query_params)

    {:ok, results} = Database.get
      |> CouchDB.Database.view("logbook", "stats", options)

    send_resp(conn, 200, results)
  end

  get "/_view/:view" do
    options = %{"limit" => 10, "include_docs" => true, "descending" => true}
      |> Map.merge(conn.query_params)

    {:ok, results} =  Database.get
      |> CouchDB.Database.view("logbook", view, options)

    send_resp(conn, 200, results)
  end

  get "/:id" do
    {:ok, result} =  Database.get
      |> CouchDB.Database.get(id)

    send_resp(conn, 200, result)
  end

  post "/" do
    {:ok, body, conn} = read_body(conn)

    profile = CloudShack.State.get(:profile)

    doc = body
      |> Poison.decode!
      |> Map.merge(profile)
      |> Contact.update_band
      |> Poison.encode!

    {:ok, result} = Database.get
      |> CouchDB.Database.insert(doc)

    send_resp(conn, 200, result)
  end

  delete "/:id" do
    rev = conn.query_params["rev"]

    {:ok, result} = Database.get
      |> CouchDB.Database.delete(id, rev)

    send_resp(conn, 200, result)
  end
end
