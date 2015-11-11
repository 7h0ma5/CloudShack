use std::io;
use std::io::Write;
use contact::{Value, Contact};

pub struct Generator<T> {
    writer: T
}

impl<T: io::Write> Generator<T> {
    pub fn new(writer: T) -> Generator<T> {
        Generator { writer: writer }
    }

    pub fn write_field(&mut self, key: &str, value: Value) -> io::Result<()> {
        let value = match value {
            Value::Number(val) => format!("{}", val),
            Value::Boolean(val) => format!("{}", if val { "Y" } else { "N" }),
            Value::Text(ref val) => format!("{}", val)
        };

        try!(write!(&mut self.writer, "<{}:{}>{}", key, value.len(), value));
        Ok(())
    }

    pub fn write_contact(&mut self, contact: Contact) -> io::Result<()> {
        for (key, value) in contact.fields {
            try!(self.write_field(&*key, value));
        }
        try!(self.writer.write(b"<EOR>\n"));
        Ok(())
    }

    pub fn write_contacts(&mut self, contacts: Vec<Contact>) -> io::Result<()> {
        for contact in contacts {
            try!(self.write_contact(contact));
        }
        Ok(())
    }
}

pub fn generate<T: io::Write>(contacts: Vec<Contact>, mut writer: T) -> io::Result<()> {
    try!(writer.write(b"# rust-adif\n"));
    try!(writer.write(b"<ADIF_VER:5>3.0.4\n"));
    try!(writer.write(b"<EOH>\n\n"));

    let mut generator = Generator::new(writer);
    generator.write_contacts(contacts)
}
