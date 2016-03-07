use std::net::TcpStream;
use std::io::{BufReader, BufRead, Write};

use Spot;

pub struct Cluster {
    addr: String,
    user: Option<String>
}

impl Cluster {
    pub fn new(addr: &str, user: Option<&str>) -> Cluster {
        Cluster { addr: addr.to_owned(), user: user.map(|v| v.to_owned()) }
    }

    pub fn run<C>(&self, callback: C) where C: Fn(Spot) {
        let mut stream = TcpStream::connect(&*self.addr).unwrap();
        let mut reader = BufReader::new(stream.try_clone().unwrap());

        if let Some(ref user) = self.user {
            stream.write_all(user.as_bytes()).unwrap();
            stream.write_all(b"\n").unwrap();
        }

        loop {
            let mut line = String::new();
            let result = reader.read_line(&mut line);

            if result.is_err() { break; }

            if regex!(r"^DX").is_match(&*line) {
                Spot::parse(&*line).map(|spot| callback(spot));
            }
        }
    }
}
