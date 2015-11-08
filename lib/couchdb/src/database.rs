use server::{Server, Params};
use error::{Result, Error};
use rustc_serialize::{Encodable, Decodable, json};
use rustc_serialize::json::{Json};

pub struct Database<'a> {
    server: &'a Server,
    name: &'a str
}

#[derive(RustcDecodable, Debug)]
pub struct DatabaseInfo {
    /// Name of the database
    pub db_name: String,
    /// Number of documents in the database
    pub doc_count: usize,
    /// Number of deleted documents in the database
    pub doc_del_count: usize,
    /// Current number of updates to the database
    pub update_seq: usize,
    /// Number of purge operations
    pub purge_seq: usize,
    /// Indicates, if a compaction is running
    pub compact_running: bool,
    /// Current size in Bytes of the database
    pub disk_size: usize,
    /// The time at which the database was opened (in μs)
    pub instance_start_time: String,
    /// Current version of the internal database format on disk
    pub disk_format_version: usize
}

impl<'a> Database<'a> {
    pub fn new(server: &'a Server, name: &'a str) -> Database<'a> {
        Database { server: server, name: name }
    }

    /// Create the database
    pub fn create(&self) -> Result<Json> {
        self.server.put(vec!(self.name))
    }

    /// Destroy the database
    pub fn destroy(&self) -> Result<Json> {
        self.server.delete(vec!(self.name), None)
    }

    /// Get Database
    pub fn info(&self) -> Result<DatabaseInfo> {
        let data = try!(self.server.get(vec!(self.name), None));
        let mut decoder = json::Decoder::new(data);
        Ok(try!(Decodable::decode(&mut decoder)))
    }

    // Insert a document into the database
    pub fn insert<T: Encodable>(&self, doc: T) -> Result<Json> {
        let body = try!(json::encode(&doc));
        self.server.post(vec!(self.name), Some(body))
    }

    pub fn get(&self, id: &str) -> Result<Json> {
        self.server.get(vec!(self.name, id), None)
    }

    pub fn view(&self, designdoc: &str, viewdoc: &str, params: Option<Params>) -> Result<Json> {
        self.server.get(vec!(self.name, "_design", designdoc, "_view", viewdoc), params)
    }

    pub fn delete(&self, id: &str, rev: &str) -> Result<Json> {
        self.server.delete(vec!(self.name, id), Some(vec!(("rev", rev))))
    }
}
