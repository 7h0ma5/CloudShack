#[macro_use]
extern crate nom;

mod parser;
mod server;

pub use server::Server;

#[test]
fn it_works() {
    let server = Server::new();
    server.run();
}
