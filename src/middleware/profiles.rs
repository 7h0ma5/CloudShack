use persistent::Read;
use iron;
use couchdb;

pub struct Profiles;
impl iron::typemap::Key for Profiles { type Value = couchdb::Database; }

pub fn create(database: couchdb::Database) -> Read<Profiles> {
    Read::<Profiles>::one(database)
}
