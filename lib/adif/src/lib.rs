#![feature(plugin)]
#![plugin(phf_macros)]

#[macro_use]
extern crate nom;
extern crate chrono;
extern crate rustc_serialize;
extern crate phf;

mod contact;
mod field;
pub mod data;
pub mod adi;

pub use contact::Contact;
