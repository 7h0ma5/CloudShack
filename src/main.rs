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

fn init_contacts_db(db: &couchdb::Database) {
    use rustc_serialize::json::Json;

    db.create().ok();

    let design = include_str!("logbook.json").replace("\n", " ");
    let design_doc = Json::from_str(&design).expect("Invalid internal design document.");

    let active_design_doc = db.get("_design/logbook");

    let db_version = match active_design_doc {
        Ok(Json::Object(ref obj)) => obj.get("version").to_owned(),
        _ => None
    }.and_then(|v| v.as_u64()).unwrap_or(0);

    let version = match design_doc {
        Json::Object(ref obj) => obj.get("version").to_owned(),
        _ => None
    }.and_then(|v| v.as_u64()).expect("Invalid internal design document.");

    if db_version == version {
        println!("Design document is up to date (v{}).", version);
    }
    else if db_version > version {
        println!("Design document is newer than the internal! (v{} > v{})", db_version, version);
        panic!("This version of CloudShack is too old to handle the selected contacts database.");
    }
    else if let Ok(Json::Object(ref old)) = active_design_doc {
        print!("Updating the design document (v{} => v{})... ", db_version, version);

        if let (Json::Object(ref new), Some(&Json::String(ref rev))) = (design_doc, old.get("_rev")) {
            let mut new = new.to_owned();
            new.insert("_rev".to_string(), Json::String(rev.to_owned()));

            let result = db.insert(Json::Object(new));

            if result.is_ok() { println!("Update successful!"); }
            else { println!("Update failed!"); }
        }
        else {
            println!("Update failed! Old design document has no revision.");
        }
    }
    else {
        print!("Creating the design document... ");
        let result = db.insert(design_doc);

        if result.is_ok() { println!("Creation successful!"); }
        else { println!("Creation failed!"); }
    }
}

fn init_profiles_db(db: &couchdb::Database) {
    db.create().is_ok();
}

pub fn main() {
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
    init_contacts_db(&contacts);

    let profiles = couch.db("profiles");
    init_profiles_db(&profiles);

    let mut chain = Chain::new(controllers::routes());

    let (logger_before, logger_after) = Logger::new(None);
    println!("Initializing database middleware...");
    chain.link_before(middleware::contacts::create(contacts));
    chain.link_before(middleware::profiles::create(profiles));
    println!("Initializing dxcc middleware...");
    chain.link_before(middleware::dxcc::create());
    chain.link_before(logger_before);
    chain.link_after(logger_after);

    let http_addr = &*format!("0.0.0.0:{}", port);
    println!("Starting http server on {}...", http_addr);
    Iron::new(chain).http(http_addr).unwrap();
}
