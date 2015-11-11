use iron::prelude::*;
use controllers::RequestHelper;
use router::Router;
use iron::mime::Mime;
use iron::status;
use std::collections::HashMap;

use couchdb;

pub fn all_contacts(req: &mut Request) -> IronResult<Response> {
    req.parse_query();
    let view = req.param("view").unwrap_or("byDate");

    let mut params = HashMap::new();
    params.insert("descending", req.query("descending").unwrap_or("true"));
    params.insert("limit", req.query("limit").unwrap_or("25"));
    params.insert("include_docs", req.query("include_docs").unwrap_or("true"));
    req.merge_query(&mut params);

    let data = req.db().db("contacts").view("logbook", view, Some(params));

    match data {
        Ok(data) => {
            let json_mime = "application/json".parse::<Mime>().unwrap();
            Ok(Response::with((json_mime, status::Ok, data.to_string())))
        },
        Err(couchdb::Error::NotFound) => Ok(Response::with(status::NotFound)),
        _ => Ok(Response::with(status::InternalServerError))
    }
}

pub fn get_contact(req: &mut Request) -> IronResult<Response> {
    if let Some(id) = req.param("id") {
        if let Ok(data) = req.db().db("contacts").get(id) {
            let json_mime = "application/json".parse::<Mime>().unwrap();
            Ok(Response::with((json_mime, status::Ok, data.to_string())))
        }
        else {
            Ok(Response::with(status::NotFound))
        }
    }
    else {
        Ok(Response::with(status::NotFound))
    }
}

pub fn stats(req: &mut Request) -> IronResult<Response> {
    req.parse_query();

    let mut params = HashMap::new();
    params.insert("group_level", req.query("group_level").unwrap_or("3"));
    req.merge_query(&mut params);

    let data = req.db().db("contacts").view("logbook", "stats", Some(params));

    match data {
        Ok(data) => {
            let json_mime = "application/json".parse::<Mime>().unwrap();
            Ok(Response::with((json_mime, status::Ok, data.to_string())))
        },
        Err(couchdb::Error::NotFound) => Ok(Response::with(status::NotFound)),
        _ => Ok(Response::with(status::InternalServerError))
    }
}

pub fn routes() -> Router {
    let mut router = Router::new();
    router.get("/", all_contacts);
    router.get("/_stats", stats);
    router.get("/_view/:view", all_contacts);
    router.get("/:id", get_contact);
    router
}
