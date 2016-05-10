defmodule Cloudshack.Config do
  use GenServer

  def start_link do
    GenServer.start_link(__MODULE__, :ok, [name: __MODULE__])
  end

  def lookup(key) do
    GenServer.call(__MODULE__, {:lookup, key})
  end

  def init(:ok) do
    :ets.new(:cloudshack_config, [:ordered_set, :public, :named_table])
    {:ok, :undefined}
  end

  def handle_call({:lookup, key}, _from, state) do
    IO.puts "lookup key #{key}"
    {:reply, :result, state}
  end
end
