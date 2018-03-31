defmodule Socket do
  require Logger
  alias Phoenix.Channels.GenSocketClient
  @behaviour GenSocketClient

  def start_link(config) do
    GenSocketClient.start_link(
      __MODULE__,
      Phoenix.Channels.GenSocketClient.Transport.WebSocketClient,
      {config, "wss://app01.cloudshack.org/socket/websocket"}
    )
  end

  def init({config, url}) do
    state = config

    query = case {Map.get(state, :user), Map.get(state, :password)} do
      {user, password} when user != nil and password != nil ->
        [user: user, password: password]
      _ ->
        Logger.info("No cloudshack.org credentials provided, skipping authentication")
        []
    end

    {:connect, url, query, state}
  end

  def handle_connected(transport, state) do
    Logger.info("Connected to cloudshack.org")

    GenSocketClient.join(transport, "noaa")
    GenSocketClient.join(transport, "rbn:DL2IC")

    {:ok, state}
  end

  def handle_disconnected(reason, state) do
    Logger.error("Disconnected from cloudshack.org: #{inspect reason}")
    Process.send_after(self(), :connect, :timer.seconds(20))
    {:ok, state}
  end

  def handle_joined(topic, _payload, _transport, state) do
    Logger.debug("Joined the topic #{topic}")
    {:ok, state}
  end

  def handle_join_error(topic, payload, _transport, state) do
    Logger.error("Join error on the topic #{topic}: #{inspect payload}")
    {:ok, state}
  end

  def handle_channel_closed(topic, payload, _transport, state) do
    Logger.error("Disconnected from the topic #{topic}: #{inspect payload}")
    Process.send_after(self(), {:join, topic}, :timer.seconds(20))
    {:ok, state}
  end

  def handle_message("rbn:" <> call, _event, _payload, _transport, state) do
    Logger.info("New RBN spot: #{call}")
    {:ok, state}
  end

  def handle_message(topic, event, payload, _transport, state) do
    case {topic, event} do
      {"noaa", "update"} -> CloudShack.State.update("noaa", payload)
      _ ->
        Logger.warn("Unhandled message on topic #{topic}: #{event} #{inspect payload}")
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
    Logger.info("Connecting")
    {:connect, state}
  end
  def handle_info({:join, topic}, transport, state) do
    case GenSocketClient.join(transport, topic) do
      {:error, reason} ->
        Logger.error("Error joining the topic #{topic}: #{inspect reason}")
        Process.send_after(self(), {:join, topic}, :timer.seconds(20))
      {:ok, _ref} -> :ok
    end

    {:ok, state}
  end
  def handle_info(message, _transport, state) do
    Logger.debug("Unhandled message #{inspect message}")
    {:ok, state}
  end
end
