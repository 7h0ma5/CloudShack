defmodule Socket do
  require Logger
  alias Phoenix.Channels.GenSocketClient
  @behaviour GenSocketClient

  def start_link() do
    GenSocketClient.start_link(
      __MODULE__,
      Phoenix.Channels.GenSocketClient.Transport.WebSocketClient,
      "ws://cloudshack.org/socket/websocket"
    )
  end

  def init(url) do
    {:connect, url, nil}
  end

  def handle_connected(transport, state) do
    Logger.info("connected")
    GenSocketClient.join(transport, "noaa")
    GenSocketClient.join(transport, "rbn:DL2IC")
    {:ok, state}
  end

  def handle_disconnected(reason, state) do
    Logger.error("disconnected: #{inspect reason}")
    Process.send_after(self(), :connect, :timer.seconds(20))
    {:ok, state}
  end

  def handle_joined(topic, _payload, _transport, state) do
    Logger.info("joined the topic #{topic}")
    {:ok, state}
  end

  def handle_join_error(topic, payload, _transport, state) do
    Logger.error("join error on the topic #{topic}: #{inspect payload}")
    {:ok, state}
  end

  def handle_channel_closed(topic, payload, _transport, state) do
    Logger.error("disconnected from the topic #{topic}: #{inspect payload}")
    Process.send_after(self(), {:join, topic}, :timer.seconds(20))
    {:ok, state}
  end

  def handle_message("rbn:" <> call, event, payload, _transport, state) do
    Logger.info("New RBN spot: #{call}")
    {:ok, state}
  end

  def handle_message(topic, event, payload, _transport, state) do
    Logger.warn("message on topic #{topic}: #{event} #{inspect payload}")
    case {topic, event} do
      {"noaa", "update"} -> CloudShack.State.update("noaa", payload)
    end
    {:ok, state}
  end

  def handle_reply("ping", _ref, %{"status" => "ok"} = payload, _transport, state) do
    Logger.info("server pong ##{payload["response"]["ping_ref"]}")
    {:ok, state}
  end
  def handle_reply(topic, _ref, payload, _transport, state) do
    Logger.warn("reply on topic #{topic}: #{inspect payload}")
    {:ok, state}
  end

  def handle_info(:connect, _transport, state) do
    Logger.info("connecting")
    {:connect, state}
  end
  def handle_info({:join, topic}, transport, state) do
    Logger.info("joining the topic #{topic}")
    case GenSocketClient.join(transport, topic) do
      {:error, reason} ->
        Logger.error("error joining the topic #{topic}: #{inspect reason}")
        Process.send_after(self(), {:join, topic}, :timer.seconds(20))
      {:ok, _ref} -> :ok
    end

    {:ok, state}
  end
  def handle_info(message, _transport, state) do
    Logger.warn("Unhandled message #{inspect message}")
    {:ok, state}
  end
end
