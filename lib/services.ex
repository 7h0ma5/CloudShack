defmodule CloudShack.Services do
  use Supervisor
  require Logger

  def start_link do
    Supervisor.start_link(__MODULE__, :ok, [name: __MODULE__])
  end

  def init(:ok) do
    Logger.debug "Starting services..."

    sync = CloudShack.Config.get(:sync)

    children = [
      worker(Callbook.HamQTH, [CloudShack.Config.get(:hamqth)]),
      worker(WSJT, [CloudShack.Config.get(:wsjt)]),
      worker(Cluster, [CloudShack.Config.get(:cluster)]),
      worker(Database, [CloudShack.Config.get(:database), sync]),
      worker(RigCtl, [CloudShack.Config.get(:rigctl)]),
      worker(RotCtl, [CloudShack.Config.get(:rotctl)]),
      worker(DXCC, []),
      worker(Socket, [])
    ]

    opts = [strategy: :one_for_one]
    supervise(children, opts)
  end
end
