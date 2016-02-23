use std::sync::mpsc::{channel, Sender, Receiver};
use std::sync::{Arc, RwLock, Mutex};
use std::thread;

#[derive(Clone, Copy, Debug)]
pub enum Event {
    FrequencyChange(f64)
}

#[derive(Clone)]
pub struct Dispatcher {
    sender: Sender<Event>,
    services: Arc<RwLock<Vec<Mutex<Sender<Event>>>>>
}

impl Dispatcher {
    pub fn work(&self, receiver: Receiver<Event>) {
        loop {
            let msg = receiver.recv().unwrap();
        }
    }

    pub fn subscribe(&self) -> Receiver<Event> {
        let (tx, rx) = channel();
        self.services.write().unwrap().push(Mutex::new(tx));
        rx
    }

    pub fn publish(&self, event: Event) {
        for service in self.services.read().unwrap().iter() {
            service.lock().unwrap().send(event);
        }
    }
}

pub fn init() -> Dispatcher {
    let (tx, rx) = channel();
    let dispatcher = Dispatcher { sender: tx, services: Arc::new(RwLock::new(Vec::new())) };

    let dispatcher2 = dispatcher.clone();
    thread::spawn(move || dispatcher2.work(rx));

    dispatcher
}
