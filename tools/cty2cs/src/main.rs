#![feature(custom_derive, plugin)]
#![plugin(serde_macros)]

#[macro_use]
extern crate nom;
extern crate serde;
extern crate serde_json;

use std::str::FromStr;
use std::str;
use std::io::{stdin, stdout, Read, Write};
use std::collections::HashMap;

use nom::{IResult, multispace};

#[derive(Serialize)]
struct DxccData {
    entities: Vec<DxccEntity>,
    prefixes: Vec<Prefix>
}

#[derive(Serialize)]
struct DxccEntity {
    country: String,
    prefix: String,
    dxcc: u32,
    cont: String,
    cqz: u32,
    ituz: u32,
    latlon: (f32, f32),
    tz: f32
}

#[derive(Serialize)]
struct Prefix {
    prefix: String,
    exact: bool,
    dxcc: u32,
    exceptions: Exceptions
}

#[derive(Serialize)]
struct Exceptions {
    #[serde(skip_serializing_if="Option::is_none")]
    cqz: Option<u32>,
    #[serde(skip_serializing_if="Option::is_none")]
    ituz: Option<u32>,
    #[serde(skip_serializing_if="Option::is_none")]
    cont: Option<String>,
    #[serde(skip_serializing_if="Option::is_none")]
    latlon: Option<(f32, f32)>
}

enum Exception {
    Cqz(u32),
    Ituz(u32),
    LatLon((f32, f32)),
    Cont(String)
}

type DxccList = Vec<(DxccEntity, PrefixList)>;
type PrefixList = Vec<Prefix>;

named!(parse_entries <&[u8], DxccList>, many0!(parse_entry));

named!(parse_entry <&[u8], (DxccEntity, PrefixList)>, chain!(
    opt!(tag!("*")) ~ prefix: parse_string ~ tag!(",") ~
    country: parse_string ~ tag!(",") ~
    dxcc: parse_integer ~ tag!(",") ~
    cont: parse_string ~ tag!(",") ~
    cqz: parse_integer ~ tag!(",")  ~
    ituz: parse_integer ~ tag!(",") ~
    lat: parse_double ~ tag!(",") ~
    lon: parse_double ~ tag!(",") ~
    tz: parse_double ~
    prefixes: parse_prefixes ~
    tag!(";") ~
    opt!(multispace)
    , || {
        (DxccEntity {
            country: country, prefix: prefix, dxcc: dxcc, cont: cont,
            cqz: cqz, ituz: ituz, latlon: (lat, -lon), tz: -tz
        }, prefixes)
    }
));

named!(parse_string <&[u8], String>,
    map_res!(
        map_res!(
            alt!(preceded!(tag!("\""), take_until_and_consume!("\"")) | take_until!(",")),
            str::from_utf8
        ),
        FromStr::from_str
    )
);

named!(parse_integer <&[u8], u32>,
    map_res!(map_res!(take_until_either!(b",;/)]>"), str::from_utf8), FromStr::from_str)
);

named!(parse_double <&[u8], f32>,
    map_res!(map_res!(take_until_either!(b",;/)]>"), str::from_utf8), FromStr::from_str)
);

named!(parse_prefixes <&[u8], PrefixList>, many1!(parse_prefix));

named!(parse_prefix <&[u8], Prefix>, chain!(
    alt!(tag!(",") | tag!(" ")) ~
    exact: opt!(tag!("=")) ~
    prefix: map_res!(map_res!(take_until_either!(b" ;([{<"), str::from_utf8), FromStr::from_str) ~
    exceptions: many0!(parse_exception),
    || {
        let mut pfx = Prefix { exact: exact.is_some(), dxcc: 0, prefix: prefix,
                               exceptions: Exceptions { cqz: None, ituz: None, cont: None, latlon: None } };

        for exception in exceptions {
            match exception {
                Exception::Cqz(cqz) => pfx.exceptions.cqz = Some(cqz),
                Exception::Ituz(ituz) => pfx.exceptions.ituz = Some(ituz),
                Exception::LatLon(latlon) => pfx.exceptions.latlon = Some(latlon),
                Exception::Cont(cont) => pfx.exceptions.cont = Some(cont)
            }
        }

        return pfx;
    }
));

named!(parse_exception <&[u8], Exception>, alt!(
    map!(override_cqz, |val| { Exception::Cqz(val) }) |
    map!(override_ituz, |val| { Exception::Ituz(val) }) |
    map!(override_cont, |val| { Exception::Cont(String::from(val)) }) |
    map!(override_latlon, |val| { Exception::LatLon(val) })
));

named!(override_cqz <&[u8], u32>, delimited!(tag!("("), parse_integer, tag!(")")));
named!(override_ituz <&[u8], u32>, delimited!(tag!("["), parse_integer, tag!("]")));
named!(override_cont <&[u8], &str>, delimited!(tag!("{"), take_str!(2), tag!("}")));
named!(override_latlon <&[u8], (f32, f32)>,
    delimited!(tag!("<"), chain!(lat: parse_double ~ tag!("/") ~ lon: parse_double,
    || { (lat, -lon) }), tag!(">"))
);

fn main() {
    let mut input = stdin();
    let mut output = stdout();

    let mut data = String::new();
    input.read_to_string(&mut data).unwrap();
    let result = parse_entries(data.as_bytes());

    let mut dxcc_list: Vec<DxccEntity> = Vec::new();
    let mut prefix_list: Vec<Prefix> = Vec::new();

    if let IResult::Done(_, result) = result {
        for (dxcc, prefixes) in result {
            let dxcc_id = dxcc.dxcc;
            dxcc_list.push(dxcc);

            for mut prefix in prefixes {
                prefix.dxcc = dxcc_id;
                prefix_list.push(prefix);
            }
        }

        let data = DxccData { entities: dxcc_list, prefixes: prefix_list };

        output.write(serde_json::to_string(&data).unwrap().as_bytes()).unwrap();
    }
}
