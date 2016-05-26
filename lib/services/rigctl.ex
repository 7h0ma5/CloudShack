defmodule RigCtl do
  use GenServer
  require Logger

  def start_link(config) do
    GenServer.start_link(__MODULE__, config, [name: __MODULE__])
  end

  def init(config) do
    Process.send_after(self, :connect, 100)

    {:ok, %{
      host: Map.get(config, :host, "127.0.0.1"),
      port: Map.get(config, :port, 4532),
      socket: nil
    }}
  end

  def handle_info(:connect, state) do
    options = [:binary, packet: :line, active: true, reuseaddr: true, keepalive: true]

    case :gen_tcp.connect(to_char_list(state.host), state.port, options) do
      {:ok, socket} ->
        Logger.info "Connected to rigctld"
        Process.send_after(self(), :poll, 100)
        CloudShack.State.update(:rig, %{connected: true})
        {:noreply, Map.put(state, :socket, socket)}
      {:error, _} ->
        Logger.warn "Failed to connect to rigctld"
        Process.send_after(self(), :connect, 10000)
        {:noreply, state}
    end
  end

  def handle_info(:poll, state) do
    if socket = state.socket do
      :gen_tcp.send(socket, "+f\n+m\n")
      Process.send_after(self(), :poll, 1000)
    end
    {:noreply, state}
  end

  def handle_info({:tcp, _socket, packet}, state) do
    result = case packet do
      "Frequency: " <> tail -> parse_frequency(tail)
      "Mode: " <> tail -> parse_mode(tail)
      "Passband: " <> tail -> parse_passband(tail)
      _ -> nil
    end

    if result do
      CloudShack.State.update(:rig, result)
    end

    {:noreply, state}
  end

  def handle_info({:tcp_closed, _socket}, state) do
    Process.send_after(self(), :connect, 10000)
    CloudShack.State.update(:rig, %{connected: false})
    {:noreply, Map.put(state, :socket, nil)}
  end

  def parse_frequency(data) do
    case Integer.parse(data) do
      {num, _} -> %{freq: num / 1.0e6}
      :error -> nil
    end
  end

  def parse_passband(data) do
    case Integer.parse(data) do
      {num, _} -> %{passband: num}
      :error -> nil
    end
  end

  def parse_mode(data) do
    case String.splitter(data, "\n") |> Enum.at(0) do
      nil -> nil
      "" -> nil
      value -> %{mode: value}
      _ -> nil
    end
  end
end
