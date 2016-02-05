use std::net::TcpStream;
use std::io::{BufReader, BufRead, Write};
use std::thread::sleep;
use std::time::Duration;

pub struct RigCtl {
    connected: bool,
    freq: f64,
    host: String,
    port: u16
}

impl RigCtl {
    pub fn new(host: &str, port: u16) -> RigCtl {
        RigCtl {
            connected: false,
            freq: 0.0,
            host: String::from(host),
            port: port
        }
    }

    pub fn run(&self) {
        let mut stream = TcpStream::connect(&*format!("{}:{}", self.host, self.port)).unwrap();
        let mut reader = BufReader::new(stream.try_clone().unwrap());

        loop {
            stream.write_all(b"+f\n").unwrap();
            stream.write_all(b"+m\n").unwrap();

            let mut line = String::new();
            let result = reader.read_line(&mut line);
            println!("{}", line);

            sleep(Duration::from_secs(1));
        }
    }
}
