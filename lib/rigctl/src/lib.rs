use std::net::TcpStream;
use std::io::{BufReader, BufRead, Write};
use std::sync::{RwLock, Mutex};

#[derive(Debug, Clone, Copy, PartialEq)]
enum RigMode {
    FM, AM, USB, LSB, CW, UNKNOWN
}

#[derive(Debug, Clone, Copy)]
pub struct RigState {
    connected: bool,
    frequency: f64,
    mode: RigMode,
    passband: u32
}

pub struct RigCtl {
    state: RwLock<RigState>,
    stream: TcpStream,
    reader: Mutex<BufReader<TcpStream>>
}

impl RigCtl {
    pub fn new(host: &str, port: u16) -> std::io::Result<RigCtl> {
        let stream = try!(TcpStream::connect(&*format!("{}:{}", host, port)));
        let reader = BufReader::new(try!(stream.try_clone()));

        let state = RigState {
            connected: false,
            frequency: 0.0,
            mode: RigMode::UNKNOWN,
            passband: 0
        };

        Ok(RigCtl {
            state: RwLock::new(state),
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

    pub fn set_frequency(&self, frequency: f64) -> std::io::Result<()> {
        let mut stream = try!(self.stream.try_clone());
        try!(stream.write_all(format!("F {}", (frequency * 1e6) as u64).as_bytes()));
        Ok(())
    }

    pub fn set_mode(&self, mode: &str, passband: u32) -> std::io::Result<()> {
        let mut stream = try!(self.stream.try_clone());
        try!(stream.write_all(format!("M {} {}", mode, passband).as_bytes()));
        Ok(())
    }

    pub fn read(&self) -> std::io::Result<Option<RigState>> {
        let mut line = String::new();
        let bytes_read = try!(self.reader.lock().unwrap().read_line(&mut line));

        if bytes_read > 0 {
            if self.parse_line(line) {
                Ok(Some(self.state.read().unwrap().clone()))
            }
            else {
                Ok(None)
            }
        }
        else {
            Err(std::io::Error::new(std::io::ErrorKind::BrokenPipe, "connection lost"))
        }
    }

    fn parse_line(&self, line: String) -> bool {
        let mut split = line.split(": ");

        let key = split.next();
        if key.is_none() { return false; }

        let value = split.next().map(|val| val.trim()).unwrap_or("");

        match key.unwrap() {
            "Mode" => self.update_mode(value),
            "Frequency" => self.update_frequency(value),
            "Passband" => self.update_passband(value),
            _ => false
        }
    }

    fn update_mode(&self, mode: &str) -> bool {
        let mode = match mode {
            "FM" => RigMode::FM,
            "AM" => RigMode::AM,
            "USB" => RigMode::USB,
            "LSB" => RigMode::LSB,
            "CW" => RigMode::CW,
            _ => RigMode::UNKNOWN
        };
        let changed = self.state.read().unwrap().mode != mode;
        if changed { self.state.write().unwrap().mode = mode; }
        changed
    }

    fn update_frequency(&self, frequency: &str) -> bool {
        let frequency = frequency.parse::<f64>().unwrap_or(0.0) / 1e6;
        let changed = self.state.read().unwrap().frequency != frequency;
        if changed { self.state.write().unwrap().frequency = frequency; }
        changed
    }

    fn update_passband(&self, passband: &str) -> bool {
        let passband = passband.parse::<u32>().unwrap_or(0);
        let changed = self.state.read().unwrap().passband != passband;
        if changed { self.state.write().unwrap().passband = passband; }
        changed
    }
}
