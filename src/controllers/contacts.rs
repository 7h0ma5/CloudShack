use iron::prelude::*;
use iron::status;
use controllers::helper::{RequestHelper, couch_response};
use router::Router;
use std::collections::HashMap;
use rustc_serialize::json;
use chrono::{DateTime, UTC};
use adif;

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

pub fn show_contact(req: &mut Request) -> IronResult<Response> {
    if let Some(id) = req.param("id") {
        couch_response(req.contacts().get(id))
    }
    else {
        Ok(Response::with((status::NotFound, "Not Found")))
    }
}

pub fn save_contact(req: &mut Request) -> IronResult<Response> {
    let data = json::Json::from_reader(&mut req.body).ok();

    if let Some(data) = data {
        couch_response(req.contacts().insert(data))
    }
    else {
        Ok(Response::with((status::BadRequest, "Bad Request")))
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

pub fn import_adi(req: &mut Request) -> IronResult<Response> {
    req.parse_query();

    let start = req.query("start").and_then(|start| DateTime::parse_from_rfc3339(start).ok())
                                  .map(|res| res.with_timezone(&UTC));
    let end = req.query("end").and_then(|end| DateTime::parse_from_rfc3339(end).ok())
                              .map(|res| res.with_timezone(&UTC));

    let mut contacts = adif::adi::parse(&mut req.body);
    contacts.retain(adif::Contact::is_valid);

    if start.is_some() || end.is_some() {
        contacts.retain(|c| c.in_timespan(start, end));
    }

    for contact in &mut contacts {
        contact.update_band();
        contact.migrate_mode();
    }

    couch_response(req.contacts().bulk(contacts))
}

pub fn routes() -> Router {
    let mut router = Router::new();
    router.get("/", all_contacts);
    router.get("/_stats", stats);
    router.get("/_view/:view", all_contacts);
    router.get("/:id", show_contact);
    router.post("/", save_contact);
    router.post("/_adi", import_adi);
    router.delete("/:id", delete_contact);
    router
}
