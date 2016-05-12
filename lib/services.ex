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
      worker(Callbook.HamQTH, [CloudShack.Config.lookup(:hamqth)]),
      worker(WSJT, [CloudShack.Config.lookup(:wsjt)]),
      worker(Cluster, [CloudShack.Config.lookup(:cluster)]),
      worker(DXCC, [])
    ]

    opts = [strategy: :one_for_one]
    supervise(children, opts)
  end
end
