defmodule Contact do
  def valid?(contact) do
    Map.has_key?(contact, "call") && Map.has_key?(contact, "start")
  end

  def start_time(contact) do
    Contact.datetime(contact, "start")
  end

  def end_time(contact) do
    Contact.datetime(contact, "end")
  end

  def datetime(contact, field) do
    contact
    |> Map.get(field)
    |> Contact.parse_datetime()
  end

  def parse_datetime(date) do
    Timex.parse!(date, "{ISO:Extended:Z}")
  end

  def migrate_mode(%{"mode" => mode} = contact) do
    migration = Data.legacy_mode(mode)
    if migration do
      Map.merge(contact, migration)
    else
      contact
    end
  end

  def migrate_mode(contact), do: contact

  def update_band(%{"freq" => freq} = contact) do
    case Data.find_band(freq) do
      %{name: name} -> Map.put(contact, "band", name)
      _ -> contact
    end
  end

  def update_band(contact), do: contact

  def update_dxcc(%{"call" => call} = contact) do
    case DXCC.lookup(call) do
      %{dxcc: dxcc, cqz: cqz, ituz: ituz, cont: cont, country: country} ->
        update = %{
          "dxcc" => dxcc, "cqz" => cqz, "ituz" => ituz, "cont" => cont,
          "country" => country
        }
        Map.merge(contact, update)
      nil -> contact
    end
  end
end
