defmodule Cloudshack.Config do
  use GenServer

  def start_link do
    GenServer.start_link(__MODULE__, :ok, [name: __MODULE__])
  end

  def lookup(key), do: GenServer.call(__MODULE__, {:lookup, key})
  def set(key, value), do: GenServer.cast(__MODULE__, {:set, key, value})
  def save, do: GenServer.cast(__MODULE__, :save)
  def load, do: GenServer.cast(__MODULE__, :load)

  def init(_) do
    load()
    {:ok, nil}
  end

  def restart_services do
    Supervisor.stop(Cloudshack.Services)
  end

  def handle_call({:lookup, key}, _from, table) do
    case :ets.lookup(table, key) do
      [{key, value}] -> {:reply, value, table}
      _ -> {:reply, %{}, table}
    end
  end

  def handle_cast({:set, key, value}, table) do
    :ets.insert(table, {key, value})
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
