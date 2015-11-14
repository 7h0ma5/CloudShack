mod contacts;
mod profiles;
mod dxcc;
mod flag;
mod helper;

use mount::Mount;
use staticfile::Static;
use std::path::Path;

pub fn routes() -> Mount {
    let mut mount = Mount::new();

    mount.mount("/contacts", contacts::routes());
    mount.mount("/profiles", profiles::routes());
    mount.mount("/dxcc", dxcc::routes());
    mount.mount("/flag", flag::routes());
    mount.mount("/", Static::new(Path::new("webapp/public")));
    mount
}
