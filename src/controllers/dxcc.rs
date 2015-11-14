use iron::prelude::*;
use controllers::helper::RequestHelper;
use router::Router;
use iron::mime::Mime;
use iron::status;

use rustc_serialize::json;

pub fn lookup(req: &mut Request) -> IronResult<Response> {
    let call = req.param("call").unwrap();
    let dxcc = req.dxcc().lookup(call);

    if !dxcc.is_some() { return Ok(Response::with(status::NotFound)); }

    match json::encode(&dxcc.unwrap()) {
        Ok(data) => {
            let json_mime = "application/json".parse::<Mime>().unwrap();
            Ok(Response::with((json_mime, status::Ok, data.to_string())))
        },
        _  => Ok(Response::with(status::InternalServerError))
    }
}

pub fn routes() -> Router {
    let mut router = Router::new();
    router.get("/:call", lookup);
    router
}
