defmodule DXCC do
  use GenServer
  require Logger

  def start_link do
    GenServer.start_link(__MODULE__, :ok, [name: __MODULE__])
  end

  def init(_) do
    {:ok, nil}
  end


  def download do
    data = HTTPoison.get!("https://cdn.cloudshack.org/dxcc.json.gz").body
    File.write!("dxcc.json.gz", data)
  end
end
