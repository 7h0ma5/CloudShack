use rustc_serialize::{Encoder, Encodable};
use phf;

#[derive(Debug, PartialEq, RustcDecodable)]
pub enum Value {
    Float(f64),
    Integer(i32),
    Boolean(bool),
    Text(String)
}

type AdifDecode = fn(&str) -> Option<Value>;
type AdifEncode = fn(&Value) -> Option<String>;

pub struct Field(AdifDecode, AdifEncode);

const INTEGER_FIELD: Field = Field(decode_integer, encode_integer);
const FLOAT_FIELD: Field = Field(decode_float, encode_float);
const BOOLEAN_FIELD: Field = Field(decode_boolean, encode_boolean);
const STRING_FIELD: Field = Field(decode_string, encode_string);
const UPPERCASE_FIELD: Field = Field(decode_uppercase, encode_uppercase);
const LOWERCASE_FIELD: Field = Field(decode_lowercase, encode_lowercase);
const MULTILINE_FIELD: Field = STRING_FIELD;
const DATE_FIELD: Field = STRING_FIELD;

pub static FIELDS: phf::Map<&'static str, Field> = phf_map!{
    "adif_ver" => STRING_FIELD,
    "programid" => STRING_FIELD,
    "programversion" => STRING_FIELD,
    "app_cloudshack_id" => STRING_FIELD,
    "app_cloudshack_rev" => STRING_FIELD,
    "address" => MULTILINE_FIELD,
    "age" => INTEGER_FIELD,
    "a_index" => INTEGER_FIELD,
    "ant_az" => INTEGER_FIELD,
    "ant_el" => INTEGER_FIELD,
    "ant_path" => UPPERCASE_FIELD,
    "arrl_sect" => UPPERCASE_FIELD,
    "band" => LOWERCASE_FIELD,
    "band_rx" => LOWERCASE_FIELD,
    "call" => STRING_FIELD,
    "check" => STRING_FIELD,
    "class" => STRING_FIELD,
    "clublog_qso_upload_date" => DATE_FIELD,
    "clublog_qso_upload_status" => UPPERCASE_FIELD,
    "cnty" => UPPERCASE_FIELD,
    "comment" => STRING_FIELD,
    "cont" => UPPERCASE_FIELD,
    "contacted_op" => STRING_FIELD,
    "contest_id" => UPPERCASE_FIELD,
    "country" => STRING_FIELD,
    "cqz" => INTEGER_FIELD,
    "distance" => INTEGER_FIELD,
    "dxcc" => INTEGER_FIELD,
    "email" => STRING_FIELD,
    "eq_call" => STRING_FIELD,
    "eqsl_qslrdate" => DATE_FIELD,
    "eqsl_qslsdate" => DATE_FIELD,
    "eqsl_qsl_rcvd" => UPPERCASE_FIELD,
    "eqsl_qsl_sent" => UPPERCASE_FIELD,
    "freq" => FLOAT_FIELD,
    "freq_rx" => FLOAT_FIELD,
    "gridsquare" => UPPERCASE_FIELD,
    "guest_op" => STRING_FIELD,
    "iota" => UPPERCASE_FIELD,
    "iota_island_id" => STRING_FIELD,
    "ituz" => INTEGER_FIELD,
    "k_index" => INTEGER_FIELD,
    "lat" => STRING_FIELD,
    "lon" => STRING_FIELD,
    "lotw_qslrdate" => DATE_FIELD,
    "lotw_qslsdate" => DATE_FIELD,
    "lotw_qsl_rcvd" => UPPERCASE_FIELD,
    "lotw_qsl_sent" => UPPERCASE_FIELD,
    "max_bursts" => INTEGER_FIELD,
    "mode" => UPPERCASE_FIELD,
    "my_city" => STRING_FIELD,
    "my_cnty" => STRING_FIELD,
    "my_country" => STRING_FIELD,
    "my_cq_zone" => INTEGER_FIELD,
    "my_dxcc" => INTEGER_FIELD,
    "my_gridsquare" => UPPERCASE_FIELD,
    "my_iota" => UPPERCASE_FIELD,
    "my_iota_island_id" => STRING_FIELD,
    "my_itu_zone" => INTEGER_FIELD,
    "my_lat" => STRING_FIELD,
    "my_lon" => STRING_FIELD,
    "my_name" => STRING_FIELD,
    "my_postal_code" => STRING_FIELD,
    "my_rig" => STRING_FIELD,
    "my_sota_ref" => UPPERCASE_FIELD,
    "my_state" => UPPERCASE_FIELD,
    "my_street" => STRING_FIELD,
    "name" => STRING_FIELD,
    "notes" => MULTILINE_FIELD,
    "nr_bursts" => INTEGER_FIELD,
    "nr_pings" => INTEGER_FIELD,
    "operator" => STRING_FIELD,
    "owner_callsign" => STRING_FIELD,
    "pfx" => STRING_FIELD,
    "precedence" => STRING_FIELD,
    "prop_mode" => UPPERCASE_FIELD,
    "public_key" => STRING_FIELD,
    "qslmsg" => MULTILINE_FIELD,
    "qslrdate" => DATE_FIELD,
    "qslsdate" => DATE_FIELD,
    "qsl_rcvd" => UPPERCASE_FIELD,
    "qsl_rcvd_via" => UPPERCASE_FIELD,
    "qsl_sent" => UPPERCASE_FIELD,
    "qsl_sent_via" => UPPERCASE_FIELD,
    "qso_complete" => UPPERCASE_FIELD,
    "qso_date" => STRING_FIELD,
    "qso_date_off" => STRING_FIELD,
    "qso_random" => BOOLEAN_FIELD,
    "qsl_via" => UPPERCASE_FIELD,
    "qth" => STRING_FIELD,
    "rig" => STRING_FIELD,
    "rst_rcvd" => STRING_FIELD,
    "rst_sent" => STRING_FIELD,
    "rx_pwr" => FLOAT_FIELD,
    "sat_mode" => STRING_FIELD,
    "sat_name" => STRING_FIELD,
    "sfi" => FLOAT_FIELD,
    "srx" => INTEGER_FIELD,
    "srx_string" => STRING_FIELD,
    "state" => UPPERCASE_FIELD,
    "station_callsign" => STRING_FIELD,
    "stx" => INTEGER_FIELD,
    "stx_string" => STRING_FIELD,
    "submode" => UPPERCASE_FIELD,
    "swl" => BOOLEAN_FIELD,
    "time_on" => STRING_FIELD,
    "time_off" => STRING_FIELD,
    "tx_pwr" => INTEGER_FIELD,
    "web" => STRING_FIELD
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
    if value.is_empty() { None } else { Some(Value::Text(value)) }
}

fn decode_uppercase(val: &str) -> Option<Value> {
    let value = String::from(val).trim().to_uppercase();
    if value.is_empty() { None } else { Some(Value::Text(value)) }
}

fn decode_lowercase(val: &str) -> Option<Value> {
    let value = String::from(val).trim().to_lowercase();
    if value.is_empty() { None } else { Some(Value::Text(value)) }
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
        &Value::Float(num) => Some(format!("{}", num)),
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
        if let Some(&Field(decode, _)) = FIELDS.get(key) {
            decode(val)
        }
        else {
            None
        }
    }

    pub fn to_adif(&self, key: &str) -> Option<String> {
        if let Some(&Field(_, encode)) = FIELDS.get(key) {
            encode(self)
        }
        else {
            None
        }
    }

    pub fn text(&self) -> Option<String> {
        match self {
            &Value::Text(ref val) => Some(val.to_owned()),
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
            Value::Text(ref value) => encoder.emit_str(value),
        }
    }
}
