use std::str::FromStr;
use std::str;
use std::io::Read;
use nom::IResult;
use contact::{Value, Contact};

type ContactList = Vec<Contact>;

named!(contacts <&[u8], ContactList>, chain!(
        opt!(header) ~
        contacts: many1!(contact),
    || { contacts }
));

named!(contact <&[u8], Contact>, chain!(
    fields: many0!(field) ~
    end_of_record,
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

named!(header <&[u8], ()>, chain!(
    many0!(field) ~
    end_of_header,
    || { () }
));

named!(end_of_header <&[u8], ()>, chain!(
    take_until!("<") ~
    alt!(tag!("<eoh>") | tag!("<EOH>")),
    || { () }
));

named!(end_of_record <&[u8], ()>, chain!(
    take_until!("<") ~
    alt!(tag!("<eor>") | tag!("<EOR>")),
    || { () }
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

pub fn parse_bytes(bytes: &[u8]) -> Vec<Contact> {
    let res = contacts(bytes);
    match res {
        IResult::Done(_, data) => data,
        _ => Vec::new()
    }
}

pub fn parse<T: Read>(mut reader: T) -> Vec<Contact> {
    let mut data = String::new();
    if reader.read_to_string(&mut data).is_ok() {
        parse_bytes(data.as_bytes())
    }
    else {
        Vec::new()
    }
}
