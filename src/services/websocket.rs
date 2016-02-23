use config::Config;
use std::thread;

pub fn run() {
    use websocket::{Server, Message, Sender, Receiver};
    use websocket::message::Type;
    use websocket::header::WebSocketProtocol;

    let server = Server::bind("0.0.0.0:7355").unwrap();

    for connection in server {
        thread::spawn(move || {
            let request = connection.unwrap().read_request().unwrap();
            let headers = request.headers.clone();
            request.validate().unwrap();

            let mut response = request.accept(); // Form a response

            if let Some(&WebSocketProtocol(ref protocols)) = headers.get() {
                if protocols.contains(&("cloudshack".to_string())) {
                    response.headers.set(WebSocketProtocol(vec!["cloudshack".to_string()]));
                }
            }

            let client = response.send().unwrap();

            let (mut sender, mut receiver) = client.split();

            for message in receiver.incoming_messages() {
                let message: Message = message.unwrap();

                match message.opcode {
                    Type::Close => {
                        let message = Message::close();
                        sender.send_message(&message).unwrap();
                        return;
                    },
                    Type::Ping => {
                        let message = Message::pong(message.payload);
                        sender.send_message(&message).unwrap();
                    }
                    _ => sender.send_message(&message).unwrap(),
                }
            }
        });
    }
}

pub fn init(_: &Config) {
    info!("Starting websocket server...");
    thread::spawn(|| run());
}
