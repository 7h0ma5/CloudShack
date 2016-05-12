defmodule WSJT do
  use GenServer
  require Logger

  def start_link(config) do
    GenServer.start_link(__MODULE__, config, [name: __MODULE__])
  end

  def init(config) do
    Logger.info "Starting WSJT server..."
    port = Map.get(config, :port, 2237)
    {:ok, socket} = :gen_udp.open(port, [:binary, active: true])
    {:ok, socket}
  end

  def handle_info({:udp, _, _, _, packet}, state) do
    msg = case packet do
      <<173, 188, 203, 218, _schema :: size(32), data :: binary>> ->
        try do
          parse_packet(data)
        rescue
          MatchError -> {:invalid}
        end
      _ -> {:invalid}
    end

    IO.inspect msg
    {:noreply, state}
  end

  defp parse_packet(data) do
    case data do
      <<0 :: 32-big, rest :: binary>> -> parse_heartbeat(rest)
      <<1 :: 32-big, rest :: binary>> -> parse_status(rest)
      <<5 :: 32-big, rest :: binary>> -> parse_log(rest)
      _ -> {:invalid}
    end
  end

  defp parse_heartbeat(data) do
    {id, rest} = parse_string(data)
    <<max_schema :: 32-big>> = rest

    {:heartbeat, %{
      id: id,
      max_schema: max_schema
    }}
  end

  defp parse_status(data) do
    {id, rest} = parse_string(data)
    <<freq :: 64-unsigned-big, rest :: binary>> = rest
    {mode, rest} = parse_string(rest)
    {call, rest} = parse_string(rest)
    {report, rest} = parse_string(rest)
    {tx_mode, rest} = parse_string(rest)
    <<tx_enabled :: 8, transmitting :: 8, decoding :: 8>> = rest

    {:status, %{
      id: id, freq: freq, mode: mode, call: call, report: report,
      tx_mode: tx_mode, tx_enabled: tx_enabled != 0,
      transmitting: transmitting != 0, decoding: decoding != 0
    }}
  end

  defp parse_log(data) do
    {id, rest} = parse_string(data)
    {date, rest} = parse_datetime(rest)
    {call, rest} = parse_string(rest)
    {gridsquare, rest} = parse_string(rest)
    <<freq :: 64-unsigned-big, rest :: binary>> = rest
    {mode, rest} = parse_string(rest)
    {rst_sent, rest} = parse_string(rest)
    {rst_rcvd, rest} = parse_string(rest)
    {tx_pwr, rest} = parse_string(rest)
    {comment, rest} = parse_string(rest)
    {name, _} = parse_string(rest)

    {tx_pwr, _} = Float.parse(tx_pwr)

    {:log, %{
      id: id, date: date, call: call, gridsquare: gridsquare,
      freq: freq, mode: mode, rst_sent: rst_sent, rst_rcvd: rst_rcvd,
      tx_pwr: tx_pwr, comment: comment, name: name
    }}
  end

  defp parse_string(data) do
    case data do
      <<255, 255, 255, 255, rest :: binary>> -> {"", rest}
      <<str_size :: 32-signed-big, rest :: binary>> ->
        <<str :: binary-size(str_size), rest :: binary>> = rest
        {str, rest}
    end
  end

  defp parse_datetime(data) do
    <<julianDay :: 64-unsigned-big, rest :: binary>> = data
    <<microSeconds :: 32-unsigned-big, rest :: binary>> = rest
    <<_utc :: 8-unsigned, rest :: binary>> = rest

    unix_millis = (julianDay - 2440588) * 86400000 + microSeconds
    {unix_millis, rest}
  end
end
