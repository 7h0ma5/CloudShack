defmodule Adif.Parse do
  require Logger

  def contacts(data) do
    data = if String.first(data) != "<" do
      skip_header(data)
    else
      data
    end

    contacts(data, [])
  end

  def contacts(data, list) do
    case contact(data) do
      {nil, ""} -> list
      {contact, ""} -> list ++ [contact]
      {nil, rest} -> contacts(rest, list)
      {contact, rest} -> contacts(rest, list ++ [contact])
    end
  end

  def contact(data) do
    {contact, rest} = fields(data)
    contact = convert_datetimes(contact)

    if contact == %{} do
      {nil, rest}
    else
      {contact, rest}
    end
  end

  def skip_header(data) do
    {field, rest} = field(data)

    case field do
      {"eoh", _, _, _} -> rest
      nil -> rest
      _ -> skip_header(rest)
    end
  end

  defp fields(data, contact \\ %{}) do
    {field, rest} = field(data)

    case field do
      {"eor", _, _, _} -> {contact, rest}
      {_, _, _, nil} -> fields(rest, contact)
      {name, _, _, value} ->
        {name, value} = Adif.Field.decode({name, value})
        if value do
          fields(rest, Map.put(contact, name, value))
        else
          Logger.warn "Ignoring unknown ADIF field '#{name}'"
          fields(rest, contact)
        end
      nil -> {contact, rest}
      _ -> fields(rest, contact)
    end
  end

  defp field(data, state \\ :start, result \\ {"", nil, nil, nil})

  defp field(data, :start, result) do
    case data do
      "<" <> rest -> field(rest, :name, result)
      "" -> {nil, ""}
      <<_ :: bytes-size(1)>> <> rest -> field(rest, :start, result)
    end
  end

  defp field(data, :name, {name, _, _, _} = result) do
    case data do
      ":" <> rest -> field(rest, :length, {name, "", nil, nil})
      ">" <> rest -> {result, rest}
      "" -> {nil, ""}
      <<char :: bytes-size(1)>> <> rest ->
        field(rest, :name, {name <> String.downcase(char), nil, nil, nil})
    end
  end

  defp field(data, :length, {name, length, _, _} = result) do
    case data do
      ":" <> rest -> field(rest, :type, {name, length, "", nil})
      ">" <> rest -> field(rest, :value, result)
      "" -> {nil, ""}
      <<char :: bytes-size(1)>> <> rest ->
        field(rest, :length, {name, length <> char, nil, nil})
    end
  end

  defp field(data, :type, {name, length, type, _} = result) do
    case data do
      ">" <> rest -> field(rest, :value, result)
      "" -> {nil, ""}
      <<char :: bytes-size(1)>> <> rest ->
        field(rest, :type, {name, length, type <> String.downcase(char), nil})
    end
  end

  defp field(data, :value, {name, length, type, _}) do
    length = case Integer.parse(length) do
      {length, ""} -> length
      _ -> 0
    end

    <<value :: bytes-size(length)>> <> rest = data
    {{name, length, type, value}, rest}
  end

  defp convert_datetimes(contact) do
    qso_date = Map.get(contact, "qso_date")
    time_on = Map.get(contact, "time_on")
    datetime_start = parse_datetime(qso_date, time_on)

    qso_date_off = Map.get(contact, "qso_date_off")
    time_off = Map.get(contact, "time_off")
    datetime_end = parse_datetime(qso_date_off, time_off)

    contact = cond do
      datetime_start && datetime_end ->
        contact
        |> Map.put("start", datetime_start)
        |> Map.put("end", datetime_end)
      datetime_start ->
        contact
        |> Map.put("start", datetime_start)
        |> Map.put("end", datetime_start)
      datetime_end ->
        contact
        |> Map.put("start", datetime_end)
        |> Map.put("end", datetime_end)
      true -> contact
    end

    contact
      |> Map.delete("qso_date")
      |> Map.delete("qso_date_off")
      |> Map.delete("time_on")
      |> Map.delete("time_off")
  end

  defp parse_datetime(date, time) do
    date_length = if date, do: String.length(date), else: 0
    time_length = if time, do: String.length(time), else: 0

    datetime = cond do
      date_length == 8 && time_length == 6 ->
        Timex.parse(date <> time, "{YYYY}{0M}{0D}{h24}{m}{s}")
      date_length == 8 && time_length == 4 ->
        Timex.parse(date <> time, "{YYYY}{0M}{0D}{h24}{m}")
      true ->
        nil
    end

    case datetime do
      {:ok, result} ->
        result |> Timex.format!("{YYYY}-{0M}-{0D}T{h24}:{m}:{s}.000Z")
      _ -> nil
    end
  end
end
