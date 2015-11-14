use iron::prelude::*;
use iron::status;
use controllers::helper::{RequestHelper, couch_response};
use router::Router;
use std::collections::HashMap;
use rustc_serialize::json;

pub fn all_profiles(req: &mut Request) -> IronResult<Response> {
    req.parse_query();

    let mut params = HashMap::new();
    params.insert("include_docs", req.query("include_docs").unwrap_or("true"));
    req.merge_query(&mut params);

    couch_response(req.profiles().all_docs(Some(params)))
}

pub fn show_profile(req: &mut Request) -> IronResult<Response> {
    if let Some(id) = req.param("id") {
        couch_response(req.profiles().get(id))
    }
    else {
        Ok(Response::with((status::NotFound, "Not Found")))
    }
}

pub fn save_profile(req: &mut Request) -> IronResult<Response> {
    let data = json::Json::from_reader(&mut req.body).ok();

    if let Some(data) = data {
        couch_response(req.profiles().insert(data))
    }
    else {
        Ok(Response::with((status::BadRequest, "Bad Request")))
    }
}

pub fn delete_profile(req: &mut Request) -> IronResult<Response> {
    req.parse_query();

    let id = req.param("id");
    let rev = req.query("rev");

    if id.is_none() || rev.is_none() {
        return Ok(Response::with((status::NotFound, "NotFound")));
    }

    couch_response(req.profiles().delete(id.unwrap(), rev.unwrap()))
}

pub fn routes() -> Router {
    let mut router = Router::new();
    router.get("/", all_profiles);
    router.get("/:id", show_profile);
    router.post("/", save_profile);
    router.delete("/:id", delete_profile);
    router
}
