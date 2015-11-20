use persistent::Read;
use iron;
use dxcc;

pub struct DXCC;
impl iron::typemap::Key for DXCC { type Value = dxcc::Dxcc; }

pub fn create() -> Read<DXCC> {
    Read::<DXCC>::one(dxcc::Dxcc::load().expect("Unable to load dxcc.json"))
}
