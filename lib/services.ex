defmodule Cloudshack.Services do
  use Supervisor
  require Logger

  def start_link do
    Supervisor.start_link(__MODULE__, :ok, [name: __MODULE__])
  end

  def init(:ok) do
    Logger.info "Starting services..."

    children = [
      worker(Cloudshack.State, []),
      worker(Callbook.Hamqth, [Cloudshack.Config.lookup(:hamqth)]),
      worker(Wsjt, [Cloudshack.Config.lookup(:wsjt)]),
      worker(Cluster, [Cloudshack.Config.lookup(:cluster)])
    ]

    opts = [strategy: :one_for_one]
    supervise(children, opts)
  end
end
