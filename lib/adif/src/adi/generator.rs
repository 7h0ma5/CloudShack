use std::io;
use std::io::Write;
use {Value, Contact};

pub struct Generator<T> {
    writer: T
}

impl<T: io::Write> Generator<T> {
    pub fn new(writer: T) -> Generator<T> {
        Generator { writer: writer }
    }

    pub fn write_field(&mut self, key: &str, value: &Value) -> io::Result<()> {
        if let Some(value) = value.to_adif(key) {
            try!(write!(&mut self.writer, "<{}:{}>{} ", key, value.len(), value));
        }
        else {
            warn!("Couldn't write adif key '{}' with value '{:?}'.", key, value);
        }
        Ok(())
    }

    pub fn write_contact(&mut self, contact: &Contact) -> io::Result<()> {
        for (key, value) in &contact.fields {
            if key == "start" {
                if let Some(start) = contact.start() {
                    let qso_date = Value::String(start.format("%Y%m%d").to_string());
                    let time_on = Value::String(start.format("%H%M%S").to_string());
                    try!(self.write_field("qso_date", &qso_date));
                    try!(self.write_field("time_on", &time_on));
                }
            }
            else if key == "end" {
                if let Some(end) = contact.end() {
                    let qso_date_off = Value::String(end.format("%Y%m%d").to_string());
                    let time_off = Value::String(end.format("%H%M%S").to_string());
                    try!(self.write_field("qso_date_off", &qso_date_off));
                    try!(self.write_field("time_off", &time_off));
                }
            }
            else {
                try!(self.write_field(&*key, value));
            }
        }
        try!(self.writer.write(b"<EOR>\n\n"));
        Ok(())
    }

    pub fn write_contacts(&mut self, contacts: &Vec<Contact>) -> io::Result<()> {
        for contact in contacts {
            try!(self.write_contact(contact));
        }
        Ok(())
    }
}

pub fn generate<T: io::Write>(contacts: &Vec<Contact>, mut writer: T) -> io::Result<()> {
    try!(writer.write(b"# rust-adif\n"));
    try!(writer.write(b"<ADIF_VER:5>3.0.4\n"));
    try!(writer.write(b"<EOH>\n\n"));

    let mut generator = Generator::new(writer);
    generator.write_contacts(contacts)
}
