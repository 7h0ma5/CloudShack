defmodule WSJT do
  use GenServer
  require Logger

  def start_link(config) do
    GenServer.start_link(__MODULE__, config, [name: __MODULE__])
  end

  def init(config) do
    Logger.debug "Starting WSJT server..."
    port = Map.get(config, :port, 2237)
    {:ok, socket} = :gen_udp.open(port, [:binary, active: true])
    {:ok, socket}
  end

  def handle_info({:udp, _, _, _, data}, state) do
    packet = case data do
      <<173, 188, 203, 218, _schema :: size(32), rest :: binary>> ->
        try do
          parse_packet(rest)
        rescue
          MatchError -> {:invalid}
        end
      _ -> {:invalid}
    end

    process_packet(packet)

    {:noreply, state}
  end

  defp process_packet({:status, status}) do
    %{freq: freq} = status
    CloudShack.State.update(:rig, %{freq: freq})
  end

  defp process_packet({:log, log}) do
    profile = Map.get(CloudShack.State.get(:profile) || %{}, "fields", %{})

    datetime = Map.get(log, :datetime)
      |> Timex.format!("{YYYY}-{0M}-{0D}T{h24}:{m}:{s}.000Z")

    contact = log
      |> Map.delete(:id)
      |> Map.delete(:datetime)
      |> Map.put("start", datetime)
      |> Map.put("end", datetime)
      |> Map.merge(profile)
      |> Contact.update_band
      |> Contact.migrate_mode
      |> Contact.update_dxcc
      |> IO.inspect
      |> Poison.encode!

    Database.contacts
      |> CouchDB.Database.insert(contact)
      |> IO.inspect
  end

  defp process_packet(_) do
    # nothing
  end

  defp parse_packet(data) do
    case data do
      <<0 :: 32-big, rest :: binary>> -> parse_heartbeat(rest)
      <<1 :: 32-big, rest :: binary>> -> parse_status(rest)
      <<2 :: 32-big, rest :: binary>> -> parse_decode(rest)
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
    {dx_call, rest} = parse_string(rest)
    {report, rest} = parse_string(rest)
    {tx_mode, rest} = parse_string(rest)
    <<tx_enabled :: 8, transmitting :: 8, decoding :: 8, rest :: binary>> = rest
    <<rx_df :: 32-big, tx_df :: 32-big, rest :: binary>> = rest
    {de_call, rest} = parse_string(rest)
    {de_grid, rest} = parse_string(rest)
    {dx_grid, _} = parse_string(rest)

    {:status, %{
      id: id, freq: freq / 1.0e6, mode: mode, dx_call: dx_call, report: report,
      tx_mode: tx_mode, tx_enabled: tx_enabled != 0,
      transmitting: transmitting != 0, decoding: decoding != 0,
      rx_df: rx_df, tx_df: tx_df, de_call: de_call, de_grid: de_grid,
      dx_grid: dx_grid
    }}
  end

  defp parse_decode(data) do
    {id, rest} = parse_string(data)
    <<new :: 8, rest :: binary>> = rest
    {time, rest} = parse_time(rest)
    <<snr :: 32-big, rest :: binary>> = rest
    <<d_time :: 64-float, d_freq :: 32-unsigned-big, rest :: binary>> = rest
    {mode, rest} = parse_string(rest)
    {message, _} = parse_string(rest)

    {:decode, %{
      id: id, new: new != 0, time: time, snr: snr, d_time: d_time,
      d_freq: d_freq, mode: mode, message: message
    }}
  end

  defp parse_log(data) do
    {id, rest} = parse_string(data)
    {datetime, rest} = parse_datetime(rest)
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
      :id => id, :datetime => datetime, "call" => call,
      "gridsquare"  => gridsquare, "freq" => freq / 1.0e6, "mode" => mode,
      "rst_sent" => rst_sent, "rst_rcvd" => rst_rcvd, "tx_pwr" => tx_pwr,
      "comment" => comment, "name" => name
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
    {julianDay, rest} = parse_date(data)
    {milliSeconds, rest} = parse_time(rest)
    <<_utc :: 8-unsigned, rest :: binary>> = rest

    datetime = ((julianDay - 2440587.5) * 86400.0)
      |> +(62_167_176_000 + milliSeconds / 1.0e3)
      |> round
      |> :calendar.gregorian_seconds_to_datetime
      |> Timex.DateTime.from

    {datetime, rest}
  end

  defp parse_date(data) do
    <<julianDay :: 64-unsigned-big, rest :: binary>> = data
    {julianDay, rest}
  end

  defp parse_time(data) do
    <<milliSeconds :: 32-unsigned-big, rest :: binary>> = data
    {milliSeconds, rest}
  end
end
