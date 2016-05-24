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

    server = CouchDB.connect(host, port, protocol, user, password)

    contacts = server |> CouchDB.Server.database(database)
    profiles = server |> CouchDB.Server.database("profiles")

    {:ok, %{contacts: contacts, profiles: profiles}}
  end

  def contacts, do: GenServer.call(__MODULE__, {:get, :contacts})
  def profiles, do: GenServer.call(__MODULE__, {:get, :profiles})

  def handle_call({:get, name}, _from, state) do
    database = state |> Map.get(name)
    {:reply, database, state}
  end

  def handle_cast(:migrate, state) do
    state
      |> Map.get(:profiles)
      |> CouchDB.Database.create

    contacts = state |> Map.get(:contacts)

    CouchDB.Database.create contacts

    new_doc = @design_doc_path |> File.read!
      |> String.replace("\n", "")
      |> Poison.decode!

    new_version = new_doc |> Map.get("version")

    current_doc = case contacts |> CouchDB.Database.get("_design/logbook") do
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
        contacts |> CouchDB.Database.insert(Poison.encode!(new_doc))
      true ->
        Logger.info "Creating the design document (v#{new_version})..."
        contacts |> CouchDB.Database.insert(Poison.encode!(new_doc))
    end

    case result do
      {:ok, _} -> Logger.info "Database successfully updated"
      {:error, _} -> Logger.warn "Database update failed"
      _ -> ()
    end

    {:noreply, state}
  end
end
