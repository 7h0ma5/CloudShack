defmodule Adif.Field do
  def decode(:string, value) do
    if value = String.strip(value) != "", do: value, else: nil
  end

  def decode(:uppercase, value) do
    decode(:string, String.upcase(value))
  end

  def decode(:lowercase, value) do
    decode(:string, String.downcase(value))
  end

  def decode(:integer, value) do
    case Integer.parse(value) do
      {value, _} -> value
      _ -> nil
    end
  end

  def decode(:float, value) do
    case Float.parse(value) do
      {value, _} -> value
      _ -> nil
    end
  end

  def decode(:boolean, value) do
    case String.upcase(value) do
      "Y" -> true
      "N" -> false
      _ -> nil
    end
  end

  def decode(_, _), do: nil

  def decode({key, value}) do
    {key, type(key) |> decode(value)}
  end

  def encode(:string, value), do: value
  def encode(:uppercase, value), do: String.upcase(value)
  def encode(:lowercase, value), do: String.downcase(value)
  def encode(:integer, value), do: "#{round(value)}"
  def encode(:boolean, true), do: "Y"
  def encode(:boolean, false), do: "N"

  def encode(:float, value) when is_float(value) do
    Float.to_string(value, decimals: 6, compact: true)
  end

  def encode(:float, value) do
    "#{value}"
  end

  def encode(_, _), do: nil

  def encode({key, value}) do
    {key, type(key) |> encode(value)}
  end

  def type(name) do
    case name do
      "adif_ver" -> :string
      "programid" -> :string
      "programversion" -> :string
      "app_cloudshack_id" -> :string
      "app_cloudshack_rev" -> :string
      "address" -> :multiline
      "age" -> :integer
      "a_index" -> :integer
      "ant_az" -> :integer
      "ant_el" -> :integer
      "ant_path" -> :uppercase
      "arrl_sect" -> :uppercase
      "band" -> :lowercase
      "band_rx" -> :lowercase
      "call" -> :string
      "check" -> :string
      "class" -> :string
      "clublog_qso_upload_date" -> :date
      "clublog_qso_upload_status" -> :uppercase
      "cnty" -> :uppercase
      "comment" -> :string
      "cont" -> :uppercase
      "contacted_op" -> :string
      "contest_id" -> :uppercase
      "country" -> :string
      "cqz" -> :integer
      "distance" -> :integer
      "dxcc" -> :integer
      "email" -> :string
      "end" -> :string # ISO 8601 end date
      "eq_call" -> :string
      "eqsl_qslrdate" -> :date
      "eqsl_qslsdate" -> :date
      "eqsl_qsl_rcvd" -> :uppercase
      "eqsl_qsl_sent" -> :uppercase
      "freq" -> :float
      "freq_rx" -> :float
      "gridsquare" -> :uppercase
      "guest_op" -> :string
      "iota" -> :uppercase
      "iota_island_id" -> :string
      "ituz" -> :integer
      "k_index" -> :integer
      "lat" -> :string
      "lon" -> :string
      "lotw_qslrdate" -> :date
      "lotw_qslsdate" -> :date
      "lotw_qsl_rcvd" -> :uppercase
      "lotw_qsl_sent" -> :uppercase
      "max_bursts" -> :integer
      "mode" -> :uppercase
      "my_city" -> :string
      "my_cnty" -> :string
      "my_country" -> :string
      "my_cq_zone" -> :integer
      "my_dxcc" -> :integer
      "my_gridsquare" -> :uppercase
      "my_iota" -> :uppercase
      "my_iota_island_id" -> :string
      "my_itu_zone" -> :integer
      "my_lat" -> :string
      "my_lon" -> :string
      "my_name" -> :string
      "my_postal_code" -> :string
      "my_rig" -> :string
      "my_sota_ref" -> :uppercase
      "my_state" -> :uppercase
      "my_street" -> :string
      "name" -> :string
      "notes" -> :multiline
      "nr_bursts" -> :integer
      "nr_pings" -> :integer
      "operator" -> :string
      "owner_callsign" -> :string
      "pfx" -> :string
      "precedence" -> :string
      "prop_mode" -> :uppercase
      "public_key" -> :string
      "qslmsg" -> :multiline
      "qslrdate" -> :date
      "qslsdate" -> :date
      "qsl_rcvd" -> :uppercase
      "qsl_rcvd_via" -> :uppercase
      "qsl_sent" -> :uppercase
      "qsl_sent_via" -> :uppercase
      "qso_complete" -> :uppercase
      "qso_date" -> :string
      "qso_date_off" -> :string
      "qso_random" -> :boolean
      "qsl_via" -> :uppercase
      "qth" -> :string
      "rig" -> :string
      "rst_rcvd" -> :string
      "rst_sent" -> :string
      "rx_pwr" -> :float
      "sat_mode" -> :string
      "sat_name" -> :string
      "sfi" -> :float
      "srx" -> :integer
      "srx_string" -> :string
      "start" -> :string # ISO 8601 start date
      "state" -> :uppercase
      "station_callsign" -> :string
      "stx" -> :integer
      "stx_string" -> :string
      "submode" -> :uppercase
      "swl" -> :boolean
      "time_on" -> :string
      "time_off" -> :string
      "tx_pwr" -> :integer
      "web" -> :string
      _ -> :unknown
    end
  end
end
