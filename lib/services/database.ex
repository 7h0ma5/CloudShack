defmodule Database do
  use GenServer
  require Logger

  def start_link(database, sync) do
    GenServer.start_link(__MODULE__, {database, sync}, [name: __MODULE__])
  end

  def init({database, sync}) do
    host = database |> Map.get(:host, "127.0.0.1")
    port = database |> Map.get(:port, 5984)
    protocol = database |> Map.get(:protocol, "http")
    user = database |> Map.get(:user, nil)
    password = database |> Map.get(:password, nil)
    name = database |> Map.get(:name, "contacts")

    server = CouchDB.connect(host, port, protocol, user, password)

    contacts = server |> CouchDB.Server.database(name)
    profiles = server |> CouchDB.Server.database("profiles")

    GenServer.cast(__MODULE__, :migrate)

    if (sync && sync |> Map.get(:user) && sync |> Map.get(:key)) do
      GenServer.cast(__MODULE__, :sync)
    end

    {:ok, %{contacts: contacts, profiles: profiles, server: server, sync: sync}}
  end

  def contacts, do: GenServer.call(__MODULE__, {:get, :contacts})
  def profiles, do: GenServer.call(__MODULE__, {:get, :profiles})

  def handle_call({:get, name}, _from, state) do
    database = state |> Map.get(name)
    {:reply, database, state}
  end

  def handle_cast(:sync, %{server: server, contacts: contacts, sync: sync} = state) do
    Logger.info "Starting database replication"

    %{name: local_db} = contacts

    local_url = CouchDB.Server.url(server, "/#{local_db}")

    remote_user = sync |> Map.get(:user)
    remote_password = sync |> Map.get(:key)
    remote_db = "user_" <> String.downcase(remote_user)
    remote_url = "https://#{remote_user}:#{remote_password}"
                  <> "@cloudshack.org:6984/#{remote_db}"

    options = [create_target: false, filter: "logbook/sync", continuous: true]
    CouchDB.Server.replicate(server, local_url, remote_url, options)
      |> inspect |> Logger.debug

    # TODO: Enable other direction
    # options = [filter: "logbook/sync"]
    # CouchDB.Server.replicate server, remote_url, local_url, options

    {:noreply, state}
  end

  def handle_cast(:migrate, state) do
    state
      |> Map.get(:profiles)
      |> CouchDB.Database.create

    contacts = state |> Map.get(:contacts)

    CouchDB.Database.create contacts

    new_doc = Path.join(:code.priv_dir(:cloudshack), "logbook.json") |> File.read!
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
      _ -> nil
    end

    {:noreply, state}
  end
end
