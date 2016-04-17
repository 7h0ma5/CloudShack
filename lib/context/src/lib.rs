#[derive(PartialEq, Debug)]
pub enum RigMode { AM, FM, USB, LSB, CW, UNKNOWN }

impl Default for RigMode {
    fn default() -> RigMode { RigMode::UNKNOWN }
}

#[derive(Default, PartialEq, Debug)]
pub struct Rig {
    pub connected: bool,
    pub freq: u64,
    pub passband: u32,
    pub mode: RigMode
}

#[derive(Default, Debug)]
pub struct Context {
    pub rig: Rig
}
