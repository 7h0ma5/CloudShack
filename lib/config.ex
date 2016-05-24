defmodule CloudShack.Config do
  use GenServer

  def start_link do
    GenServer.start_link(__MODULE__, :ok, [name: __MODULE__])
  end

  def get(), do: GenServer.call(__MODULE__, :get)
  def get(key), do: GenServer.call(__MODULE__, {:get, key})
  def set(map), do: GenServer.cast(__MODULE__, {:set, map})
  def set(key, value), do: GenServer.cast(__MODULE__, {:set, key, value})
  def save, do: GenServer.cast(__MODULE__, :save)
  def load, do: GenServer.cast(__MODULE__, :load)

  def init(_) do
    load()
    {:ok, nil}
  end

  def restart_services do
    Supervisor.stop(CloudShack.Services)
  end

  def handle_call(:get, _from, table) do
    result = :ets.foldl(fn({key, value}, map) ->
      Map.put(map, key, value)
    end, %{}, table)
    {:reply, result, table}
  end

  def handle_call({:get, key}, _from, table) do
    case :ets.lookup(table, key) do
      [{_key, value}] -> {:reply, value, table}
      _ -> {:reply, %{}, table}
    end
  end

  def handle_cast({:set, map}, table)  do
    map |> Enum.each(fn({key, value}) ->
      value = value
        |> Enum.filter(fn {_, v} ->
            if is_binary(v), do: String.strip(v) != "", else: v
         end)
        |> Enum.into(%{})
      :ets.insert(table, {key, value})
    end)

    restart_services()
    GenServer.cast(self(), :save)
    {:noreply, table}
  end

  def handle_cast({:set, key, value}, table) do
    :ets.insert(table, {key, value})
    GenServer.cast(self(), :save)
    {:noreply, table}
  end

  def handle_cast(:load, _) do
    case :ets.file2tab('settings.ets') do
      {:ok, table} -> {:noreply, table}
      {:error, _} -> {:noreply, :ets.new(:csconfig, [:ordered_set, :private])}
    end
  end

  def handle_cast(:save, table) do
    :ok = :ets.tab2file(table, 'settings.ets', [sync: true])
    {:noreply, table}
  end
end
