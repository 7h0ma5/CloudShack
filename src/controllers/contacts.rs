use iron::prelude::*;
use controllers::RequestHelper;
use router::Router;
use iron::mime::Mime;
use iron::status;
use std::collections::HashMap;
use rustc_serialize::json;

use couchdb;

pub fn couch_response(result: couchdb::Result<json::Json>) -> IronResult<Response> {
    match result {
        Ok(data) => {
            let json_mime = "application/json".parse::<Mime>().unwrap();
            Ok(Response::with((json_mime, status::Ok, data.to_string())))
        },
        Err(couchdb::Error::NotFound) => Ok(Response::with((status::NotFound, "Not Found"))),
        _ => Ok(Response::with((status::InternalServerError, "Internal Server Error")))
    }
}

pub fn all_contacts(req: &mut Request) -> IronResult<Response> {
    req.parse_query();
    let view = req.param("view").unwrap_or("byDate");

    let mut params = HashMap::new();
    params.insert("descending", req.query("descending").unwrap_or("true"));
    params.insert("limit", req.query("limit").unwrap_or("25"));
    params.insert("include_docs", req.query("include_docs").unwrap_or("true"));
    req.merge_query(&mut params);

    couch_response(req.contacts().view("logbook", view, Some(params)))
}

pub fn get_contact(req: &mut Request) -> IronResult<Response> {
    if let Some(id) = req.param("id") {
        couch_response(req.contacts().get(id))
    }
    else {
        Ok(Response::with((status::NotFound, "Not Found")))
    }
}

pub fn delete_contact(req: &mut Request) -> IronResult<Response> {
    req.parse_query();

    let id = req.param("id");
    let rev = req.query("rev");

    if id.is_none() || rev.is_none() {
        return Ok(Response::with((status::NotFound, "NotFound")));
    }

    couch_response(req.contacts().delete(id.unwrap(), rev.unwrap()))
}

pub fn stats(req: &mut Request) -> IronResult<Response> {
    req.parse_query();

    let mut params = HashMap::new();
    params.insert("group_level", req.query("group_level").unwrap_or("3"));
    req.merge_query(&mut params);

    couch_response(req.contacts().view("logbook", "stats", Some(params)))
}

pub fn routes() -> Router {
    let mut router = Router::new();
    router.get("/", all_contacts);
    router.get("/_stats", stats);
    router.get("/_view/:view", all_contacts);
    router.get("/:id", get_contact);
    router.delete("/:id", delete_contact);
    router
}
