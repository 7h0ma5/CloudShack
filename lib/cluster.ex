defmodule Cluster do
  use GenServer
  require Logger

  def start_link do
    GenServer.start_link(__MODULE__, :ok, [name: __MODULE__])
  end

  def init(_) do
    Process.send_after(self, :connect, 100)
    {:ok, nil}
  end

  def handle_info(:connect, state) do
    Logger.info "Connecting to the DX cluster..."
    options = [:binary, packet: :line, active: true, reuseaddr: true, keepalive: true]
    case :gen_tcp.connect('db0sue.de', 8000, options) do
      {:ok, socket} ->
        :gen_tcp.send(socket, "DL2IC\r\n")
        {:noreply, socket}
      {:error, _} -> Process.send_after(self(), :connect, 10000)
    end
    {:noreply, state}
  end

  def handle_info({:tcp, _, packet}, state) do
    packet = parse_line(packet)
    if packet do
      Logger.debug "New spot: #{inspect packet}"
      :gproc.send({:p, :l, :websocket}, {:spot, packet})
    end
    {:noreply, state}
  end

  def handle_info({:tcp_closed, socket}, state) do
    Process.send_after(self(), :connect, 10000)
    {:noreply, state}
  end

  def parse_line(line) do
    case line do
      "DX de " <> rest -> parse_dx(rest)
      _ -> nil
    end
  end

  def parse_dx(line) do
    spotter = Regex.run(~r/^[a-zA-Z0-9\/]*/, String.slice(line, 0, 10)) |> List.first
    freq = line |> String.slice(10, 8) |> String.strip
    call = Regex.run(~r/^[a-zA-Z0-9\/]*/, String.slice(line, 20, 12)) |> List.first
    comment = line |> String.slice(33, 30) |> String.strip
    time = line |> String.slice(64, 4)
    %{spotter: spotter, freq: freq, call: call, comment: comment, time: time}
  end
end
