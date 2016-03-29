#![feature(plugin)]
#![plugin(regex_macros)]
extern crate regex;
extern crate rotor;
extern crate rotor_stream;

mod cluster;
mod spot;

pub use cluster::Cluster;
pub use cluster::Context;
pub use spot::Spot;

pub fn new(addr: String, user: Option<String>, scope: &mut rotor::Scope<Context>) -> rotor::Response<rotor_stream::Stream<Cluster>, rotor::Void> {
    use std::net::ToSocketAddrs;
    let addr = addr.to_socket_addrs().ok().and_then(|mut addrs| addrs.next()).unwrap();
    let sock = rotor::mio::tcp::TcpStream::connect(&addr).unwrap();
    rotor_stream::Stream::<Cluster>::new(sock, user, scope)
}
