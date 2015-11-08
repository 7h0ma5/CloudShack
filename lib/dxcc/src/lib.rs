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
    entities: HashMap<u32, DxccEntity>,
    prefixes: HashMap<String, Vec<Prefix>>
}

#[derive(Clone, Debug, RustcEncodable, RustcDecodable)]
pub struct DxccEntity {
    country: String,
    prefix: String,
    dxcc: u32,
    cont: String,
    cqz: u32,
    ituz: u32,
    latlon: (f32, f32),
    tz: f32
}

#[derive(Debug, RustcDecodable)]
struct Prefix {
    prefix: String,
    exact: bool,
    dxcc: u32,
    cqz: Option<u32>,
    ituz: Option<u32>,
    cont: Option<String>,
    latlon: Option<(f32, f32)>
}

impl Dxcc {
    pub fn load() -> Option<Dxcc> {
        let mut file = File::open("dxcc.json").unwrap();

        let mut data = String::new();
        file.read_to_string(&mut data);

        return json::decode(&data).ok();
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

#[test]
fn test_to7ir() {
    let dxcc = Dxcc::load().unwrap();
    let result = dxcc.lookup("TO7IR").unwrap();
    assert_eq!(result.dxcc, 63);
    assert_eq!(result.prefix, "FY");
}

#[test]
fn test_ex8q() {
    let dxcc = Dxcc::load().unwrap();
    let result = dxcc.lookup("EX8Q").unwrap();
    assert_eq!(result.dxcc, 135);
    assert_eq!(result.ituz, 31);
}

#[test]
fn test_9m6_oh2yy() {
    let dxcc = Dxcc::load().unwrap();
    let result = dxcc.lookup("9M6/OH2YY").unwrap();
    assert_eq!(result.dxcc, 247);
}

#[test]
fn test_yg8abc() {
    let dxcc = Dxcc::load().unwrap();
    let result = dxcc.lookup("YG8ABC").unwrap();
    assert_eq!(result.dxcc, 327);
    assert_eq!(result.ituz, 54);
}

#[test]
fn test_3o0abc() {
    let dxcc = Dxcc::load().unwrap();
    let result = dxcc.lookup("3O0ABC").unwrap();
    assert_eq!(result.dxcc, 318);
    assert_eq!(result.cqz, 23);
    assert_eq!(result.ituz, 42);
}
