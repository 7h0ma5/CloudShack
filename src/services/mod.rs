pub mod websocket;
pub mod database;
pub mod rigctl;
pub mod dxcluster;
use wsjt;

use context::Context;
use config::Config;
use rotor;

rotor_compose!{
    pub enum Composed/Seed<Context> {
        Wsjt(wsjt::Wsjt),
        Cluster(dxcluster::Cluster),
        Rig(rigctl::RigCtl),
    }
}

pub fn init(config: &Config) -> rotor::LoopInstance<Composed> {
        let event_loop = rotor::Loop::new(&rotor::Config::new()).unwrap();
        let mut loop_inst = event_loop.instantiate(Context::default());

        if let Some(host) = config.get_str("cluster.host") {
            let port = config.get_int("cluster.port").unwrap_or(23);
            let username = config.get_str("cluster.username").map(|val| val.to_owned());
            let addr = format!("{}:{}", host, port);
            info!("Connecting to the cluster {}...", addr);

            loop_inst.add_machine_with(|scope| {
                dxcluster::new(addr, username, scope).wrap(Composed::Cluster)
            }).unwrap();
        }

        if config.get_bool("general.wsjt").unwrap_or(false) {
            info!("Listening for wsjt on port 2237...");
            loop_inst.add_machine_with(|scope| {
                wsjt::Wsjt::new(2237, scope).wrap(Composed::Wsjt)
            }).unwrap();
        }

        if let Some(host) = config.get_str("rig.host") {
            let port = config.get_int("rig.port").unwrap_or(4532);
            let addr = format!("{}:{}", host, port);
            info!("Connecting to the rig {}...", addr);

            loop_inst.add_machine_with(|scope| {
                rigctl::new(addr, scope).wrap(Composed::Rig)
            }).unwrap();
        }

        loop_inst
}
