defmodule Controller.Contacts do
  use Plug.Router
  use Plug.ErrorHandler

  plug Cloudshack.Api

  plug :match
  plug :dispatch

  get "/" do
    options = %{"limit" => 10, "include_docs" => true, "descending" => true}
      |> Map.merge(conn.query_params)

    {:ok, results} = Couchdb.connect
      |> Couchdb.Server.database("user_dl2ic")
      |> Couchdb.Database.view("logbook", "byDate", options)

    send_resp(conn, 200, results)
  end

  get "/_stats" do
    options = %{"group_level" => 3}
      |> Map.merge(conn.query_params)

    {:ok, results} = Couchdb.connect
      |> Couchdb.Server.database("user_dl2ic")
      |> Couchdb.Database.view("logbook", "stats", options)

    send_resp(conn, 200, results)
  end

  get "/_view/:view" do
    options = %{"limit" => 10, "include_docs" => true, "descending" => true}
      |> Map.merge(conn.query_params)

    {:ok, results} = Couchdb.connect
      |> Couchdb.Server.database("user_dl2ic")
      |> Couchdb.Database.view("logbook", view, options)

    send_resp(conn, 200, results)
  end

  get "/:id" do
    {:ok, result} = Couchdb.connect
      |> Couchdb.Server.database("user_dl2ic")
      |> Couchdb.Database.get(id)

    send_resp(conn, 200, result)
  end

  post "/" do
    {:ok, body, conn} = read_body(conn)

    {:ok, result} = Couchdb.connect
      |> Couchdb.Server.database("user_dl2ic")
      |> Couchdb.Database.insert(body)

    send_resp(conn, 200, result)
  end

  delete "/:id" do
    rev = conn.query_params["rev"]

    {:ok, result} = Couchdb.connect
      |> Couchdb.Server.database("user_dl2ic")
      |> Couchdb.Database.delete(id, rev)

    send_resp(conn, 200, result)
  end
end
