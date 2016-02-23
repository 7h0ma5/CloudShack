use config::Config;
use rigctl::RigCtl;
use services::{Dispatcher, Event};
use std::sync::Arc;
use std::thread;
use std::time::Duration;

pub use rigctl::RigState;

pub fn poll(rig: Arc<RigCtl>) {
    loop {
        rig.poll().unwrap();
        thread::sleep(Duration::from_millis(1000));
    }
}

pub fn run(rig: Arc<RigCtl>, dispatcher: Dispatcher) {
    loop {
        let state = rig.read().unwrap();
        if let Some(state) = state {
            println!("new rig state {:?}", state);
            dispatcher.publish(Event::RigStateChange(state));
        }
    }
}

pub fn listen(rig: Arc<RigCtl>, dispatcher: Dispatcher) {
    let rx = dispatcher.subscribe();
    for event in rx.recv() {
        println!("{:?}", event);
    }
}

pub fn init(config: &Config, dispatcher: Dispatcher) {
    let port = config.get_int("rig.port").unwrap_or(4532) as u16;
    let host = config.get_str("rig.host").map(|s| String::from(s));

    if let Some(host) = host {
        thread::spawn(move || loop {
            info!("Connecting to the rig...");
            let rig = RigCtl::new(&*host, port);

            if let Ok(rig) = rig {
                let rig = Arc::new(rig);
                let rig2 = rig.clone();
                let rig3 = rig.clone();

                let dispatcher_listen = dispatcher.clone();
                let dispatcher_run = dispatcher.clone();

                let handle1 = thread::spawn(move || poll(rig));
                let handle2 = thread::spawn(move || run(rig2, dispatcher_run));
                let handle3 = thread::spawn(move || listen(rig3, dispatcher_listen));

                handle1.join().ok();
                handle2.join().ok();
            }
            else {
                thread::sleep(Duration::from_millis(5000));
            }
        });
    }
    else {
        info!("No rig connection supplied...");
    }
}
