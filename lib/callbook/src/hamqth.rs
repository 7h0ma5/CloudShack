use xml::reader::{EventReader, XmlEvent};
use hyper::{Client, Url};
use hyper::client::Response;
use std::io::{BufReader, Read};
use ::{Callbook, Entry};

pub struct HamQth {
    username: String,
    password: String,
    session: Option<String>
}

impl HamQth {
    pub fn new(username: &str, password: &str) -> HamQth {
        HamQth {
            username: String::from(username),
            password: String::from(password),
            session: None
        }
    }

    pub fn request(&self, params: Vec<(&str, &str)>) -> Option<Response> {
        let mut client = Client::new();

        let mut url = Url::parse("http://www.hamqth.com/xml.php").unwrap();
        url.set_query_from_pairs(params.into_iter());

        client.get(url).send().ok()
    }

    fn parse_content(&mut self, parser: &mut EventReader<BufReader<Response>>) -> Option<String> {
        let mut content = String::new();
        let mut depth: isize = 0;

        loop {
            let e = parser.next();
            match e {
                Ok(XmlEvent::StartElement { name, .. }) => { depth = depth + 1; },
                Ok(XmlEvent::EndElement { name }) => {
                    let depth = depth - 1;
                    if depth < 0 { break; }
                },
                Ok(XmlEvent::Characters(x)) => {
                    if depth == 0 { content.push_str(&x) }
                },
                Ok(XmlEvent::Whitespace(_)) => {},
                _ => break
            }
        }

        if content.is_empty() { None } else { Some(content) }
    }

    fn process_response(&mut self, response: Response) {
        let buffer = BufReader::new(response);
        let mut parser = EventReader::new(buffer);

        loop {
            let e = parser.next();

            match e {
                Ok(XmlEvent::StartElement { name, .. }) => {
                    match name.borrow().local_name {
                        "error" => {
                            let error = self.parse_content(&mut parser);
                            println!("error: {:?}", error);
                        },
                        "session_id" => {
                            self.session = self.parse_content(&mut parser);
                            println!("session_id: {:?}", self.session);
                        },
                        other => println!("other: {}", other)
                    }
                },
                Ok(XmlEvent::EndDocument) => return,
                Err(e) => return,
                _ => {}
            }
        }
    }

    pub fn login(&mut self) {
        let result = self.request(vec!(("u", &*self.username), ("p", &*self.password)));
        if let Some(result) = result { self.process_response(result); };
    }
}

impl Callbook for HamQth {
    fn lookup(&mut self, call: &str) -> Option<Entry> {
        self.login();
        None
    }
}
