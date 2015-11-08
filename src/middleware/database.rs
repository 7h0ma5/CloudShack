use persistent::Read;
use iron;
use couchdb;

pub struct CouchDB;
impl iron::typemap::Key for CouchDB { type Value = couchdb::Server; }

pub fn create(server: couchdb::Server) -> Read<CouchDB> {
    Read::<CouchDB>::one(server)
}
