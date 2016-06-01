defmodule CloudShack.Controller.Contacts do
  use Plug.Router
  use Plug.ErrorHandler

  plug CloudShack.Plug.Api

  plug :match
  plug :dispatch

  get "/" do
    options = %{"limit" => 10, "include_docs" => true, "descending" => true}
      |> Map.merge(conn.query_params)

    {:ok, results} = Database.contacts
      |> CouchDB.Database.view("logbook", "byDate", options)

    send_resp(conn, 200, results)
  end

  get "/_stats" do
    options = %{"group_level" => 3}
      |> Map.merge(conn.query_params)

    {:ok, results} = Database.contacts
      |> CouchDB.Database.view("logbook", "stats", options)

    send_resp(conn, 200, results)
  end

  get "/_dxcc_count" do
    {:ok, result} = Database.contacts
      |> CouchDB.Database.list("logbook", "dxccCount", "dxcc", [group_level: 1])

    send_resp(conn, 200, result)
  end

  get "/_view/:view" do
    options = %{"limit" => 10, "include_docs" => true, "descending" => true}
      |> Map.merge(conn.query_params)

    {:ok, results} = Database.contacts
      |> CouchDB.Database.view("logbook", view, options)

    send_resp(conn, 200, results)
  end

  get "/_adi" do
    options = %{"include_docs" => true, "descending" => false}
      |> Map.merge(conn.query_params)

    {:ok, results} = Database.contacts
      |> CouchDB.Database.view("logbook", "byDate", options)

    conn = conn
      |> put_resp_content_type("application/text")
      |> send_chunked(200)

    chunk(conn, Adif.Generate.header)

    results
      |> Poison.decode!
      |> Map.get("rows")
      |> Stream.map(&(Map.get(&1, "doc")))
      |> Stream.map(&Adif.Generate.contact/1)
      |> Enum.into(conn)
  end

  get "/:id" do
    {:ok, result} = Database.contacts
      |> CouchDB.Database.get(id)

    send_resp(conn, 200, result)
  end

  post "/" do
    {:ok, body, conn} = read_body(conn)

    profile = (CloudShack.State.get(:profile) || %{})
      |> Map.get("fields", %{})

    doc = body
      |> Poison.decode!
      |> Map.merge(profile)
      |> Contact.update_band
      |> Poison.encode!

    {:ok, result} = Database.contacts
      |> CouchDB.Database.insert(doc)

    send_resp(conn, 200, result)
  end

  delete "/:id" do
    rev = conn.query_params["rev"]

    {:ok, result} = Database.contacts
      |> CouchDB.Database.delete(id, rev)

    send_resp(conn, 200, result)
  end
end
