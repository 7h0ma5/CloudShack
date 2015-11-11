extern crate hyper;
extern crate rustc_serialize;

pub mod server;
pub mod database;
pub mod error;

pub use server::Server;
pub use database::Database;
pub use error::Error;
pub use error::Result;

#[derive(RustcEncodable)]
pub struct TestDoc {
    pub _id: String,
    pub a: String
}

#[test]
fn srv_info() {
    let id = "9188e84301bd11f74b1bb42dd800023d";

    let srv = server::Server::new("localhost", 5984);
    println!("SRV_INFO {:?}", srv.info());
    let db = srv.db("test123");
    println!("DB_CREATE {:?}", db.create());
    println!("DB_INFO {:?}", db.info());
    println!("PUT {:?}", db.insert(TestDoc { _id: String::from(id), a: String::from("Hello World") }));
    let doc = db.get(id).unwrap();
    let rev = doc.find("_rev").unwrap().as_string().unwrap();
    println!("GET {:?}", doc);
    println!("DELETE {:?}", db.delete(id, rev));
    println!("DB_DESTROY {:?}", db.destroy());
}
