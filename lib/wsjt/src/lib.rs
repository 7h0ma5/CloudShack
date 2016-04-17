#[macro_use]
extern crate nom;
extern crate rotor;
extern crate context;

mod parser;

use rotor::{EventSet, PollOpt, Void};
use rotor::mio::udp::{UdpSocket};
use rotor::{Machine, Response, Scope};
use parser::{Packet, Status};
use context::Context;

pub enum Wsjt {
    Reading(UdpSocket)
}

impl Wsjt {
    pub fn new(port: u16, scope: &mut Scope<Context>) -> Response<Wsjt, Void> {
        use std::net::{SocketAddr, IpAddr, Ipv6Addr};
        let sock = UdpSocket::v6().unwrap();
        sock.bind(&SocketAddr::new(IpAddr::V6(Ipv6Addr::new(0, 0, 0, 0, 0, 0, 0, 0)), port)).unwrap();
        scope.register(&sock, EventSet::readable(), PollOpt::level()).unwrap();
        Response::ok(Wsjt::Reading(sock))
    }

    pub fn packet(packet: Packet, scope: &mut Scope<Context>) {
        match packet {
            Packet::Status(status) => Wsjt::status(status, scope),
            _ => {}
        }
    }

    pub fn status(status: Status, scope: &mut Scope<Context>) {
        scope.rig.freq = status.freq;
    }
}

impl Machine for Wsjt {
    type Context = Context;
    type Seed = Void;

    fn create(_seed: Void, _scope: &mut Scope<Context>) -> Response<Self, Void> {
        unreachable!();
    }

    fn ready(self, _events: EventSet, scope: &mut Scope<Context>) -> Response<Self, Void> {
        match self {
            Wsjt::Reading(sock) => {
                let mut buffer = [0; 1500];

                match sock.recv_from(&mut buffer) {
                    Err(_e) => {
                        scope.deregister(&sock).unwrap();
                        scope.shutdown_loop();
                        Response::done()
                    },
                    Ok(Some((size, _sock))) => {
                        let res = ::parser::parse(&buffer[0..size]);
                        if let Some(packet) = res { Wsjt::packet(packet, scope) }
                        Response::ok(Wsjt::Reading(sock))
                    },
                    Ok(None) => {
                        scope.deregister(&sock).unwrap();
                        scope.shutdown_loop();
                        Response::done()
                    }
                }
            }
        }
    }

    fn spawned(self, _scope: &mut Scope<Context>) -> Response<Self, Void> {
        unreachable!();
    }

    fn timeout(self, _scope: &mut Scope<Context>) -> Response<Self, Void> {
        unreachable!();
    }

    fn wakeup(self, _scope: &mut Scope<Context>) -> Response<Self, Void> {
        unreachable!();
    }
}
