defmodule DXCC do
  use GenServer
  require Logger

  @source "https://cdn.cloudshack.org/dxcc.json.gz"
  @prefix_override MapSet.new([:cqz, :ituz, :cont, :latlon])

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
      [{dxcc, result}] -> result
      _ -> nil
    end
  end

  def handle_call({:lookup, callsign}, _from, state) do
    prefix = String.length(callsign)..1
      |> Enum.map(fn(len) -> callsign |> String.slice(0, len) end)
      |> Enum.reduce_while(nil, fn(prefix, _) ->
          result = find_matching_prefix(prefix, callsign)
          if result, do: {:halt, result}, else: {:cont, nil}
        end)

    if prefix do
      entity = prefix |> Map.get(:dxcc) |> get_entity

      prefix = prefix
        |> Enum.filter(fn {k, v} -> MapSet.member?(@prefix_override, k) end)
        |> Enum.into(%{})

      {:reply, Map.merge(entity, prefix), state}
    else
      {:reply, nil, state}
    end
  end

  defp find_matching_prefix(prefix, callsign) do
    case :ets.lookup(:dxcc_prefixes, prefix) do
      [{prefix, results}] ->
        results |> Enum.find(fn(result) ->
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
    Logger.info "Loading the DXCC data..."

    data = File.open!("dxcc.json.gz", [:read, :compressed])
      |> IO.read(:all)
      |> Poison.decode!(keys: :atoms)

    :ets.new(:dxcc_entities, [:set, :protected, :named_table])
    :ets.new(:dxcc_prefixes, [:bag, :protected, :named_table])

    data.entities |> load_entities
    data.prefixes |> load_prefixes

    entities = :ets.info(:dxcc_entities)[:size]
    prefixes = :ets.info(:dxcc_prefixes)[:size]
    Logger.info "Loaded #{entities} DXCC entities and #{prefixes} prefixes"

    {:noreply, state}
  end

  def load_entities(entities) do
    Enum.each(entities, fn(entity) ->
      :ets.insert(:dxcc_entities, {entity[:dxcc], entity})
    end)
  end

  def load_prefixes(prefixes) do
    Enum.each(prefixes, fn({key, value}) ->
      :ets.insert(:dxcc_prefixes, {key, value})
    end)
  end
end
