defmodule CloudShack.Services do
  use Supervisor
  require Logger

  def start_link do
    Supervisor.start_link(__MODULE__, :ok, [name: __MODULE__])
  end

  def init(:ok) do
    Logger.info "Starting services..."

    children = [
      worker(CloudShack.State, []),
      worker(Callbook.HamQTH, [CloudShack.Config.get(:hamqth)]),
      worker(WSJT, [CloudShack.Config.get(:wsjt)]),
      worker(Cluster, [CloudShack.Config.get(:cluster)]),
      worker(Database, [CloudShack.Config.get(:database)]),
      worker(DXCC, [])
    ]

    opts = [strategy: :one_for_one]
    supervise(children, opts)
  end
end
