defmodule Cloudshack.WebsocketHandler do
  @behaviour :cowboy_websocket_handler

  require Logger

  def init(_, _req, _opts) do
    {:upgrade, :protocol, :cowboy_websocket}
  end

  def websocket_init(_type, req, _opts) do
    :gproc.reg({:p, :l, :websocket})
    Logger.debug "Websocket client connected"
    {:ok, req, nil}
  end

  def websocket_handle({:text, "ping"}, req, state) do
    {:reply, {:text, "pong"}, req, state}
  end

  def websocket_handle({:text, message}, req, state) do
    IO.puts(message)
    {:ok, req, state}
  end

  def websocket_info({event, data}, req, state) do
    message = Poison.encode!(%{event: event, data: data})
    {:reply, {:text, message}, req, state}
  end

  def websocket_terminate(_reason, _req, _state) do
    :ok
  end
end
