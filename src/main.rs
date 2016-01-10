extern crate iron;
extern crate plugin;
extern crate router;
extern crate mount;
extern crate staticfile;
extern crate bodyparser;
extern crate urlencoded;
extern crate persistent;
extern crate url;

extern crate chrono;
extern crate rustc_serialize;
extern crate toml;
extern crate adif;
extern crate couchdb;
extern crate wsjt;
extern crate dxcc;
extern crate dxcluster;

#[macro_use]
extern crate log;
extern crate env_logger;

//mod ws;
mod database;
mod controllers;
mod middleware;
mod config;

use iron::prelude::*;
use std::thread;

pub fn version() -> String {
    format!("{}.{}.{}{}", env!("CARGO_PKG_VERSION_MAJOR"),
                         env!("CARGO_PKG_VERSION_MINOR"),
                         env!("CARGO_PKG_VERSION_PATCH"),
                         option_env!("CARGO_PKG_VERSION_PRE").unwrap_or(""))
}

fn init_logging() {
    let format = |record: &log::LogRecord| {
        format!("{} - {}", record.level(), record.args())
    };

    let mut builder = env_logger::LogBuilder::new();
    builder.format(format).filter(None, log::LogLevelFilter::Info);

    if let Ok(ref value) = ::std::env::var("RUST_LOG") {
       builder.parse(value);
    }

    builder.init().unwrap();
}

pub fn main() {
    init_logging();

    info!("CloudShack version {}", version());

    debug!("Loading configuration from config.toml...");
    let config = config::Config::load();

    let port = config.get_int("general.port").unwrap_or(7373);
    let wsjt = config.get_bool("general.wsjt").unwrap_or(false);

    if wsjt {
        info!("Starting wsjt server...");
        let server = wsjt::Server::new();
        thread::spawn(move || server.run());
    }

    if let Some(host) = config.get_str("cluster.host") {
        let port = config.get_int("cluster.port").unwrap_or(23);
        let username = config.get_str("cluster.username");
        let addr = format!("{}:{}", host, port);

        info!("Connecting to the cluster {}...", addr);
        let cluster = dxcluster::Cluster::new(&*addr, username);
        thread::spawn(move || cluster.run());
    }

    let db_host = config.get_str("database.local.host").unwrap_or("localhost");
    let db_port = config.get_int("database.local.port").unwrap_or(5984);
    let db_name = config.get_str("database.local.name").unwrap_or("contacts");
    let couch = couchdb::Server::new(db_host, db_port as u16);

    debug!("Initializing database...");
    let contacts = couch.db(db_name);
    database::init_contacts(&contacts);

    let profiles = couch.db("profiles");
    database::init_profiles(&profiles);

    let mut chain = Chain::new(controllers::routes());

    debug!("Initializing database middleware...");
    chain.link_before(middleware::contacts::create(contacts));
    chain.link_before(middleware::profiles::create(profiles));
    debug!("Initializing dxcc middleware...");
    chain.link_before(middleware::dxcc::create());

    let http_addr = &*format!("0.0.0.0:{}", port);
    info!("Starting http server on {}...", http_addr);
    Iron::new(chain).http(http_addr).unwrap();
}
