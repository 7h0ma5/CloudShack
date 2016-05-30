defmodule Contact do
  def start_time(contact) do
    Contact.date(contact, "start")
  end

  def end_time(contact) do
    Contact.date(contact, "end")
  end

  def datetime(contact, field) do
    contact
    |> Map.get(field)
    |> Contact.parse_datetime()
  end

  def parse_datetime(date) do
    Timex.parse!(date, "{ISO:Extended:Z}")
  end

  def update_band(contact) do
    if freq = Map.get(contact, "freq") do
      case Data.find_band(freq) do
        %{name: name} -> Map.put(contact, "band", name)
        _ -> contact
      end
    else
      contact
    end
  end
end
