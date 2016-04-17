use rotor;
use rotor_stream;
use rigctl;
use context;

pub type RigCtl = rotor_stream::Stream<rigctl::RigCtl>;

pub fn new(addr: String, scope: &mut rotor::Scope<context::Context>)
    -> rotor::Response<RigCtl, rotor::Void>
{
    use std::net::ToSocketAddrs;
    let addr = addr.to_socket_addrs().ok().and_then(|mut addrs| addrs.next()).unwrap();
    let sock = rotor::mio::tcp::TcpStream::connect(&addr).unwrap();
    rotor_stream::Stream::<rigctl::RigCtl>::new(sock, (), scope)
}
