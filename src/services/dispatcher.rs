use std::sync::mpsc::{channel, Sender, Receiver};
use std::sync::{Arc, RwLock, Mutex};
use std::collections::HashMap;
use services;

#[derive(Debug, Clone)]
pub enum Event {
    RigStateChange(services::rigctl::RigState),
    SpotReceived(services::cluster::Spot),
    SetFrequency(f64),
    SetMode(services::rigctl::RigMode, u32),
    SubscriptionCanceled
}

#[derive(Clone)]
pub struct Dispatcher {
    services: Arc<RwLock<HashMap<String, Mutex<Sender<Event>>>>>
}

impl Dispatcher {
    pub fn subscribe(&self, id: &str) -> Receiver<Event> {
        let key = String::from(id);
        let (tx, rx) = channel();
        let mut services = self.services.write().unwrap();

        if let Some(old_service) = services.insert(key, Mutex::new(tx)) {
            old_service.lock().unwrap().send(Event::SubscriptionCanceled).ok();
        }

        rx
    }

    pub fn publish(&self, event: Event) {
        info!("PUBLISH: {:?}", event);
        for service in self.services.read().unwrap().values() {
            service.lock().unwrap().send(event.clone()).ok();
        }
    }
}

pub fn init() -> Dispatcher {
    Dispatcher { services: Arc::new(RwLock::new(HashMap::new())) }
}
