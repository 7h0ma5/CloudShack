defmodule Adif.Generate do
  def header do
    "# CloudShack ADIF export\n"
    <> Adif.Generate.field({"adif_ver", "3.0.4"}) <> "\n"
    <> Adif.Generate.field({"programid", "cloudshack"}) <> "\n"
    <> Adif.Generate.field("eoh") <> "\n\n"
  end

  def contact(data) do
    (data
    |> convert_datetimes
    |> Stream.map(&Adif.Field.encode/1)
    |> Stream.filter(fn {_k, v} -> v != nil end)
    |> Stream.map(&Adif.Generate.field/1)
    |> Enum.join(""))
    <> Adif.Generate.field("eor") <> "\n\n"
  end

  def field({key, value}) do
    "<#{String.upcase(key)}:#{String.length(value)}>#{value}"
  end

  def field(key) do
    "<#{String.upcase(key)}>"
  end

  defp convert_datetimes(contact) do
    [{"start", "qso_date", "time_on"}, {"end", "qso_date_off", "time_off"}]
    |> Enum.reduce(contact, fn({field, date_field, time_field}, data) ->
      if value = Map.get(data, field) do
        data
        |> Map.delete(field)
        |> Map.merge(convert_datetime(value, date_field, time_field))
      else
        data
      end
    end)
  end

  defp convert_datetime(datetime, date_field, time_field) do
    datetime = Contact.parse_datetime(datetime)
    %{
      date_field => Timex.format!(datetime, "{0YYYY}{0M}{0D}"),
      time_field => Timex.format!(datetime, "{0h24}{0m}{0s}")
    }
  end
end
