mod contacts;
mod dxcc;
mod flag;
mod helper;

pub use self::helper::RequestHelper;

use mount::Mount;
use staticfile::Static;
use std::path::Path;
use router::Router;

pub fn routes() -> Mount {
    let mut mount = Mount::new();

    mount.mount("/contacts", contacts::routes());
    mount.mount("/dxcc", dxcc::routes());
    mount.mount("/flag", flag::routes());
    mount.mount("/", Static::new(Path::new("webapp/public")));
    mount
}
