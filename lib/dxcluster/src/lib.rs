#![feature(plugin)]
#![plugin(regex_macros)]
extern crate regex;

mod cluster;
mod spot;

pub use cluster::Cluster;
pub use spot::Spot;

#[test]
fn it_works() {
    let cluster = Cluster::new("db0sue.de:8000", Some("DL2IC"));
    cluster.run();
}
