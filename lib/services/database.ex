defmodule Database do
  use GenServer
  require Logger

  @design_doc_path Path.join("#{:code.priv_dir(:cloudshack)}", "logbook.json")

  def start_link(config) do
    GenServer.start_link(__MODULE__, config, [name: __MODULE__])
  end

  def init(config) do
    GenServer.cast(__MODULE__, :migrate)

    host = config |> Map.get(:host, "127.0.0.1")
    port = config |> Map.get(:port, 5984)
    protocol = config |> Map.get(:protocol, "http")
    user = config |> Map.get(:user, nil)
    password = config |> Map.get(:password, nil)
    database = config |> Map.get(:database, "contacts")

    db = CouchDB.connect(host, port, protocol, user, password)
      |> CouchDB.Server.database(database)

    {:ok, db}
  end

  def get, do: GenServer.call(__MODULE__, :get)

  def handle_call(:get, _from, db) do
    {:reply, db, db}
  end

  def handle_cast(:migrate, db) do
    db |> CouchDB.Database.create

    new_doc = @design_doc_path |> File.read!
      |> String.replace("\n", "")
      |> Poison.decode!

    new_version = new_doc |> Map.get("version")

    current_doc = case db |> CouchDB.Database.get("_design/logbook") do
      {:ok, result} -> result |> Poison.decode!
      {:error, _} -> nil
    end

    current_version = if current_doc do
      current_doc |> Map.get("version", 0)
    else
      -1
    end

    result = cond do
      new_version == current_version ->
        Logger.info "Design document is up to date (v#{current_version})"
        nil
      new_version < current_version ->
        Logger.warn "Design document is newer than internal (v#{current_version} > v#{new_version})"
        Logger.warn "This version of CloudShack is too old to handle the selected database"
        nil
      current_doc ->
        Logger.info "Updating the design document from v#{current_version} to v#{new_version}..."
        rev = current_doc |> Map.get("_rev")
        new_doc = new_doc |> Map.put("_rev", rev)
        db |> CouchDB.Database.insert(Poison.encode!(new_doc))
      true ->
        Logger.info "Creating the design document (v#{new_version})..."
        db |> CouchDB.Database.insert(Poison.encode!(new_doc))
    end

    case result do
      {:ok, _} -> Logger.info "Database successfully updated"
      {:error, _} -> Logger.warn "Database update failed"
      _ -> ()
    end

    {:noreply, db}
  end
end
