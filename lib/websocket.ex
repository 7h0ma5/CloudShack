defmodule CloudShack.WebsocketHandler do
  @behaviour :cowboy_websocket_handler

  require Logger

  def init(req, state) do
    {:cowboy_websocket, req, state}
  end

  def websocket_init(state) do
    Logger.debug "Websocket client connected"

    :gproc.reg({:p, :l, :websocket})
    send self(), :initialize

    {:ok, state}
  end

  def websocket_handle({:text, "ping"}, state) do
    {:reply, {:text, "pong"}, state}
  end

  def websocket_handle({:text, message}, state) do
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
    {:ok, state}
  end

  def websocket_info(:initialize, state) do
    message = CloudShack.State.get
    |> Enum.map(fn {k,v} -> %{event: k, data: v} end)
    |> Poison.encode!
    {:reply, {:text, message}, state}
  end

  def websocket_info({event, data}, state) do
    message = Poison.encode!(%{event: event, data: data})
    {:reply, {:text, message}, state}
  end

  def terminate(_reason, _req, _state) do
    :ok
  end
end
