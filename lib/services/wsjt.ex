defmodule WSJT do
  use GenServer
  require Logger

  @prefix <<173, 188, 203, 218, 3 :: 32-big>>

  @cq_re ~r/^CQ (DX )?([A-Z0-9\/]+) ?([A-Z]{2}[0-9]{2})?/
  @msg_re ~r/^([A-Z0-9\/]+) ([A-Z0-9\/]+) ([\-\+A-Z0-9\/]*)/

  def start_link(config) do
    GenServer.start_link(__MODULE__, config, [name: __MODULE__])
  end

  def halt() do
    GenServer.cast(__MODULE__, {:cmd, :halt})
  end

  def init(config) do
    Logger.debug "Starting WSJT server..."
    port = Map.get(config, :port, 2237)

    forward_host = Map.get(config, :forward_host, {127, 0, 0, 1})
    forward_port = Map.get(config, :forward_port)

    {:ok, socket} = :gen_udp.open(port, [:binary, :inet, ip: {0, 0, 0, 0}, active: true])

    {:ok, {socket, %{
              :forward => {forward_host, forward_port},
              :address => nil
           }}}
  end

  def handle_info({:udp, _, ip, port, data}, state) do
    {socket, params} = state

    case Map.get params, :forward do
      {_, nil} ->
        # do nothing
        nil
      {forward_host, forward_port} ->
        :gen_udp.send(socket, forward_host, forward_port, data)
    end

    packet = case data do
      <<173, 188, 203, 218, _schema :: size(32), rest :: binary>> ->
        try do
          parse_packet(rest)
        rescue
          MatchError -> {:invalid}
        end
      _ -> {:invalid}
    end

    case packet do
      {:heartbeat, heartbeat} ->
        {:noreply, {socket, params |> Map.put(:address, {ip, port, Map.get(heartbeat, :id)})}}
      _ ->
        process_packet(packet)
        {:noreply, state}
    end
  end

  def handle_cast({:cmd, halt}, {socket, params}) do
    case Map.get(params, :address) do
      {ip, port, id} ->
        len = byte_size(id)
        msg = @prefix <> <<8 :: 32-big, len :: 32-signed-big>> <> id <> <<0>>
        :gen_udp.send(socket, ip, port, msg)
      _ ->
        Logger.warn "No WSJT-X address received yet"
    end
    {:noreply, {socket, params}}
  end

  defp process_packet({:status, status}) do
    %{freq: freq} = status
    CloudShack.State.update(:rig, %{freq: freq})
    :gproc.send({:p, :l, :websocket}, {:wsjt_status, status})
  end

  defp process_packet({:log, log}) do
    profile = Map.get(CloudShack.State.get(:profile) || %{}, "fields", %{})

    start_time = Map.get(log, :time_on)
      |> Timex.format!("{YYYY}-{0M}-{0D}T{h24}:{m}:{s}.000Z")

    end_time = Map.get(log, :time_off)
      |> Timex.format!("{YYYY}-{0M}-{0D}T{h24}:{m}:{s}.000Z")

    contact = log
      |> Map.delete(:id)
      |> Map.delete(:time_on)
      |> Map.delete(:time_off)
      |> Map.put("start", start_time)
      |> Map.put("end", end_time)
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

  defp process_packet({:decode, decode}) do
    {type, sender, receiver} = try do
      parse_message(Map.get(decode, :message))
    rescue
      MatchError -> {nil, nil, nil}
    end

    dxcc = if sender do
      DXCC.lookup(sender)
    else
      nil
    end

    decode = Map.merge(decode, %{
      :type => type,
      :sender => sender,
      :receiver => receiver,
      :dxcc => dxcc
    })

    :gproc.send({:p, :l, :websocket}, {:wsjt_decode, decode})
  end

  defp process_packet(_) do
    Logger.warn "Unknown WSJT packet received"
    # ignore
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
    <<max_schema :: 32-big, rest :: binary>> = rest
    {version, rest} = parse_string(rest)
    {revision, _rest} = parse_string(rest)

    {:heartbeat, %{
      id: id,
      max_schema: max_schema,
      version: version,
      revision: revision
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
    <<snr :: 32-signed-big, rest :: binary>> = rest
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
    {time_on, rest} = parse_datetime(rest)
    {call, rest} = parse_string(rest)
    {gridsquare, rest} = parse_string(rest)
    <<freq :: 64-unsigned-big, rest :: binary>> = rest
    {mode, rest} = parse_string(rest)
    {rst_sent, rest} = parse_string(rest)
    {rst_rcvd, rest} = parse_string(rest)
    {tx_pwr, rest} = parse_string(rest)
    {comment, rest} = parse_string(rest)
    {name, rest} = parse_string(rest)
    {time_off, _} = parse_datetime(rest)

    {tx_pwr, _} = Float.parse(tx_pwr)

    {:log, %{
      :id => id, :time_on => time_on, :time_off => time_off, "call" => call,
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
      |> Kernel.+(62_167_176_000 + milliSeconds / 1.0e3)
      |> round
      |> :calendar.gregorian_seconds_to_datetime
      |> Timex.to_datetime("Etc/UTC")

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

  defp parse_message(msg) do
    if String.starts_with?(msg, "CQ") do
      [_, _dx, sender, _grid] = Regex.run(@cq_re, msg)
      {:cq, sender, nil}
    else
      [_, receiver, sender, payload] = Regex.run(@msg_re, msg)
      type = case payload do
        "+" <> _ -> :snr
        "-" <> _ -> :snr
        "RRR" -> :rrr
        "73" -> :r73
        "R73"-> :r73
        "RR73" -> :r73
        _ -> nil
      end
      {type, sender, receiver}
    end
  end
end
