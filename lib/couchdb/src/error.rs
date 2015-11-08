use std::convert::From;
use std::fmt;
use hyper;
use rustc_serialize::json;
use std::error::Error as StdError;

#[derive(Debug)]
pub enum Error {
    NotFound,
    CouchError,
    HttpError(hyper::error::Error),
    UrlParserError(String),
    JsonParserError(json::ParserError),
    JsonDecoderError(json::DecoderError),
    JsonEncoderError(json::EncoderError)
}

impl StdError for Error {
    fn description(&self) -> &str {
        match *self {
            Error::NotFound => "NotFound",
            Error::CouchError => "Couch error",
            Error::HttpError(_) => "HTTP error",
            Error::UrlParserError(_) => "URL parser error",
            Error::JsonParserError(_) => "JSON parser error",
            Error::JsonDecoderError(_) => "JSON decoder error",
            Error::JsonEncoderError(_) => "JSON encoder error"
        }
    }

    fn cause(&self) -> Option<&StdError> {
        match *self {
            Error::HttpError(ref err) => Some(err as &StdError),
            Error::JsonParserError(ref err) => Some(err as &StdError),
            Error::JsonDecoderError(ref err) => Some(err as &StdError),
            Error::JsonEncoderError(ref err) => Some(err as &StdError),
            _ => None
        }
    }
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        f.write_str(self.description())
    }
}

impl From<hyper::error::Error> for Error {
    fn from(err: hyper::error::Error) -> Error {
        Error::HttpError(err)
    }
}

impl From<json::ParserError> for Error {
    fn from(err: json::ParserError) -> Error {
        Error::JsonParserError(err)
    }
}

impl From<json::DecoderError> for Error {
    fn from(err: json::DecoderError) -> Error {
        Error::JsonDecoderError(err)
    }
}

impl From<json::EncoderError> for Error {
    fn from(err: json::EncoderError) -> Error {
        Error::JsonEncoderError(err)
    }
}

pub type Result<T> = ::std::result::Result<T, Error>;
