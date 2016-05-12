defmodule CloudShack.Mixfile do
  use Mix.Project

  def project do
    [app: :cloudshack,
     version: "0.5.0",
     elixir: "~> 1.2",
     build_embedded: Mix.env == :prod,
     start_permanent: Mix.env == :prod,
     deps: deps]
  end

  # Configuration for the OTP application
  #
  # Type "mix help compile.app" for more information
  def application do
    [applications: [
        :cowboy, :plug, :httpoison, :poison, :sweet_xml, :couchdb, :gproc,
        :logger
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
      {:cowboy, "~> 1.0.4"},
      {:plug, "~> 1.1.4"},
      {:sweet_xml, "~> 0.6.1"},
      {:httpoison, "~> 0.8.2"},
      {:poison, "~> 2.1.0"},
      {:couchdb, github: "7h0ma5/elixir-couchdb"},
      {:gproc, "~> 0.5.0"},
      {:exrm, "~> 1.0.3"}
    ]
  end
end
