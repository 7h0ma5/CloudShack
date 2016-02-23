use std::net::TcpStream;
use std::io::{BufReader, BufRead, Write};
use std::sync::{RwLock, Mutex};

pub struct RigState {
    connected: bool,
    freq: f64,
}

pub struct RigCtl {
    rig_state: RwLock<RigState>,
    stream: TcpStream,
    reader: Mutex<BufReader<TcpStream>>
}

impl RigCtl {
    pub fn new(host: &str, port: u16) -> std::io::Result<RigCtl> {
        let stream = try!(TcpStream::connect(&*format!("{}:{}", host, port)));
        let reader = BufReader::new(try!(stream.try_clone()));

        let state = RigState {
            connected: false,
            freq: 0.0
        };

        Ok(RigCtl {
            rig_state: RwLock::new(state),
            stream: stream,
            reader: Mutex::new(reader)
        })
    }

    pub fn poll(&self) -> std::io::Result<()> {
        let mut stream = try!(self.stream.try_clone());
        try!(stream.write_all(b"+f\n"));
        try!(stream.write_all(b"+m\n"));
        Ok(())
    }

    pub fn read(&self) -> std::io::Result<()> {
        let mut line = String::new();
        let bytes_read = try!(self.reader.lock().unwrap().read_line(&mut line));

        if bytes_read > 0 {
            Ok(())
        }
        else {
            Err(std::io::Error::new(std::io::ErrorKind::BrokenPipe, "connection lost"))
        }
    }
}
