use std::time::Duration;
use rotor::mio::tcp::{TcpStream};
use rotor_stream::{Transport, Protocol, Intent, Exception};
use rotor::{Scope};
use spot::Spot;

pub struct Context;

pub enum Cluster {
    SendCommand(String),
    Receive
}

impl<'a> Protocol for Cluster {
    type Context = Context;
    type Socket = TcpStream;
    type Seed = Option<String>;

    fn create(user: Self::Seed, _sock: &mut TcpStream, scope: &mut Scope<Context>) -> Intent<Self> {
        if let Some(user) = user {
            Intent::of(Cluster::SendCommand(user + "\n"))
                .expect_flush()
                .deadline(scope.now() + Duration::new(10, 0))
        }
        else {
            Intent::of(Cluster::Receive)
                 .expect_delimiter(b"\n", 4096)
        }
    }

    fn bytes_flushed(self, transport: &mut Transport<TcpStream>, _scope: &mut Scope<Context>) -> Intent<Self> {
        match self {
            Cluster::SendCommand(cmd) => {
                transport.output().extend(cmd.as_bytes());
                Intent::of(Cluster::Receive)
                    .expect_delimiter(b"\n", 4096)
            }
            _ => unreachable!()
        }
    }

    fn bytes_read(self, transport: &mut Transport<TcpStream>, end: usize, _scope: &mut Scope<Context>) -> Intent<Self> {
        match self {
            Cluster::Receive => {
                let spot = {
                    let line = String::from_utf8_lossy(&transport.input()[..end]);
                    let spot = Spot::parse(&*line);
                    println!("new spot: {:?}", spot);
                    spot
                };
                transport.input().consume(end + 1);
            }
            _ => unreachable!()
        }
        Intent::of(Cluster::Receive)
            .expect_delimiter(b"\n", 4096)
    }

    fn timeout(self, _transport: &mut Transport<TcpStream>, _scope: &mut Scope<Context>) -> Intent<Self> {
        println!("Timeout reached");
        Intent::done()
    }

    fn wakeup(self, _transport: &mut Transport<TcpStream>, _scope: &mut Scope<Context>) -> Intent<Self> {
        unreachable!();
    }

    fn exception(self, _transport: &mut Transport<Self::Socket>, reason: Exception, scope: &mut Scope<Self::Context>) -> Intent<Self> {
        println!("Error when fetching data: {}", reason);
        scope.shutdown_loop();
        Intent::done()
    }

    fn fatal(self, reason: Exception, scope: &mut Scope<Self::Context>) -> Option<Box<::std::error::Error>> {
        println!("Error when fetching data: {}", reason);
        scope.shutdown_loop();
        None
    }
}
