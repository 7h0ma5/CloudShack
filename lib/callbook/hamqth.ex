defmodule Callbook.Hamqth do
  use GenServer
  import SweetXml

  @endpoint "https://www.hamqth.com/xml.php"

  @map [
    call: ~x"/HamQTH/search/callsign/text()"s,
    name: ~x"/HamQTH/search/nick/text()"s,
    qth: ~x"/HamQTH/search/qth/text()"s,
    dxcc: ~x"/HamQTH/search/adif/text()"s,
    gridsquare: ~x"/HamQTH/search/grid/text()"s,
    cqz: ~x"/HamQTH/search/cq/text()"s,
    ituz: ~x"/HamQTH/search/itu/text()"s,
    lon: ~x"/HamQTH/search/longitude/text()"s,
    lat: ~x"/HamQTH/search/latitude/text()"s,
    cont: ~x"/HamQTH/search/continent/text()"s,
    qsl_via: ~x"/HamQTH/search/qsl_via/text()"s,
  ]

  def start_link(config) do
    GenServer.start_link(__MODULE__, config, [name: __MODULE__])
  end

  def lookup(callsign) do
    GenServer.call(__MODULE__, {:lookup, callsign})
  end

  def init(config) do
    {:ok, %{:user => config[:user], :password => config[:password], :session => nil}}
  end

  def handle_call({:lookup, callsign}, _from, state) do
    if !state[:session] do
      state = authenticate(state)
    end

    if state[:session] do
      result = query(callsign, state)
      {:reply, result, state}
    else
      {:reply, {:unauthorized}, state}
    end
  end

  def query(callsign, state) do
    params = %{id: state.session, callsign: callsign, prg: "CloudShack"}
    response = HTTPoison.get(@endpoint, [], [params: params])

    case response do
      {:ok, response} ->
        entry = parse_entry(response.body)
        {:ok, entry}
      {:error, _} ->
        {:error}
    end
  end

  def authenticate(state) do
    params = %{u: state.user, p: state.password}
    response = HTTPoison.get(@endpoint, [], [params: params])

    case response do
      {:ok, response} ->
        session = parse_session(response.body)
        Map.put(state, :session, session)
      _ ->
        Map.put(state, :session, nil)
    end
  end

  def parse_session(data) do
    data |> SweetXml.xpath(~x"/HamQTH/session/session_id/text()") |> to_string
  end

  def parse_entry(data) do
    data |> SweetXml.xmap(@map)
  end
end
