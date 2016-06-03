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

  post "/_adi" do
    options = conn.query_params
    {:ok, data, conn} = conn |> read_body(read_length: 8_000_000)

    contacts = data
      |> Adif.Parse.contacts
      |> Stream.filter(&Contact.valid?/1)
      |> Stream.map(&Contact.update_band/1)
      |> Stream.map(&Contact.migrate_mode/1)

    contacts = if options["dxcc"] == "true" do
      contacts |> Stream.map(&Contact.update_dxcc/1)
    else
      contacts
    end

    contacts = if options["profile"] == "true" do
      profile = Map.get(CloudShack.State.get(:profile) || %{}, "fields", %{})
      contacts |> Stream.map(&(Map.merge(&1, profile)))
    else
      contacts
    end

    docs = %{"docs" => contacts} |> Poison.encode!

    {:ok, result} = Database.contacts
      |> CouchDB.Database.bulk(docs)

    count = Enum.count(contacts)
    send_resp(conn, 200, %{ok: true, count: count} |> Poison.encode!)
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
