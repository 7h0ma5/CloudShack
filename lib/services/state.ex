defmodule CloudShack.State do
  use GenServer

  def start_link do
    GenServer.start_link(__MODULE__, :ok, [name: __MODULE__])
  end

  def get(), do: GenServer.call(__MODULE__, :get)
  def get(key), do: GenServer.call(__MODULE__, {:get, key})

  def init(_) do
    state = %{
      profile: %{operator: "DL2IC", my_gridsquare: "JO30BR", my_rig: "IC-7300"},
      rig: %{freq: 0.0, mode: :cw},
      log: %{freq: 14.055, mode: "CW", tx_pwr: 10.0}
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
end
