use std::str::FromStr;
use std::str;

#[derive(Debug)]
pub struct LogEntry {
    pub id: String,
    pub date: u64,
    pub call: String,
    pub gridsquare: String,
    pub freq: u64,
    pub mode: String,
    pub rst_sent: String,
    pub rst_rcvd: String,
    pub tx_pwr: String,
    pub comment: String,
    pub name: String
}

#[derive(Debug)]
pub struct Heartbeat {
    pub id: String,
    pub max_schema: u32
}

#[derive(Debug)]
pub struct Status {
    pub id: String,
    pub freq: u64,
    pub mode: String,
    pub call: String,
    pub report: String,
    pub tx_mode: String,
    pub tx_enabled: bool,
    pub transmitting: bool,
    pub decoding: bool
}

#[derive(Debug)]
pub enum Packet {
    Heartbeat(Heartbeat),
    Status(Status),
    Log(LogEntry)
}

pub fn parse(data: &[u8]) -> Option<Packet> {
    use nom::IResult;
    match parse_packet(data) {
        IResult::Done(_, packet) => Some(packet),
        _ => None
    }
}

named!(parse_packet <&[u8], Packet>, chain!(
    tag!([0xad, 0xbc, 0xcb, 0xda]) ~
    u32!(true) ~ // schema
    packet: alt!(
        parse_heartbeat |
        parse_status |
        parse_log
    ), || { packet }
));

named!(parse_heartbeat <&[u8], Packet>, chain!(
    tag!([0, 0, 0, 0]) ~
    id: parse_string ~
    max_schema: u32!(true),
    || {
        Packet::Heartbeat(Heartbeat {
            id: id,
            max_schema: max_schema
        })
    }
));

named!(parse_status <&[u8], Packet>, chain!(
    tag!([0, 0, 0, 1]) ~
    id: parse_string ~
    freq: u64!(true) ~
    mode: parse_string ~
    call: parse_string ~
    report: parse_string ~
    tx_mode: parse_string ~
    tx_enabled: parse_boolean ~
    transmitting: parse_boolean ~
    decoding: parse_boolean,
    || {
        Packet::Status(Status {
            id: id,
            freq: freq,
            mode: mode,
            call: call,
            report: report,
            tx_mode: tx_mode,
            tx_enabled: tx_enabled,
            transmitting: transmitting,
            decoding: decoding
        })
    }
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

named!(parse_boolean <&[u8], bool>, alt!(map!(tag!([0]), |_| false) | map!(take!(1), |_| true)));
