use nom::{IResult};
use std::str::FromStr;
use std::str;

#[derive(Debug)]
pub enum Packet {
    Decode(String),
    Bla
}

named!(pub parse_packet <&[u8], Packet>, chain!(
    tag!([0xad, 0xbc, 0xcb, 0xda]) ~
    schema: u32!(true) ~
    packet: alt!(
        parse_log
    ), || { packet }
));

named!(parse_log <&[u8], Packet>, chain!(
    tag!([0, 0, 0, 5]) ~
    id: parse_string ~
    date: parse_datetime ~
    call: parse_string ~
    gridsquare: parse_string ~
    freq: u64!(true) ~
    mode: parse_string ~
    rst_sent: parse_string ~
    rst_rcvd: parse_string ~
    tx_pwr: parse_string ~
    comment: parse_string ~
    name: parse_string,
    || { Packet::Decode(call) }
));

named!(parse_string <&[u8], String>, map_res!(map_res!(
    chain!(
        len: u32!(true) ~
        data: take!(len),
        || { data }
    ),
    str::from_utf8), FromStr::from_str)
);

named!(parse_datetime <&[u8], u64>, chain!(
    julianDay: u64!(true) ~
    microSeconds: u32!(true) ~
    take!(1),
    || { (julianDay - 2440588) * 86400000 + microSeconds as u64 }
));
