#![feature(plugin)]
#![plugin(phf_macros)]

#[macro_use]
extern crate nom;
extern crate chrono;
extern crate rustc_serialize;
extern crate phf;

#[macro_use]
extern crate log;

mod contact;
mod value;
pub mod data;
pub mod adi;

pub use contact::Contact;
pub use contact::DateTime;
pub use value::Value;
