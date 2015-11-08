use contact::Value;

type Decode = fn(&str) -> Value;
type Encode = fn(Value) -> String;

//static NumberField: (Decode, Encode) = (decode_number, encode_number);

fn decode_number(val: &str) -> Value {
    Value::Number(42.42)
}

fn decode_boolean(val: &str) -> Value {
    Value::Boolean(true)
}

pub fn decode(key: &str, val: &str) {

}

pub fn encode(key: &str, val: &str) -> Value {
    Value::Boolean(true)
}
