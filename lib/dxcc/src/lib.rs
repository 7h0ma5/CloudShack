extern crate hyper;
extern crate flate2;
extern crate rustc_serialize;

use std::fs::File;
use std::io::{Read, copy};
use std::collections::HashMap;
use flate2::read::GzDecoder;
use hyper::client::Client;
use rustc_serialize::json;

#[derive(RustcDecodable)]
pub struct Dxcc {
    entities: HashMap<i32, DxccEntity>,
    prefixes: HashMap<String, Vec<Prefix>>
}

#[derive(Clone, Debug, RustcEncodable, RustcDecodable)]
pub struct DxccEntity {
    pub country: String,
    pub prefix: String,
    pub dxcc: i32,
    pub cont: String,
    pub cqz: i32,
    pub ituz: i32,
    pub latlon: (f32, f32),
    pub tz: f32
}

#[derive(Debug, RustcDecodable)]
struct Prefix {
    prefix: String,
    exact: bool,
    dxcc: i32,
    cqz: Option<i32>,
    ituz: Option<i32>,
    cont: Option<String>,
    latlon: Option<(f32, f32)>
}

impl Dxcc {
    pub fn load() -> Option<Dxcc> {
        let file = File::open("dxcc.json");
        if file.is_err() { return None; }

        let mut data = String::new();
        if file.unwrap().read_to_string(&mut data).is_err() { return None; }

        json::decode(&data).ok()
    }

    pub fn download() {
        let client = Client::new();

        let res = client.get("http://www.cloudshack.org/dxcc.json.gz").send().unwrap();

        let mut decoder = GzDecoder::new(res).unwrap();

        let mut file = File::create("dxcc.json").unwrap();

        copy(&mut decoder, &mut file).unwrap();
    }

    pub fn lookup(&self, call: &str) -> Option<DxccEntity> {
        for i in (1..(call.len()+1)).rev() {
            let prefixes = self.prefixes.get(&call[0 .. i]);
            if prefixes.is_none() { continue }

            for prefix in prefixes.unwrap() {
                if prefix.exact && i < call.len() { continue }
                let entity = self.entities.get(&prefix.dxcc);
                if entity.is_none() { continue }

                let mut entity = entity.unwrap().clone();

                if let Some(cqz) = prefix.cqz { entity.cqz = cqz; }
                if let Some(ituz) = prefix.ituz { entity.ituz = ituz; }
                if let Some(ref cont) = prefix.cont { entity.cont = cont.clone(); }
                if let Some(latlon) = prefix.latlon { entity.latlon = latlon; }

                return Some(entity);
            }
        }
        None
    }
}
