extern crate iron;
extern crate plugin;
extern crate router;
extern crate mount;
extern crate logger;
extern crate staticfile;
extern crate bodyparser;
extern crate urlencoded;
extern crate persistent;

extern crate rustc_serialize;
extern crate toml;
extern crate adif;
extern crate couchdb;
extern crate wsjt;
extern crate dxcc;

//mod ws;
mod database;
mod controllers;
mod middleware;
mod config;

use iron::prelude::*;
use logger::Logger;
use std::thread;

pub fn version() -> String {
    format!("{}.{}.{}{}", env!("CARGO_PKG_VERSION_MAJOR"),
                         env!("CARGO_PKG_VERSION_MINOR"),
                         env!("CARGO_PKG_VERSION_PATCH"),
                         option_env!("CARGO_PKG_VERSION_PRE").unwrap_or(""))
}

pub fn main() {
    println!("CloudShack {}\n", version());

    println!("Loading configuration from config.toml...");
    let config = config::Config::load();

    let port = config.get_int("general.port").unwrap_or(7373);
    let wsjt = config.get_bool("general.wsjt").unwrap_or(false);

    if wsjt {
        println!("Starting wsjt server...");
        let server = wsjt::Server::new();
        thread::spawn(move || server.run());
    }

    let db_host = config.get_str("database.local.host").unwrap_or("localhost");
    let db_port = config.get_int("database.local.port").unwrap_or(5984);
    let db_name = config.get_str("database.local.name").unwrap_or("contacts");
    let couch = couchdb::Server::new(db_host, db_port as u16);

    println!("Initializing database...");
    let contacts = couch.db(db_name);
    database::init_contacts(&contacts);

    let profiles = couch.db("profiles");
    database::init_profiles(&profiles);

    let mut chain = Chain::new(controllers::routes());

    println!("Initializing database middleware...");
    chain.link_before(middleware::contacts::create(contacts));
    chain.link_before(middleware::profiles::create(profiles));
    println!("Initializing dxcc middleware...");
    chain.link_before(middleware::dxcc::create());

    let (logger_before, logger_after) = Logger::new(None);
    chain.link_before(logger_before);
    chain.link_after(logger_after);

    let http_addr = &*format!("0.0.0.0:{}", port);
    println!("Starting http server on {}...", http_addr);
    Iron::new(chain).http(http_addr).unwrap();
}
