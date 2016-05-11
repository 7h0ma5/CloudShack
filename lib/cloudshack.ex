defmodule Cloudshack do
  use Application

  def start(_type, _args) do
    import Supervisor.Spec, warn: false

    children = [
      Plug.Adapters.Cowboy.child_spec(:http, Cloudshack.Router, [], [
        port: 7373,
        dispatch: [{:_, [
          {"/websocket", Cloudshack.WebsocketHandler, []},
          {:_, Plug.Adapters.Cowboy.Handler, {Cloudshack.Router, []}}
        ]}]
      ]),
      worker(Cloudshack.Config, []),
      supervisor(Cloudshack.Services, [])
    ]

    opts = [strategy: :one_for_one, name: Cloudshack.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
