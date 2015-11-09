use plugin::Pluggable;
use persistent::Read;
use urlencoded::UrlEncodedQuery;
use iron::Request;
use std::collections::HashMap;
use std::sync::Arc;
use router::Router;

use middleware;
use couchdb;
use dxcc;

pub trait RequestHelper {
    fn db(&self) -> &Arc<couchdb::Server>;
    fn dxcc(&self) -> &Arc<dxcc::Dxcc>;

    fn parse_query(&mut self);
    fn merge_query<'c>(&'c self, params: &mut HashMap<&'c str, &'c str>);
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

    fn merge_query<'c>(&'c self, params: &mut HashMap<&'c str, &'c str>) {
        if let Some(map) = self.extensions.get::<UrlEncodedQuery>() {
            for (key, value) in map.iter() {
                let key = &(**key);
                if !params.contains_key(key) {
                   params.insert(key, &*value[0]);
                }
            }
        }
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
