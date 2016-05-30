defmodule Adif.Generate do
  def header do
    "# CloudShack ADIF export\n"
    <> field({"adif_ver", "3.0.4"}) <> "\n"
    <> field({"programid", "cloudshack"}) <> "\n"
    <> field("eoh") <> "\n\n"
  end

  def contact(data) do
    (data
    |> Stream.map(&(Adif.Field.encode(&1)))
    |> Stream.filter(fn {_k, v} -> v != nil end)
    |> Stream.map(&(Adif.Generate.field(&1)))
    |> Enum.join(""))
    <> field("eor") <> "\n"
  end

  def field({key, value}) do
    "<#{String.upcase(key)}:#{String.length(value)}>#{value}"
  end

  def field(key) do
    "<#{String.upcase(key)}>"
  end
end
