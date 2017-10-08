defmodule Cluster do
  use GenServer
  require Logger

  def start_link(config) do
    GenServer.start_link(__MODULE__, config, [name: __MODULE__])
  end

  def init(config) do
    if config[:host] do
      Process.send_after(self(), :connect, 100)
    end

    {:ok, %{
      host: config[:host],
      port: Map.get(config, :port, 23),
      user: Map.get(config, :user, nil),
      socket: nil
    }}
  end

  def handle_info(:connect, state) do
    options = [:binary, packet: :line, active: true, reuseaddr: true, keepalive: true]

    case :gen_tcp.connect(to_charlist(state.host), state.port, options) do
      {:ok, socket} ->
        Logger.info "Connected to the DX cluster"
        if state.user do
          :gen_tcp.send(socket, state.user <> "\r\n")
        end
        {:noreply, Map.put(state, :socket, socket)}
      {:error, _} ->
        Logger.warn "Failed to connect to the DX cluster"
        Process.send_after(self(), :connect, 10000)
        {:noreply, state}
    end
  end

  def handle_info({:tcp, _socket, packet}, state) do
    packet = parse_line(packet)
    if packet do
      :gproc.send({:p, :l, :websocket}, {:spot, packet})
    end
    {:noreply, state}
  end

  def handle_info({:tcp_closed, _socket}, state) do
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
    freq = line |> String.slice(10, 8) |> String.trim
    call = Regex.run(~r/^[a-zA-Z0-9\/]*/, String.slice(line, 20, 12)) |> List.first
    comment = line |> String.slice(33, 30) |> String.trim
    time = line |> String.slice(64, 4)
    received = Timex.now

    # TODO Convert comment from ISO 8859-1 to UTF-8
    comment = if String.printable?(comment), do: comment, else: ""

    # Parse the frequency and convert to MHz
    {freq, _} = Float.parse(freq)
    freq = freq/1000

    %{spotter: spotter, freq: freq, call: call, comment: comment, time: time, received: received}
  end
end
