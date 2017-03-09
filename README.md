# CloudShack

  [![Build Status](https://img.shields.io/travis/7h0ma5/CloudShack.svg?style=flat)](https://travis-ci.org/7h0ma5/CloudShack)
  [![GitHub issues](https://img.shields.io/github/issues/7h0ma5/cloudshack.svg?style=flat)](https://github.com/7h0ma5/cloudshack/issues)
  [![GitHub release](https://img.shields.io/github/release/7h0ma5/CloudShack.svg?maxAge=2592000)](https://github.com/7h0ma5/CloudShack/releases)

CloudShack is an amateur radio logbook server which provides a RESTful API and a
built-in web interface.

The goal is to create a multiplatform logbook software which does not depend on
an internet connection but automatically synchronizes data when there is a connection available.

## Features

- ADIF import/export
- LotW QSL import
- DX cluster integration
- HamQTH callbook integration
- Remote rig control via the hamlib rigctld
- WSJT-X support

## Installation

To build CloudShack you need [Elixir](http://elixir-lang.org/) and [Node.js](https://nodejs.org/en/).

```bash
git clone --recursive https://github.com/7h0ma5/CloudShack.git
cd CloudShack

# Build the webapp
(cd webapp && npm install && npm run build)

# Build the server
export MIX_ENV=prod
mix deps.get && mix compile && mix release

# Run CloudShack
./rel/cloudshack/bin/cloudshack console
```

## License

Copyright (C) 2014-2016 Thomas Gatzweiler, DL2IC

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
