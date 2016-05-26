defmodule DXCC do
  use GenServer
  require Logger

  @source "https://cdn.cloudshack.org/dxcc.json.gz"

  def start_link do
    GenServer.start_link(__MODULE__, :ok, [name: __MODULE__])
  end

  def init(_) do
    load()
    {:ok, nil}
  end

  def load, do: GenServer.cast(__MODULE__, :load)
  def update, do: GenServer.cast(__MODULE__, :update)
  def lookup(callsign), do: GenServer.call(__MODULE__, {:lookup, callsign})

  def get_entity(dxcc) do
    case :ets.lookup(:dxcc_entities, dxcc) do
      [{_, result}] -> result
      _ -> nil
    end
  end

  def handle_call({:lookup, callsign}, _from, state) do
    result = String.length(callsign)..1
      |> Enum.map(fn(len) -> callsign |> String.slice(0, len) end)
      |> Enum.reduce_while(nil, fn(prefix, _) ->
          result = find_matching_prefix(prefix, callsign)
          if result, do: {:halt, result}, else: {:cont, nil}
        end)

    case result do
      {_, prefix} ->
        entity = prefix |> Map.get(:dxcc) |> get_entity
        {:reply, Map.merge(entity, prefix[:exceptions]), state}
      _ ->
        {:reply, nil, state}
    end
  end

  defp find_matching_prefix(prefix, callsign) do
    case :ets.lookup(:dxcc_prefixes, prefix) do
      [] -> nil
      results ->
        results |> Enum.find(fn({prefix, result}) ->
          !(Map.get(result, :exact, false) && callsign != prefix)
        end)
      _ -> nil
    end
  end

  def handle_cast(:update, state) do
    case HTTPoison.get(@source) do
      {:ok, result} ->
        File.write!("dxcc.json.gz", result.body)
        Logger.info "Successfully updated the DXCC data"
      {:error, _} ->
        Logger.warn "Failed to update the DXCC data"
    end
    load()
    {:noreply, state}
  end

  def handle_cast(:load, state) do
    Logger.debug "Loading the DXCC data..."

    :ets.new(:dxcc_entities, [:set, :protected, :named_table])
    :ets.new(:dxcc_prefixes, [:bag, :public, :named_table])

    case File.open("dxcc.json.gz", [:read, :compressed]) do
      {:ok, file} ->
        file |> IO.read(:all) |> load_json
      _ ->
        Logger.warn "Could not open dxcc.json.gz"
    end

    {:noreply, state}
  end

  defp load_json(json) do
    case json |> Poison.decode(keys: :atoms) do
      {:ok, data} -> load_data(data)
      _ -> Logger.warn "Failed to parse dxcc.json"
    end
  end

  defp load_data(data) do
    data.entities |> load_entities
    data.prefixes |> load_prefixes

    entities = :ets.info(:dxcc_entities)[:size]
    prefixes = :ets.info(:dxcc_prefixes)[:size]
    Logger.info "Loaded #{entities} DXCC entities and #{prefixes} prefixes"
  end

  defp load_entities(entities) do
    Enum.each(entities, fn(entity) ->
      :ets.insert(:dxcc_entities, {entity[:dxcc], entity})
    end)
  end

  defp load_prefixes(prefixes) do
    Enum.each(prefixes, fn(prefix) ->
      key = prefix[:prefix]
      :ets.insert(:dxcc_prefixes, {key, Map.delete(prefix, :prefix)})
    end)
  end
end
