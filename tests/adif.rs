extern crate adif;
extern crate chrono;

use adif::{data, Contact, Value};
use chrono::{Datelike, Timelike};

#[test]
pub fn test_parser() {
    let test = "testest<eoh>  <CALL:5>DL2IC <MODE:2>CW  <FOO:3>BARBARBAR <EOR>";
    let result = adif::adi::parse(test.as_bytes());
    assert_eq!(result.len(), 1);
    let contact = &result[0];
    assert_eq!(*contact.get("call").unwrap(), Value::String(String::from("DL2IC")));
}

#[test]
pub fn test_generator() {
    let mut contact = Contact::new();
    contact.set("call", Value::String(String::from("DL2IC")));
    contact.set("freq", Value::Float(14.313));

    let mut out = Vec::new();
    adif::adi::generate(vec!(contact), &mut out).unwrap();

    let result = adif::adi::parse(&out[..]);
    assert_eq!(result.len(), 1);
    let contact = &result[0];

    assert_eq!(*contact.get("call").unwrap(), Value::String(String::from("DL2IC")));
    assert_eq!(*contact.get("freq").unwrap(), Value::Float(14.313));
}

#[test]
pub fn test_json() {
    let mut contact = Contact::new();
    contact.set("call", Value::String(String::from("DL2IC")));
    contact.set("band", Value::String(String::from("20M")));
    contact.set("qso_random", Value::Boolean(true));
    contact.set("freq", Value::Float(14.313));
    contact.set("srx", Value::Integer(42));

    let encoded = contact.to_json().unwrap();
    let contact = Contact::from(encoded);

    assert_eq!(*contact.get("call").unwrap(), Value::String(String::from("DL2IC")));
    assert_eq!(*contact.get("band").unwrap(), Value::String(String::from("20m")));
    assert_eq!(*contact.get("qso_random").unwrap(), Value::Boolean(true));
    assert_eq!(*contact.get("freq").unwrap(), Value::Float(14.313));
    assert_eq!(*contact.get("srx").unwrap(), Value::Integer(42));
}

#[test]
pub fn test_datetime() {
    let mut contact = Contact::new();
    contact.set("start", Value::String(String::from("2012-12-21T16:39:57.123Z")));
    let start = contact.start().unwrap();
    assert_eq!((start.year(), start.month(), start.day()), (2012, 12, 21));
    assert_eq!((start.hour(), start.minute(), start.second()), (16, 39, 57));
}

#[test]
pub fn test_datetime_offset() {
    let mut contact = Contact::new();
    contact.set("end", Value::String(String::from("2012-12-21T16:39:57.123-08:00")));
    let start = contact.end().unwrap();
    assert_eq!((start.year(), start.month(), start.day()), (2012, 12, 22));
    assert_eq!((start.hour(), start.minute(), start.second()), (0, 39, 57));
}

#[test]
pub fn test_bands() {
    let seventy_cm = data::find_band(433.500).unwrap().start;
    assert_eq!(data::BANDS.get("70cm").unwrap().name, "70cm");
    assert_eq!(data::BANDS.get("70cm").unwrap().start, seventy_cm);
    assert!(data::find_band(120.500).is_none());
}

#[test]
pub fn test_legacy_modes() {
    assert_eq!(data::find_legacy_mode("JT65C").unwrap().mode, "JT65");
    assert_eq!(data::find_legacy_mode("PSK31").unwrap().mode, "PSK");
    assert!(data::find_legacy_mode("CW").is_none());
}

#[test]
pub fn test_adif_datetime() {
    let mut contact = Contact::new();
    contact.set("qso_date",  Value::String(String::from("20121221")));
    contact.set("time_on",  Value::String(String::from("192305")));
    contact.set("qso_date_off",  Value::String(String::from("20121222")));
    contact.set("time_off",  Value::String(String::from("0059")));
    contact.parse_datetime();

    let start = contact.start().unwrap();
    assert_eq!((start.year(), start.month(), start.day()), (2012, 12, 21));
    assert_eq!((start.hour(), start.minute(), start.second()), (19, 23, 05));

    let end = contact.end().unwrap();
    assert_eq!((end.year(), end.month(), end.day()), (2012, 12, 22));
    assert_eq!((end.hour(),end.minute(), end.second()), (0, 59, 0));
}

#[test]
pub fn test_migrate_mode() {
    let mut contact = Contact::new();
    contact.set("mode", Value::String(String::from("PSK31")));
    assert_eq!(contact.get("mode").unwrap().text().unwrap(), "PSK31");
    let changed = contact.migrate_mode();
    assert!(changed);
    assert_eq!(contact.get("mode").unwrap().text().unwrap(), "PSK");
    assert_eq!(contact.get("submode").unwrap().text().unwrap(), "PSK31");
}

#[test]
pub fn test_update_band() {
    let mut contact = Contact::new();
    contact.set("freq", Value::Float(7.123));
    contact.set("band", Value::String(String::from("30m")));
    let changed = contact.update_band();
    assert!(changed);
    assert_eq!(contact.get("band").unwrap().text().unwrap(), "40m");
}

#[test]
pub fn test_flags() {
    assert_eq!(data::get_flag(50).unwrap(), "MX");
    assert_eq!(data::get_flag(420).unwrap(), "GA");
    assert_eq!(data::get_flag(521).unwrap(), "SS");
    assert!(data::get_flag(2).is_none());
    assert!(data::get_flag(234235).is_none());
}
