use std::collections::HashMap;
use std::convert::From;
use chrono::datetime::DateTime as ChronoDateTime;
use chrono::{TimeZone, Date, UTC, NaiveTime};
use rustc_serialize::{json, Encoder, Encodable, Decoder, Decodable};
use Value;
use data;

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

    /// Remove a field from the contact.
    pub fn remove(&mut self, key: &str) -> Option<Value> {
        self.fields.remove(key)
    }

    pub fn is_valid(&self) -> bool {
        self.fields.contains_key("call") && self.fields.contains_key("start")
    }

    /// Update the band field to match the frequency field.
    /// Returns true if the band field was changed.
    pub fn update_band(&mut self) -> bool {
        let band = self.get("band").and_then(|v| v.text());
        let freq = self.get("freq").and_then(|v| v.float());

        if freq.is_none() { return false; }

        let new_band = data::find_band(freq.unwrap());
        if new_band.is_none() { return false; }
        let new_band = new_band.unwrap();

        if band.is_some() && band.unwrap() == new_band.name {
            return false;
        }
        else {
            self.set("band", Value::String(new_band.name.to_string()));
            return true;
        }
    }

    /// Update the mode and submode fields to the new standard if the current mode is a legacy mode.
    /// Returns true if the mode fields were changed.
    pub fn migrate_mode(&mut self) -> bool {
        let mode = self.get("mode").and_then(|v| v.text());

        if mode.is_none() || self.get("submode").is_some() {
            return false;
        }

        let legacy_mode = data::find_legacy_mode(&*mode.unwrap());

        if let Some(legacy_mode) = legacy_mode {
            self.set("mode", Value::String(legacy_mode.mode.to_string()));
            self.set("submode", Value::String(legacy_mode.submode.to_string()));
            return true;
        }
        else {
            return false;
        }
    }

    /// Convert ADIF dates and times to RFC3339 encoded times with the keys *start* and *end*.
    /// Removes the old fields *qso_date*, *time_on*, *qso_date_off* and *time_off*.
    pub fn parse_datetime(&mut self) {
        let date_on = self.remove("qso_date");
        let time_on = self.remove("time_on");
        let date_off = self.remove("qso_date_off");
        let time_off = self.remove("time_off");

        let start = date_on.and_then(|val| val.text())
                           .and_then(|text| self.parse_date(&*text));

        if start.is_none() { return };
        let start = start.unwrap();

        let start = time_on.and_then(|val| val.text())
                           .and_then(|text| start.and_time(self.parse_time(&*text)))
                           .unwrap_or_else(|| start.and_hms(0, 0, 0));

        let end = date_off.and_then(|val| val.text())
                          .and_then(|text| self.parse_date(&*text))
                          .unwrap_or(start.date());

        let end = time_off.and_then(|val| val.text())
                          .and_then(|text| end.and_time(self.parse_time(&*text)))
                          .or_else(|| end.and_time(start.time()))
                          .unwrap_or(start);

        // TODO: fix this workaround for correct JavaScript date formats
        self.set("start", Value::String(format!("{:?}", start)));
        self.set("end", Value::String(format!("{:?}", end)));
    }

    fn parse_date(&self, value: &str) -> Option<Date<UTC>> {
        if value.len() != 8 { return None; };
        let year = value[0..4].parse::<i32>();
        let month = value[4..6].parse::<u32>();
        let day = value[6..8].parse::<u32>();

        if let (Ok(year), Ok(month), Ok(day)) = (year, month, day) {
            Some(UTC.ymd(year, month, day))
        }
        else { None }
    }

    fn parse_time(&self, value: &str) -> NaiveTime {
        if value.len() < 4 { return NaiveTime::from_hms(0, 0, 0); }
        let hour = value[0..2].parse::<u32>();
        let minute = value[2..4].parse::<u32>();
        let second = if value.len() >= 5 { value[4..6].parse::<u32>() } else { Ok(0) };

        if let (Ok(hour), Ok(minute), Ok(second)) = (hour, minute, second) {
            NaiveTime::from_hms(hour, minute, second)
        }
        else {
            NaiveTime::from_hms(0, 0, 0)
        }
    }

    fn get_datetime(&self, key: &str) -> Option<DateTime> {
        if let Some(&Value::String(ref datetime)) = self.fields.get(key) {
            let parsed = ChronoDateTime::parse_from_rfc3339(datetime);
            parsed.map(|res| res.with_timezone(&UTC)).ok()
        }
        else { None }
    }

    /// Returns the start time of the contact.
    pub fn start(&self) -> Option<DateTime> {
        self.get_datetime("start")
    }

    /// Returns the end time of the contact.
    pub fn end(&self) -> Option<DateTime> {
        self.get_datetime("end")
    }

    /// Returns true if the contact starts in the given timespan.
    pub fn in_timespan(&self, start: Option<DateTime>, end: Option<DateTime>) -> bool {
        if let Some(cstart) = self.start() {
            match (start, end) {
                (Some(start), Some(end)) => cstart >= start && cstart <= end,
                (Some(start), None) => cstart >= start,
                (None, Some(end)) => cstart <= end,
                (None, None) => true
            }
        }
        else { false }
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
