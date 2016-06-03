defmodule CloudShack do
  use Application

  def start(_type, _args) do
    import Supervisor.Spec, warn: false

    children = [
      Plug.Adapters.Cowboy.child_spec(:http, CloudShack.Router, [], [
        port: 7373,
        dispatch: [{:_, [
          {"/websocket", CloudShack.WebsocketHandler, []},
          {:_, Plug.Adapters.Cowboy.Handler, {CloudShack.Router, []}}
        ]}]
      ]),
      worker(CloudShack.Config, []),
      worker(CloudShack.State, []),
      supervisor(CloudShack.Services, [])
    ]

    opts = [strategy: :one_for_one, name: CloudShack.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
