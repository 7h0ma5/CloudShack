use std::str::FromStr;
use std::str;

#[derive(Debug)]
pub struct LogEntry {
    id: String,
    date: u64,
    call: String,
    gridsquare: String,
    freq: u64,
    mode: String,
    rst_sent: String,
    rst_rcvd: String,
    tx_pwr: String,
    comment: String,
    name: String
}

#[derive(Debug)]
pub enum Packet {
    Log(LogEntry)
}

named!(pub parse_packet <&[u8], Packet>, chain!(
    tag!([0xad, 0xbc, 0xcb, 0xda]) ~
    u32!(true) ~ // schema
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
    || {
        Packet::Log(LogEntry {
            id: id,
            date: date,
            call: call,
            gridsquare: gridsquare,
            freq: freq,
            mode: mode,
            rst_sent: rst_sent,
            rst_rcvd: rst_rcvd,
            tx_pwr: tx_pwr,
            comment: comment,
            name: name
        })
    }
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
    julian_day: u64!(true) ~
    micro_seconds: u32!(true) ~
    take!(1),
    || { (julian_day - 2440588) * 86400000 + micro_seconds as u64 }
));
