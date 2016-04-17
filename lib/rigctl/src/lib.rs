extern crate rotor;
extern crate rotor_stream;
extern crate context;

use std::time::Duration;
use rotor::mio::tcp::{TcpStream};
use rotor_stream::{Transport, Protocol, Intent, Exception};
use rotor::{Scope};
use context::{Context, RigMode};

pub enum RigCtl {
    SendCommand(String),
    Receive
}

impl RigCtl {
    /*
    pub fn set_frequency(&self, frequency: f64) {
        if let Ok(mut stream) = self.stream.try_clone() {
            stream.write_all(format!("F {}", (frequency * 1e6) as u64).as_bytes()).ok();
        }
    }

    pub fn set_mode(&self, mode: RigMode, passband: u32) {
        if let Ok(mut stream) = self.stream.try_clone() {
            stream.write_all(format!("M {:?} {}", mode, passband).as_bytes()).ok();
        }
    }
    */

    fn parse(line: &str, scope: &mut Scope<Context>) -> bool {
        let mut split = line.split(": ");

        let key = split.next();
        if key.is_none() { return false; }

        let value = split.next().map(|val| val.trim()).unwrap_or("");

        match key.unwrap() {
            "Mode" => RigCtl::update_mode(value, scope),
            "Frequency" => RigCtl::update_frequency(value, scope),
            "Passband" => RigCtl::update_passband(value, scope),
            _ => false
        }
    }

    fn update_mode(mode: &str, scope: &mut Scope<Context>) -> bool {
        let mode = match mode {
            "FM" => RigMode::FM,
            "AM" => RigMode::AM,
            "USB" => RigMode::USB,
            "LSB" => RigMode::LSB,
            "CW" => RigMode::CW,
            _ => RigMode::UNKNOWN
        };
        let changed = scope.rig.mode != mode;
        if changed { scope.rig.mode = mode; }
        changed
    }

    fn update_frequency(frequency: &str, scope: &mut Scope<Context>) -> bool {
        let frequency = frequency.parse::<u64>().unwrap_or(0);
        let changed = scope.rig.freq != frequency;
        if changed { scope.rig.freq = frequency; }
        changed
    }

    fn update_passband(passband: &str, scope: &mut Scope<Context>) -> bool {
        let passband = passband.parse::<u32>().unwrap_or(0);
        let changed = scope.rig.passband != passband;
        if changed { scope.rig.passband = passband; }
        changed
    }
}

impl<'a> Protocol for RigCtl {
    type Context = Context;
    type Socket = TcpStream;
    type Seed = ();

    fn create(_: Self::Seed, _sock: &mut TcpStream, scope: &mut Scope<Context>) -> Intent<Self> {
        Intent::of(RigCtl::Receive)
            .expect_delimiter(b"\n", 256)
            .deadline(scope.now() + Duration::new(1, 0))
    }

    fn bytes_flushed(self, transport: &mut Transport<TcpStream>, scope: &mut Scope<Context>) -> Intent<Self> {
        match self {
            RigCtl::SendCommand(cmd) => {
                transport.output().extend(cmd.as_bytes());
                Intent::of(RigCtl::Receive)
                    .expect_delimiter(b"\n", 256)
                    .deadline(scope.now() + Duration::new(1, 0))
            }
            _ => unreachable!()
        }
    }

    fn bytes_read(self, transport: &mut Transport<TcpStream>, end: usize, scope: &mut Scope<Context>) -> Intent<Self> {
        match self {
            RigCtl::Receive => {
                {
                    let line = String::from_utf8_lossy(&transport.input()[..end]);
                    RigCtl::parse(&*line, scope);
                }
                transport.input().consume(end + 1);
                println!("{:?}", scope.rig);
                Intent::of(RigCtl::Receive)
                    .expect_delimiter(b"\n", 4096)
            }
            _ => unreachable!()
        }
    }

    fn timeout(self, _transport: &mut Transport<TcpStream>, _scope: &mut Scope<Context>) -> Intent<Self> {
        Intent::of(RigCtl::SendCommand(String::from("+f\n+m\n"))).expect_flush()
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
