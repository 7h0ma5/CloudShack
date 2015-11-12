use persistent::Read;
use iron;
use couchdb;

pub struct Contacts;
impl iron::typemap::Key for Contacts { type Value = couchdb::Database; }

pub fn create(database: couchdb::Database) -> Read<Contacts> {
    Read::<Contacts>::one(database)
}
