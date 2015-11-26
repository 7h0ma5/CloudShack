use rustc_serialize::json::Json;
use couchdb;

pub fn init_contacts(db: &couchdb::Database) {
    db.create().ok();

    let design = include_str!("logbook.json").replace("\n", " ");
    let design_doc = Json::from_str(&design).expect("Invalid internal design document.");

    let active_design_doc = db.get("_design/logbook");

    let db_version = match active_design_doc {
        Ok(Json::Object(ref obj)) => obj.get("version").to_owned(),
        _ => None
    }.and_then(|v| v.as_u64()).unwrap_or(0);

    let version = match design_doc {
        Json::Object(ref obj) => obj.get("version").to_owned(),
        _ => None
    }.and_then(|v| v.as_u64()).expect("Invalid internal design document.");

    if db_version == version {
        info!("Design document is up to date (v{}).", version);
    }
    else if db_version > version {
        warn!("Design document is newer than the internal! (v{} > v{})", db_version, version);
        warn!("This version of CloudShack is too old to handle the selected contacts database.");
    }
    else if let Ok(Json::Object(ref old)) = active_design_doc {
        info!("Updating the design document (v{} => v{})... ", db_version, version);

        if let (Json::Object(ref new), Some(&Json::String(ref rev))) = (design_doc, old.get("_rev")) {
            let mut new = new.to_owned();
            new.insert("_rev".to_string(), Json::String(rev.to_owned()));

            let result = db.insert(Json::Object(new));

            if result.is_ok() { info!("Update successful!"); }
            else { warn!("Update failed!"); }
        }
        else {
            warn!("Update failed! Old design document has no revision.");
        }
    }
    else {
        info!("Creating the design document... ");
        let result = db.insert(design_doc);

        if result.is_ok() { info!("Creation successful!"); }
        else { warn!("Creation failed!"); }
    }
}

pub fn init_profiles(db: &couchdb::Database) {
    db.create().is_ok();
}
