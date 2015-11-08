use database::Database;
use error::{Result, Error};
use hyper::client::Client;
use hyper::method::Method;
use hyper::header::{ContentType, Headers};
use hyper::status::StatusCode;
use hyper::Url;
use rustc_serialize::{Decodable, json};
use rustc_serialize::json::{Json};

pub struct Server {
    url: String,
    client: Client
}

#[derive(RustcDecodable, Debug)]
pub struct ServerInfo {
  couchdb: String,
  uuid: String,
  version: String
}

pub type Path<'a> = Vec<&'a str>;
pub type Params<'a> = Vec<(&'a str, &'a str)>;

impl Server {
    pub fn new(host: &str, port: u16) -> Server {
        Server { url: format!("http://{}:{}", host, port), client: Client::new() }
    }

    pub fn info(&self) -> Result<ServerInfo> {
        let data = try!(self.get(vec!(), None));
        let mut decoder = json::Decoder::new(data);
        Ok(try!(Decodable::decode(&mut decoder)))
    }

    pub fn db<'a>(&'a self, name: &'a str) -> Database<'a> {
        Database::new(self, name)
    }

    pub fn make_url(&self, path: Path) -> Result<Url> {
        let url = format!("{}/{}", self.url, path.join("/"));
        Url::parse(&url).map_err(|_| {
            Error::UrlParserError(url)
        })
    }

    pub fn request(&self, method: Method, path: Path, params: Option<Params>,
                   body: Option<String>) -> Result<Json>
    {
        let mut url = try!(self.make_url(path));

        let mut headers = Headers::new();
        headers.set(ContentType::json());

        if params.is_some() {
            url.set_query_from_pairs(params.unwrap().into_iter());
        }

        let mut res = if body.is_some() {
            let body = body.unwrap();
            try!(self.client.request(method, url).headers(headers).body(&body).send())
        }
        else {
            try!(self.client.request(method, url).headers(headers).send())
        };

        match res.status {
            StatusCode::NotFound => Err(Error::NotFound),
            _ => {
                if !res.status.is_success() {
                    return Err(Error::CouchError)
                }
                else {
                    Ok(try!(Json::from_reader(&mut res)))
                }
            }
        }
    }

    pub fn get(&self, path: Path, params: Option<Params>) -> Result<Json> {
        self.request(Method::Get, path, params, None)
    }

    pub fn post(&self, path: Path, body: Option<String>) -> Result<Json> {
        self.request(Method::Post, path, None, body)
    }

    pub fn put(&self, path: Path) -> Result<Json> {
        self.request(Method::Put, path, None, None)
    }

    pub fn delete(&self, path: Path, params: Option<Params>) -> Result<Json> {
        self.request(Method::Delete, path, params, None)
    }
}
