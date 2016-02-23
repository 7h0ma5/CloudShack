use config::Config;
use std::thread;
use wsjt;

pub fn init(config: &Config) {
    let wsjt = config.get_bool("general.wsjt").unwrap_or(false);

    if wsjt {
        info!("Starting wsjt server...");
        let server = wsjt::Server::new();
        thread::spawn(move || server.run());
    }
}
