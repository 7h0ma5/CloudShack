use std::collections::HashMap;
use std::convert::From;
use chrono::datetime::DateTime as ChronoDateTime;
use chrono::offset::fixed::FixedOffset;
use rustc_serialize::{json, Encoder, Encodable, Decoder, Decodable};

pub type DateTime = ChronoDateTime<FixedOffset>;

#[derive(Debug, RustcDecodable)]
pub enum Value {
    Number(f64),
    Boolean(bool),
    Text(String)
}

#[derive(Debug)]
pub struct Contact {
    pub fields: HashMap<String, Value>
}

impl Contact {
    pub fn new() -> Contact {
        Contact { fields: HashMap::new() }
    }

    pub fn get(&self, key: &str) -> Option<&Value> {
        self.fields.get(key)
    }

    pub fn set(&mut self, key: &str, value: Value) {
        self.fields.insert(String::from(key), value);
    }

    fn get_datetime(&self, key: &str) -> Option<DateTime> {
        match self.fields.get(key) {
            Some(&Value::Text(ref start)) => DateTime::parse_from_rfc3339(start).ok(),
            _ => None
        }
    }

    pub fn start(&self) -> Option<DateTime> {
        self.get_datetime("start")
    }

    pub fn end(&self) -> Option<DateTime> {
        self.get_datetime("end")
    }

    pub fn to_json(&self) -> String {
        json::encode(self).unwrap()
    }
}

impl Encodable for Contact {
    fn encode<S: Encoder>(&self, encoder: &mut S) -> Result<(), S::Error> {
        self.fields.encode(encoder)
    }
}

impl Decodable for Contact {
    fn decode<D: Decoder>(decoder: &mut D) -> Result<Contact, D::Error> {
        HashMap::decode(decoder).map(|fields| Contact { fields: fields })
    }
}

impl Encodable for Value {
    fn encode<S: Encoder>(&self, encoder: &mut S) -> Result<(), S::Error> {
        match *self {
            Value::Number(value) => encoder.emit_f64(value),
            Value::Boolean(value) => encoder.emit_bool(value),
            Value::Text(ref value) => encoder.emit_str(value),
        }
    }
}

impl From<json::Json> for Contact {
    fn from(data: json::Json) -> Contact {
        Contact::new()
    }
}

impl From<String> for Contact {
    fn from(data: String) -> Contact {
        let result = json::Json::from_str(&*data);
        if let Ok(data) = result {
            Contact::from(data)
        }
        else {
            Contact::new()
        }
    }
}

#[cfg(test)]
mod datetime_test {
    use chrono::*;
    use contact::Contact;
    use contact::Value;

    #[test]
    pub fn test_datetime() {
        let mut contact = Contact::new();
        contact.set("start", Value::Text(String::from("2012-12-19T16:39:57.123Z")));
        assert_eq!(contact.start().unwrap(), UTC.ymd(2012, 12, 19).and_hms_milli(16, 39, 57, 123));
    }
}

#[test]
pub fn test_json() {
    let mut contact = Contact::new();
    contact.set("call", Value::Text(String::from("DL2IC")));
    contact.set("qsl_sent", Value::Boolean(true));
    let encoded = contact.to_json();
    println!("{}", encoded);
}
