extern crate hyper;
extern crate xml;

mod hamqth;

pub struct Entry {
    call: String,
    name: String,
    qth: String
}

pub trait Callbook {
    fn lookup(&mut self, &str) -> Option<Entry>;
}
