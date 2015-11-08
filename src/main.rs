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
mod controllers;
mod middleware;
mod config;

use iron::prelude::*;
use logger::Logger;
use std::thread;

pub fn main() {
    let config = config::Config::load();

    let port = config.get_int("general.port").unwrap_or(3000);
    let wsjt = config.get_bool("general.wsjt").unwrap_or(false);

    if wsjt {
        println!("Starting wsjt server...");
        let server = wsjt::Server::new();
        thread::spawn(move || server.run());
    }

    let db_host = config.get_str("database.local.host").unwrap_or("localhost");
    let db_port = config.get_int("database.local.port").unwrap_or(5984);
    let db = couchdb::Server::new(db_host, db_port as u16);

    let mut chain = Chain::new(controllers::routes());

    let (logger_before, logger_after) = Logger::new(None);
    chain.link_before(middleware::database::create(db));
    chain.link_before(middleware::dxcc::create());
    chain.link_before(logger_before);
    chain.link_after(logger_after);

    Iron::new(chain).http(&*format!("0.0.0.0:{}", port)).unwrap();
}
