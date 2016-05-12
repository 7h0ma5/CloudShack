defmodule CloudShack.Controller.Contacts do
  use Plug.Router
  use Plug.ErrorHandler

  plug CloudShack.Plug.Api

  plug :match
  plug :dispatch

  get "/" do
    options = %{"limit" => 10, "include_docs" => true, "descending" => true}
      |> Map.merge(conn.query_params)

    {:ok, results} = CouchDB.connect
      |> CouchDB.Server.database("user_dl2ic")
      |> CouchDB.Database.view("logbook", "byDate", options)

    send_resp(conn, 200, results)
  end

  get "/_stats" do
    options = %{"group_level" => 3}
      |> Map.merge(conn.query_params)

    {:ok, results} = CouchDB.connect
      |> CouchDB.Server.database("user_dl2ic")
      |> CouchDB.Database.view("logbook", "stats", options)

    send_resp(conn, 200, results)
  end

  get "/_view/:view" do
    options = %{"limit" => 10, "include_docs" => true, "descending" => true}
      |> Map.merge(conn.query_params)

    {:ok, results} = CouchDB.connect
      |> CouchDB.Server.database("user_dl2ic")
      |> CouchDB.Database.view("logbook", view, options)

    send_resp(conn, 200, results)
  end

  get "/:id" do
    {:ok, result} = CouchDB.connect
      |> CouchDB.Server.database("user_dl2ic")
      |> CouchDB.Database.get(id)

    send_resp(conn, 200, result)
  end

  post "/" do
    {:ok, body, conn} = read_body(conn)

    {:ok, result} = CouchDB.connect
      |> CouchDB.Server.database("user_dl2ic")
      |> CouchDB.Database.insert(body)

    send_resp(conn, 200, result)
  end

  delete "/:id" do
    rev = conn.query_params["rev"]

    {:ok, result} = CouchDB.connect
      |> CouchDB.Server.database("user_dl2ic")
      |> CouchDB.Database.delete(id, rev)

    send_resp(conn, 200, result)
  end
end
