defmodule CloudShack.Mixfile do
  use Mix.Project

  def project do
    [app: :cloudshack,
     version: "0.5.0",
     elixir: "~> 1.4",
     description: "Amateur Radio Logbook Server",
     build_embedded: Mix.env == :prod,
     start_permanent: Mix.env == :prod,
     deps: deps(),
     package: package()]
  end

  def package do
    [external_dependencies: [],
     license_file: "LICENSE",
     files: [ "lib", "mix.exs", "README*", "LICENSE"],
     maintainers: ["Thomas Gatzweiler <mail@cloudshack.org>"],
     licenses: ["GPL-3"],
     vendor: "CloudShack",
     links:  %{
       "GitHub" => "https://github.com/7h0ma5/CloudShack",
       "Docs" => "http://cloudshack.org",
       "Homepage" => "http://cloudshack.org"
     }
    ]
  end

  # Configuration for the OTP application
  #
  # Type "mix help compile.app" for more information
  def application do
    [applications: [
        :cowboy, :plug, :httpoison, :poison, :sweet_xml, :timex, :couchdb,
        :gproc, :logger
      ],
     mod: {CloudShack, []}]
  end

  # Dependencies can be Hex packages:
  #
  #   {:mydep, "~> 0.3.0"}
  #
  # Or git/path repositories:
  #
  #   {:mydep, git: "https://github.com/elixir-lang/mydep.git", tag: "0.1.0"}
  #
  # Type "mix help deps" for more examples and options
  defp deps do
    [
      {:cowboy, "~> 1.1.2"},
      {:plug, "~> 1.3.0"},
      {:sweet_xml, "~> 0.6.4"},
      {:httpoison, "~> 0.11.0"},
      {:poison, "~> 3.1.0"},
      {:timex, "~> 3.1.8"},
      {:couchdb, github: "7h0ma5/elixir-couchdb"},
      {:gproc, "~> 0.6.1"},
      {:distillery, "~> 1.4.1"}
    ]
  end
end
