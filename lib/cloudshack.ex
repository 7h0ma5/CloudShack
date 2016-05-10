defmodule Cloudshack do
  use Application

  # See http://elixir-lang.org/docs/stable/elixir/Application.html
  # for more information on OTP Applications
  def start(_type, _args) do
    import Supervisor.Spec, warn: false

    children = [
      # Define workers and child supervisors to be supervised
      # worker(Cloudshack.Worker, [arg1, arg2, arg3]),
      Plug.Adapters.Cowboy.child_spec(:http, Cloudshack.Router, [], [
        port: 7373,
        dispatch: [{:_, [
          {"/websocket", Cloudshack.WebsocketHandler, []},
          {:_, Plug.Adapters.Cowboy.Handler, {Cloudshack.Router, []}}
        ]}]
      ]),
      worker(Cloudshack.Config, []),
      worker(Cloudshack.State, []),
      worker(Callbook.Hamqth, []),
      worker(Wsjt, []),
      worker(Cluster, [])
    ]

    # See http://elixir-lang.org/docs/stable/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Cloudshack.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
