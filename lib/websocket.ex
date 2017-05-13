defmodule CloudShack.WebsocketHandler do
  @behaviour :cowboy_websocket_handler

  require Logger

  def init(_, _req, _opts) do
    {:upgrade, :protocol, :cowboy_websocket}
  end

  def websocket_init(_type, req, _opts) do
    Logger.debug "Websocket client connected"

    :gproc.reg({:p, :l, :websocket})
    send self(), :initialize

    {:ok, req, nil}
  end

  def websocket_handle({:text, "ping"}, req, state) do
    {:reply, {:text, "pong"}, req, state}
  end

  def websocket_handle({:text, message}, req, state) do
    case Poison.decode!(message, keys: :atoms!) do
      %{action: "rig.set_freq", freq: freq}
        -> RigCtl.set_freq(freq)
      %{action: "rig.set_mode", mode: mode, passband: passband}
        -> RigCtl.set_mode(mode, passband)
      %{action: "rig.send_cw", text: text}
        -> RigCtl.send_cw(text)
      %{action: "rot.set_target", target: target}
        -> RotCtl.set_target(target)
      other -> Logger.warn("Unknown websocket command #{inspect other}")
    end
    {:ok, req, state}
  end

  def websocket_info(:initialize, req, state) do
    message = %{event: :state, data: CloudShack.State.get} |> Poison.encode!
    {:reply, {:text, message}, req, state}
  end

  def websocket_info({event, data}, req, state) do
    message = Poison.encode!(%{event: event, data: data})
    {:reply, {:text, message}, req, state}
  end

  def websocket_terminate(_reason, _req, _state) do
    :ok
  end
end
