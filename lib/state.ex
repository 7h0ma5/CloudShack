defmodule CloudShack.State do
  use GenServer

  def start_link do
    GenServer.start_link(__MODULE__, :ok, [name: __MODULE__])
  end

  def get(), do: GenServer.call(__MODULE__, :get)
  def get(key), do: GenServer.call(__MODULE__, {:get, key})
  def set(key, value), do: GenServer.cast(__MODULE__, {:set, key, value})
  def update(key, map), do: GenServer.cast(__MODULE__, {:update, key, map})

  def init(_) do
    state = %{
      profile: nil,
      rig: %{connected: false, freq: 0.0, mode: "SSB"},
      rot: %{connected: false, heading: 0.0, target: 0.0},
      log: %{freq: 14.200, mode: "SSB", tx_pwr: 100.0}
    }
    {:ok, state}
  end

  def handle_call(:get, _from, state) do
     {:reply, state, state}
  end

  def handle_call({:get, key}, _from, state) do
    result = state |> Map.get(key)
    {:reply, result, state}
  end

  def handle_cast({:set, key, value}, state) do
    currentValue = Map.get(state, key)

    if currentValue && currentValue == value do
      {:noreply, state}
    else
      state = state |> Map.put(key, value)
      :gproc.send({:p, :l, :websocket}, {:state, %{key => value}})
      {:noreply, state}
    end
  end

  def handle_cast({:update, key, map}, state) do
    value = Map.get(state, key, %{}) |> Map.merge(map)
    handle_cast({:set, key, value}, state)
  end
end
