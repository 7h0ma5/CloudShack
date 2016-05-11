defmodule Cloudshack.State do
  use GenServer

  def start_link do
    GenServer.start_link(__MODULE__, :ok, [name: __MODULE__])
  end

  def lookup(key) do
    GenServer.call(__MODULE__, {:lookup, key})
  end

  def init(_) do
    {:ok, :undefined}
  end

  def handle_call({:lookup, key}, _from, state) do
    {:reply, :result, state}
  end
end
