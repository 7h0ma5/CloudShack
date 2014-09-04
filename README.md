# CloudShack

CloudShack is an amateur radio logbook server which provides a RESTful API and a
built-in web interface.

The goal is to create a multiplatform logbook software which does not depend on
an internet connection but automatically synchronizes with other database
instances when there is a connection available.

## Features

- ADIF import/export
- LotW QSL import
- DX cluster integration
- Remote rig control via the hamlib rigctld

## Installation

There are currently no binary distributions of CloudShack, so you have to build
it yourself. The only requirement is [node.js](http://www.nodejs.org).

To fetch all libraries and build everything just run the following command:

    node run build

Now the server can be started by running:

    node start

## License
Copyright (C) 2014 Thomas Gatzweiler, DL2IC

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
