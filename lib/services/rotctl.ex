defmodule RotCtl do
  use GenServer
  require Logger

  def start_link(config) do
    GenServer.start_link(__MODULE__, config, [name: __MODULE__])
  end

  def set_target(az) do
     GenServer.cast(__MODULE__, {:cmd, {:set_target, az}})
  end

  def stop() do
    GenServer.cast(__MODULE__, {:cmd, :stop})
  end

  def init(config) do
    Process.send_after(self(), :connect, 100)

    {:ok, %{
      host: Map.get(config, :host, "127.0.0.1"),
      port: Map.get(config, :port, 4533),
      socket: nil
    }}
  end

  def handle_cast({:cmd, value}, state) do
    cmd = case value do
      {:set_target, az} -> "P #{az} 0\n"
      :stop -> "S\n"
      _ -> nil
    end

    if cmd && state[:socket] do
      :gen_tcp.send(state[:socket], cmd)
    end

    {:noreply, state}
  end

  def handle_info(:connect, state) do
    options = [:binary, packet: :line, active: true, reuseaddr: true, keepalive: true]

    case :gen_tcp.connect(to_char_list(state.host), state.port, options) do
      {:ok, socket} ->
        Logger.info "Connected to rotctld"
        Process.send_after(self(), :poll, 100)
        CloudShack.State.update(:rot, %{connected: true})
        {:noreply, Map.put(state, :socket, socket)}
      {:error, _} ->
        Process.send_after(self(), :connect, 10000)
        {:noreply, state}
    end
  end

  def handle_info(:poll, state) do
    if socket = state.socket do
      :gen_tcp.send(socket, "+p\n")
      Process.send_after(self(), :poll, 1000)
    end
    {:noreply, state}
  end

  def handle_info({:tcp, _socket, packet}, state) do
    result = case packet do
      "Azimuth: " <> tail -> parse_azimuth(tail)
      _ -> nil
    end

    if result do
      CloudShack.State.update(:rot, result)
    end

    {:noreply, state}
  end

  def handle_info({:tcp_closed, _socket}, state) do
    Process.send_after(self(), :connect, 10000)
    Logger.warn "Connection to rigctl closed"
    CloudShack.State.update(:rig, %{connected: false})
    {:noreply, Map.put(state, :socket, nil)}
  end

  def parse_azimuth(data) do
    case Float.parse(data) do
      {num, _} -> %{heading: num}
      :error -> nil
    end
  end
end
