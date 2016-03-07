extern crate iron;
extern crate plugin;
extern crate router;
extern crate mount;
extern crate staticfile;
extern crate bodyparser;
extern crate urlencoded;
extern crate persistent;
extern crate url;
extern crate websocket;
extern crate chrono;
extern crate rustc_serialize;
extern crate toml;
extern crate adif;
extern crate couchdb;
extern crate wsjt;
extern crate dxcc;
extern crate dxcluster;
extern crate rigctl;

#[macro_use]
extern crate log;
extern crate env_logger;

mod services;
mod controllers;
mod middleware;
mod config;

use iron::prelude::*;

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

    let dispatcher = services::dispatcher::init();

    services::websocket::init(&config);
    services::rigctl::init(&config, dispatcher.clone());
    services::wsjt::init(&config);
    services::cluster::init(&config, dispatcher.clone());
    let (contacts, profiles) = services::database::init(&config);

    let mut chain = Chain::new(controllers::routes());

    debug!("Initializing database middleware...");
    chain.link_before(middleware::contacts::create(contacts));
    chain.link_before(middleware::profiles::create(profiles));
    debug!("Initializing dxcc middleware...");
    chain.link_before(middleware::dxcc::create());

    let port = config.get_int("general.port").unwrap_or(7373);

    let http_addr = &*format!("0.0.0.0:{}", port);
    info!("Starting http server on {}...", http_addr);
    Iron::new(chain).listen_with(http_addr, 6, iron::Protocol::Http, None).unwrap();
}
