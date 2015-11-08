use std::str::FromStr;
use std::str;
use nom::{IResult, eof};
use field;
use contact::{Value, Contact};

type ContactList = Vec<Contact>;

named!(contacts <&[u8], ContactList>, chain!(
        contacts: many0!(contact),
    || { contacts }
));

named!(contact <&[u8], Contact>, chain!(
    fields: many0!(field) ~
    alt!(tag!("<eor>") | tag!("<EOR>")),
    || {
        let mut contact = Contact::new();
        for (key, value) in fields {
            let key = key.to_string().to_lowercase();
            if let Some(value) = value {
                contact.set(&*key, Value::Text(value.to_string()));
            }
        }
        contact
    }
));

named!(field <&[u8], (&str, Option<&str>)>, chain!(
    take_until!("<") ~
    name: field_name ~
    size: field_size ~
    opt!(field_type) ~
    tag!(">") ~
    value: map_res!(take!(size), str::from_utf8),
    || { (name, if value.is_empty() { None } else { Some(value) }) }
));

named!(field_name <&[u8], &str>,
    map_res!(preceded!(tag!("<"), take_until_either!(b":>")), str::from_utf8)
);

named!(field_size <&[u8], usize>,
    map_res!(
        map_res!(preceded!(tag!(":"), take_until_either!(b":>")), str::from_utf8),
        FromStr::from_str
    )
);

named!(field_type <&[u8], &str>,
    map_res!(preceded!(tag!(":"), take_until!(">")), str::from_utf8)
);

#[test]
pub fn test_field_2() {
    assert_eq!(field(b"<tEsT:2>AB"), IResult::Done(&b""[..], ("tEsT", Some("AB"))));
}

#[test]
pub fn test_field_3() {
    assert_eq!(field(b"<CALL:7:S>He<ll>o"), IResult::Done(&b""[..], ("CALL", Some("He<ll>o"))));
}

#[test]
pub fn contact_test() {
    println!("contact: {:?}", contacts(b"<CALL:5>DL2IC<MODE:2>CW<BLA:0>AVCSD<EOR>"));
}
