use rotor;
use rotor_stream;
use context;
use dxcluster;

pub type Cluster = rotor_stream::Stream<dxcluster::Cluster>;

pub fn new(addr: String, user: Option<String>, scope: &mut rotor::Scope<context::Context>)
    -> rotor::Response<Cluster, rotor::Void>
{
    use std::net::ToSocketAddrs;
    let addr = addr.to_socket_addrs().ok().and_then(|mut addrs| addrs.next()).unwrap();
    let sock = rotor::mio::tcp::TcpStream::connect(&addr).unwrap();
    rotor_stream::Stream::<dxcluster::Cluster>::new(sock, user, scope)
}
