# CloudShack

  [![NPM Version](https://img.shields.io/npm/v/cloudshack.svg?style=flat)](https://www.npmjs.org/package/cloudshack)
  [![Build Status](https://img.shields.io/travis/7h0ma5/CloudShack.svg?style=flat)](https://travis-ci.org/7h0ma5/CloudShack)
  [![Coverage](https://img.shields.io/coveralls/7h0ma5/CloudShack.svg?style=flat)](https://coveralls.io/r/7h0ma5/CloudShack)

CloudShack is an amateur radio logbook server which provides a RESTful API and a
built-in web interface.

The goal is to create a multiplatform logbook software which does not depend on
an internet connection but automatically synchronizes with other database
instances when there is a connection available.

## Features

- ADIF import/export
- LotW QSL import
- DX cluster integration
- HamQTH callbook integration
- Remote rig control via the hamlib rigctld

## Installation

The only requirement for CloudShack is [node.js](http://www.nodejs.org) and
a running instance of [CouchDB](http://couchdb.apache.org).

### With npm

    # npm install -g cloudshack

### From source

    $ cd CloudShack
    $ npm install
    $ npm start

### Arch Linux

There is a [CloudShack AUR package](https://aur.archlinux.org/packages/cloudshack-git/) available.

    $ yaourt -S cloudshack-git couchdb
    $ systemctl start couchdb
    $ systemctl start cloudshack

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
