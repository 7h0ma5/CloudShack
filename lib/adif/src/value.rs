use rustc_serialize::{Encoder, Encodable, json};
use phf;

#[derive(Debug, PartialEq, RustcDecodable)]
pub enum Value {
    Float(f64),
    Integer(i32),
    Boolean(bool),
    String(String)
}

enum AdifField {
    Integer,
    Float,
    Boolean,
    String,
    Uppercase,
    Lowercase,
    Multiline,
    Date
}

impl AdifField {
    fn encode(&self, value: &Value) -> Option<String> {
        match *self {
            AdifField::Integer => encode_integer(value),
            AdifField::Float => encode_float(value),
            AdifField::Boolean => encode_boolean(value),
            AdifField::String => encode_string(value),
            AdifField::Uppercase => encode_uppercase(value),
            AdifField::Lowercase => encode_lowercase(value),
            AdifField::Multiline => encode_string(value),
            AdifField::Date => encode_string(value)
        }
    }

    fn decode(&self, value: &str) -> Option<Value> {
        match *self {
            AdifField::Integer => decode_integer(value),
            AdifField::Float => decode_float(value),
            AdifField::Boolean => decode_boolean(value),
            AdifField::String => decode_string(value),
            AdifField::Uppercase => decode_uppercase(value),
            AdifField::Lowercase => decode_lowercase(value),
            AdifField::Multiline => decode_string(value),
            AdifField::Date => decode_string(value)
        }
    }

    fn decode_json(&self, value: &json::Json) -> Option<Value> {
        match *self {
            AdifField::Integer => value.as_i64().map(|val| Value::Integer(val as i32)),
            AdifField::Float => value.as_f64().map(|val| Value::Float(val)),
            AdifField::Boolean => value.as_boolean().map(|val| Value::Boolean(val)),
            AdifField::String => value.as_string().and_then(|val| decode_string(val)),
            AdifField::Uppercase => value.as_string().and_then(|val| decode_uppercase(val)),
            AdifField::Lowercase => value.as_string().and_then(|val| decode_lowercase(val)),
            AdifField::Multiline => value.as_string().and_then(|val| decode_string(val)),
            AdifField::Date => value.as_string().and_then(|val| decode_string(val)),
        }
    }
}

static FIELDS: phf::Map<&'static str, AdifField> = phf_map!{
    "adif_ver" => AdifField::String,
    "programid" => AdifField::String,
    "programversion" => AdifField::String,
    "app_cloudshack_id" => AdifField::String,
    "app_cloudshack_rev" => AdifField::String,
    "address" => AdifField::Multiline,
    "age" => AdifField::Integer,
    "a_index" => AdifField::Integer,
    "ant_az" => AdifField::Integer,
    "ant_el" => AdifField::Integer,
    "ant_path" => AdifField::Uppercase,
    "arrl_sect" => AdifField::Uppercase,
    "band" => AdifField::Lowercase,
    "band_rx" => AdifField::Lowercase,
    "call" => AdifField::String,
    "check" => AdifField::String,
    "class" => AdifField::String,
    "clublog_qso_upload_date" => AdifField::Date,
    "clublog_qso_upload_status" => AdifField::Uppercase,
    "cnty" => AdifField::Uppercase,
    "comment" => AdifField::String,
    "cont" => AdifField::Uppercase,
    "contacted_op" => AdifField::String,
    "contest_id" => AdifField::Uppercase,
    "country" => AdifField::String,
    "cqz" => AdifField::Integer,
    "distance" => AdifField::Integer,
    "dxcc" => AdifField::Integer,
    "email" => AdifField::String,
    "eq_call" => AdifField::String,
    "eqsl_qslrdate" => AdifField::Date,
    "eqsl_qslsdate" => AdifField::Date,
    "eqsl_qsl_rcvd" => AdifField::Uppercase,
    "eqsl_qsl_sent" => AdifField::Uppercase,
    "freq" => AdifField::Float,
    "freq_rx" => AdifField::Float,
    "gridsquare" => AdifField::Uppercase,
    "guest_op" => AdifField::String,
    "iota" => AdifField::Uppercase,
    "iota_island_id" => AdifField::String,
    "ituz" => AdifField::Integer,
    "k_index" => AdifField::Integer,
    "lat" => AdifField::String,
    "lon" => AdifField::String,
    "lotw_qslrdate" => AdifField::Date,
    "lotw_qslsdate" => AdifField::Date,
    "lotw_qsl_rcvd" => AdifField::Uppercase,
    "lotw_qsl_sent" => AdifField::Uppercase,
    "max_bursts" => AdifField::Integer,
    "mode" => AdifField::Uppercase,
    "my_city" => AdifField::String,
    "my_cnty" => AdifField::String,
    "my_country" => AdifField::String,
    "my_cq_zone" => AdifField::Integer,
    "my_dxcc" => AdifField::Integer,
    "my_gridsquare" => AdifField::Uppercase,
    "my_iota" => AdifField::Uppercase,
    "my_iota_island_id" => AdifField::String,
    "my_itu_zone" => AdifField::Integer,
    "my_lat" => AdifField::String,
    "my_lon" => AdifField::String,
    "my_name" => AdifField::String,
    "my_postal_code" => AdifField::String,
    "my_rig" => AdifField::String,
    "my_sota_ref" => AdifField::Uppercase,
    "my_state" => AdifField::Uppercase,
    "my_street" => AdifField::String,
    "name" => AdifField::String,
    "notes" => AdifField::Multiline,
    "nr_bursts" => AdifField::Integer,
    "nr_pings" => AdifField::Integer,
    "operator" => AdifField::String,
    "owner_callsign" => AdifField::String,
    "pfx" => AdifField::String,
    "precedence" => AdifField::String,
    "prop_mode" => AdifField::Uppercase,
    "public_key" => AdifField::String,
    "qslmsg" => AdifField::Multiline,
    "qslrdate" => AdifField::Date,
    "qslsdate" => AdifField::Date,
    "qsl_rcvd" => AdifField::Uppercase,
    "qsl_rcvd_via" => AdifField::Uppercase,
    "qsl_sent" => AdifField::Uppercase,
    "qsl_sent_via" => AdifField::Uppercase,
    "qso_complete" => AdifField::Uppercase,
    "qso_date" => AdifField::String,
    "qso_date_off" => AdifField::String,
    "qso_random" => AdifField::Boolean,
    "qsl_via" => AdifField::Uppercase,
    "qth" => AdifField::String,
    "rig" => AdifField::String,
    "rst_rcvd" => AdifField::String,
    "rst_sent" => AdifField::String,
    "rx_pwr" => AdifField::Float,
    "sat_mode" => AdifField::String,
    "sat_name" => AdifField::String,
    "sfi" => AdifField::Float,
    "srx" => AdifField::Integer,
    "srx_string" => AdifField::String,
    "state" => AdifField::Uppercase,
    "station_callsign" => AdifField::String,
    "stx" => AdifField::Integer,
    "stx_string" => AdifField::String,
    "submode" => AdifField::Uppercase,
    "swl" => AdifField::Boolean,
    "time_on" => AdifField::String,
    "time_off" => AdifField::String,
    "tx_pwr" => AdifField::Integer,
    "web" => AdifField::String
};

fn decode_integer(val: &str) -> Option<Value> {
    val.parse::<i32>().ok().map(|val| Value::Integer(val))
}

fn decode_float(val: &str) -> Option<Value> {
    val.parse::<f64>().ok().map(|val| Value::Float(val))
}

fn decode_boolean(val: &str) -> Option<Value> {
    match val {
        "Y" | "y" => Some(Value::Boolean(true)),
        "N" | "n" => Some(Value::Boolean(false)),
        _ => None
    }
}

fn decode_string(val: &str) -> Option<Value> {
    let value = String::from(val.trim());
    if value.is_empty() { None } else { Some(Value::String(value)) }
}

fn decode_uppercase(val: &str) -> Option<Value> {
    let value = String::from(val).trim().to_uppercase();
    if value.is_empty() { None } else { Some(Value::String(value)) }
}

fn decode_lowercase(val: &str) -> Option<Value> {
    let value = String::from(val).trim().to_lowercase();
    if value.is_empty() { None } else { Some(Value::String(value)) }
}

fn encode_integer(value: &Value) -> Option<String> {
    match value {
        &Value::Integer(num) => Some(format!("{}", num)),
        &Value::Float(num) => Some(format!("{}", num as i32)),
        _ => None
    }
}

fn encode_float(value: &Value) -> Option<String> {
    match value {
        &Value::Float(num) => Some(format!("{:.6}", num)),
        &Value::Integer(num) => Some(format!("{}", num)),
        _ => None
    }
}

fn encode_boolean(value: &Value) -> Option<String> {
    match value {
        &Value::Boolean(true) => Some(String::from("Y")),
        &Value::Boolean(false) => Some(String::from("N")),
        _ => None
    }
}

fn encode_string(value: &Value) -> Option<String> {
    value.text()
}

fn encode_uppercase(value: &Value) -> Option<String> {
    value.text().map(|s| s.to_uppercase())
}

fn encode_lowercase(value: &Value) -> Option<String> {
    value.text().map(|s| s.to_lowercase())
}

impl Value {
    pub fn from_adif(key: &str, val: &str) -> Option<Value> {
        FIELDS.get(key).and_then(|field| field.decode(val))
    }

    pub fn to_adif(&self, key: &str) -> Option<String> {
        FIELDS.get(key).and_then(|field| field.encode(self))
    }

    pub fn from_json(key: &str, val: &json::Json) -> Option<Value> {
        FIELDS.get(key).and_then(|field| field.decode_json(val))
    }

    pub fn text(&self) -> Option<String> {
        match self {
            &Value::String(ref val) => Some(val.to_owned()),
            _ => None
        }
    }

    pub fn integer(&self) -> Option<i32> {
        match self {
            &Value::Integer(val) => Some(val),
            _ => None
        }
    }

    pub fn float(&self) -> Option<f64> {
        match self {
            &Value::Float(val) => Some(val),
            _ => None
        }
    }

    pub fn boolean(&self) -> Option<bool> {
        match self {
            &Value::Boolean(val) => Some(val),
            _ => None
        }
    }
}

impl Encodable for Value {
    fn encode<S: Encoder>(&self, encoder: &mut S) -> Result<(), S::Error> {
        match *self {
            Value::Float(value) => encoder.emit_f64(value),
            Value::Integer(value) => encoder.emit_i32(value),
            Value::Boolean(value) => encoder.emit_bool(value),
            Value::String(ref value) => encoder.emit_str(value),
        }
    }
}
