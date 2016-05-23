defmodule Contact do
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
