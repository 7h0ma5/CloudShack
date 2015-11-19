use std::collections::HashMap;
use std::convert::From;
use chrono::datetime::DateTime as ChronoDateTime;
use chrono::UTC;
use rustc_serialize::{json, Encoder, Encodable, Decoder, Decodable};
use Value;

pub type DateTime = ChronoDateTime<UTC>;

#[derive(Debug)]
pub struct Contact {
    pub fields: HashMap<String, Value>
}

impl Contact {
    /// Create an empty Contact.
    pub fn new() -> Contact {
        Contact { fields: HashMap::new() }
    }

    /// Returns a reference to the Value corresponding to the key.
    pub fn get(&self, key: &str) -> Option<&Value> {
        self.fields.get(key)
    }

    /// Set the value for a key.
    pub fn set(&mut self, key: &str, value: Value) {
        self.fields.insert(String::from(key), value);
    }

    fn get_datetime(&self, key: &str) -> Option<DateTime> {
        if let Some(&Value::Text(ref datetime)) = self.fields.get(key) {
            let parsed = ChronoDateTime::parse_from_rfc3339(datetime);
            parsed.map(|res| res.with_timezone(&UTC)).ok()
        }
        else {
            None
        }
    }

    /// Returns the start time of the contact.
    pub fn start(&self) -> Option<DateTime> {
        self.get_datetime("start")
    }

    /// Returns the end time of the contact.
    pub fn end(&self) -> Option<DateTime> {
        self.get_datetime("end")
    }

    /// Convert the contact to a JSON-encoded String.
    pub fn to_json(&self) -> Option<String> {
        json::encode(self).ok()
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
