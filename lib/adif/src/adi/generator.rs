use std::io;
use std::io::Write;
use contact::{Value, Contact};

pub struct Generator<T> {
    writer: T
}

impl<T: io::Write> Generator<T> {
    pub fn new(mut writer: T) -> Generator<T> {
        writer.write(b"# rust-adif\n");
        writer.write(b"<ADIF_VER:5>3.0.4\n");
        writer.write(b"<EOH>\n\n");
        Generator { writer: writer }
    }

    pub fn write_field(&mut self, key: &str, value: Value) {
        write!(&mut self.writer, "<{}:{}>", key, key.len());
        match value {
            Value::Number(val) => write!(&mut self.writer, "{}", val),
            Value::Boolean(val) => write!(&mut self.writer, "{}", if val { "Y" } else { "N" }),
            Value::Text(ref val) => write!(&mut self.writer, "{}", val),
        };
    }

    pub fn write_contact(&mut self, contact: Contact) {
        for (key, value) in contact.fields {
            self.write_field(&*key, value);
        }
        self.writer.write(b"<EOR>\n");
    }

    pub fn write_contacts(&mut self, contacts: Vec<Contact>) {
        for contact in contacts {
            self.write_contact(contact);
        }
    }
}

#[test]
pub fn test_writer() {
    let mut contact = Contact::new();
    contact.set("call", Value::Text(String::from("DL2IC")));
    contact.set("freq", Value::Number(14.313));
    let mut gen = Generator::new(io::stdout());
    gen.write_contact(contact);
    println!("Hello World");
}
