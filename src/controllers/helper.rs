use plugin::Pluggable;
use persistent::Read;
use urlencoded::UrlEncodedQuery;
use iron::Request;
use std::sync::Arc;
use router::Router;

use middleware;
use couchdb;
use dxcc;

pub trait RequestHelper {
    fn db(&self) -> &Arc<couchdb::Server>;
    fn dxcc(&self) -> &Arc<dxcc::Dxcc>;

    fn parse_query(&mut self);
    fn query(&self, parameter: &str) -> Option<&str>;
    fn param(&self, parameter: &str) -> Option<&str>;
}

impl<'a, 'b> RequestHelper for Request<'a, 'b> {
    fn db(&self) -> &Arc<couchdb::Server> {
        self.extensions.get::<Read<middleware::database::CouchDB>>().unwrap()
    }

    fn dxcc(&self) -> &Arc<dxcc::Dxcc> {
        self.extensions.get::<Read<middleware::dxcc::DXCC>>().unwrap()
    }

    fn parse_query(&mut self) {
        let _ = self.get_ref::<UrlEncodedQuery>();
    }

    fn query(&self, parameter: &str) -> Option<&str> {
        match self.extensions.get::<UrlEncodedQuery>() {
            Some(query) => query.get(parameter).map(|vec| &*vec[0]),
            _ => None
        }
    }

    fn param(&self, parameter: &str) -> Option<&str> {
        self.extensions.get::<Router>().unwrap().find(parameter)
    }
}
