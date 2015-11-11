#![feature(plugin)]
#![plugin(phf_macros)]

#[macro_use]
extern crate nom;
extern crate chrono;
extern crate rustc_serialize;
extern crate phf;

mod contact;
pub mod data;
pub mod adi;

pub use contact::Contact;
pub use contact::Value;
pub use contact::DateTime;
