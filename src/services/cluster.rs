use config::Config;
use std::thread;
use dxcluster;

pub fn init(config: &Config) {
    if let Some(host) = config.get_str("cluster.host") {
        let port = config.get_int("cluster.port").unwrap_or(23);
        let username = config.get_str("cluster.username");
        let addr = format!("{}:{}", host, port);

        info!("Connecting to the cluster {}...", addr);
        let cluster = dxcluster::Cluster::new(&*addr, username);
        thread::spawn(move || cluster.run());
    }
}
