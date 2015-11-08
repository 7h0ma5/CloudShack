use std::net::UdpSocket;
use std::str;

pub struct Server {
    socket: UdpSocket
}

impl Server {
    pub fn new() -> Server {
        Server { socket: UdpSocket::bind(":::2237").unwrap() }
    }

    pub fn run(&self) {
        let mut buffer = [0; 1500];

        loop {
            println!("listening");
            let (amt, src) = self.socket.recv_from(&mut buffer).unwrap();
            let res = ::parser::parse_packet(&buffer[0..amt]);
            println!("data read ({}, {:?}) = {:?}", amt, src, res);
        }
    }
}
