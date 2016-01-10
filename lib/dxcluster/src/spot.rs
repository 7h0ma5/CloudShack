#[derive(Debug)]
pub struct Spot {
    call: String,
    spotter: String,
    comment: String,
    time: String,
    freq: f64
}

impl Spot {
    pub fn parse(data: &str) -> Option<Spot> {
        let spotter = regex!(r"(?i)[a-z0-9/]*").captures(&data[6..16]).and_then(|cap| cap.at(0));
        let freq = (&data[16..24]).trim();
        let call = regex!(r"(?i)[a-z0-9/]*").captures(&data[26..38]).and_then(|cap| cap.at(0));
        let comment = (&data[39..69]).trim();
        let time = &data[70..74];

        if let (Some(spotter), Some(call)) = (spotter, call) {
            Some(Spot {
                call: call.to_owned(),
                spotter: spotter.to_owned(),
                freq: freq.parse::<f64>().unwrap()/1000.0,
                comment: comment.to_owned(),
                time: time.to_owned()
            })
        }
        else { None }
    }
}
