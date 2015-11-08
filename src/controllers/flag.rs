use iron::prelude::*;
use iron::status;
use controllers::RequestHelper;
use router::Router;
use std::path::PathBuf;
use iron::headers::{CacheControl,CacheDirective};

use adif;

pub fn get_flag(req: &mut Request) -> IronResult<Response> {
    let res = req.param("res").unwrap_or("32");
    let flag = req.param("id")
        .and_then(|id| id.parse::<usize>().ok())
        .and_then(|id| adif::data::get_flag(id))
        .unwrap_or("unknown");

    let mut pathbuf = PathBuf::new();
    pathbuf.push("webapp/public/images/flags/");
    pathbuf.push(res);
    pathbuf.push(format!("{}.png", flag));

    let path = pathbuf.as_path();

    if path.exists() {
        let mut res = Response::with((status::Ok, path));
        let cache = vec![CacheDirective::Public, CacheDirective::MaxAge(86400000)];
        res.headers.set(CacheControl(cache));
        Ok(res)
    }
    else {
        Ok(Response::with(status::NotFound))
    }
}

pub fn routes() -> Router {
    let mut router = Router::new();
    router.get("/:res/:id", get_flag);
    router.get("/:id", get_flag);
    router
}
