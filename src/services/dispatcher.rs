use std::sync::mpsc::{channel, Sender, Receiver};
use std::sync::{Arc, RwLock, Mutex};
use std::thread;
use services;

#[derive(Clone, Copy, Debug)]
pub enum Event {
    RigStateChange(services::rigctl::RigState),
}

#[derive(Clone)]
pub struct Dispatcher {
    services: Arc<RwLock<Vec<Mutex<Sender<Event>>>>>
}

impl Dispatcher {
    pub fn subscribe(&self) -> Receiver<Event> {
        let (tx, rx) = channel();
        self.services.write().unwrap().push(Mutex::new(tx));
        rx
    }

    pub fn publish(&self, event: Event) {
        for service in self.services.read().unwrap().iter() {
            service.lock().unwrap().send(event).unwrap();
        }
    }
}

pub fn init() -> Dispatcher {
    Dispatcher { services: Arc::new(RwLock::new(Vec::new())) }
}
