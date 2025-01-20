#[macro_use]
extern crate lazy_static;

use std::ffi::{CString, c_char};

use flate2::read::GzDecoder;
use jsonschema::{Draft, JSONSchema};
use serde_json;
use serde_json::json;
use std::io::prelude::*;
use std::fmt;

lazy_static! {
    static ref SCHEMA: JSONSchema = {
        let schema = include_str!("includes/sarif-schema-2.1.0.json");

        let mut schema: serde_json::Value = serde_json::from_str(schema).expect("failed to parse embedded schema");

        // override: do not allow empty an ruleId
        schema["definitions"]["result"]["properties"]["ruleId"]["minLength"] = json!(1);

        JSONSchema::options()
            .with_draft(Draft::Draft7)
            .compile(&schema)
            .expect("failed to compile embedded schema")
    };
}

fn format_error(err: jsonschema::ValidationError) -> String {
    let path = err.instance_path.to_string();

    if path.is_empty() {
        err.to_string()
    } else {
        format!("{}: {}", path, err.to_string())
    }
}

fn get_data(document: &serde_json::Value) -> Vec<serde_json::Value> {
    let mut vec: Vec<serde_json::Value> = vec![];

    if let Some(runs) = document["runs"].as_array() {
        vec.reserve(runs.len());

        for run in runs {
            let tool = json!({
                "name": run["tool"]["driver"]["name"].as_str(),
                "version": run["tool"]["driver"]["version"].as_str(),
                "semantic_version": run["tool"]["driver"]["semanticVersion"].as_str(),
                "guid": run["tool"]["driver"]["guid"].as_str(),
                "automation_id": run["tool"]["automationDetails"]["id"].as_str(),
            });

            vec.push(tool);
        }
    }

    return vec;
}

fn get_message(errors: jsonschema::ErrorIterator) -> String {
    let iter = errors.enumerate();
    let mut out = String::with_capacity(560);
    let mut rest = 0;

    for (i, err) in iter {
        if out.len() > 512 {
            rest += 1;
            continue;
        }

        if i > 0 {
            out.push_str(", ");
        }

        out.push_str(&format_error(err));
    }

    if rest > 1 {
        out.push_str(&format!(" and {} other errors", rest));
    } else if rest > 0 {
        out.push_str(" and 1 other error");
    }

    out
}

#[derive(Debug, Clone)]
struct SarifError {
    klass: String,
    description: String,
}

impl fmt::Display for SarifError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f,"{}", self.klass)
    }
}

impl SarifError {
    fn new(klass: &str, description: String) -> SarifError {
        return SarifError{
            klass: klass.to_string(),
            description: description,
        }
    }
}

fn parse(gz: &[u8], validate: bool, limit: u64) -> Result<Vec<serde_json::Value>, SarifError> {
    let mut gzbuf = GzDecoder::new(&*gz);

    let mut peek: [u8; 1] = [0];

    match gzbuf.read(&mut peek) {
        Ok(0) => return Err(SarifError::new("EmptyError", "zip file was empty".to_string())),
        Err(e) => return Err(SarifError::new("ReadError", e.to_string())),
        Ok(_) => (),
    }

    let mut reader = peek.chain(gzbuf).take(limit);

    match serde_json::de::from_reader(&mut reader) {
        Err(e) => {
            if e.is_eof() {
                if reader.limit() == 0 {
                    Err(SarifError::new("LimitError", e.to_string()))
                } else {
                    Err(SarifError::new("ReadError", e.to_string()))
                }
            } else {
                Err(SarifError::new("ParseError", e.to_string()))
            }
        }
        Ok(document) => {
            if validate {
                if let Err(errors) = SCHEMA.validate(&document) {
                    return Err(SarifError::new("ValidateError", get_message(errors)));
                };
            }
            return Ok(get_data(&document));
        }
    }
}

#[no_mangle]
pub extern "C" fn sarif_free(s: *mut c_char) {
    unsafe {
        if s.is_null() {
            return;
        }
        let _ = CString::from_raw(s);
    };
}

#[no_mangle]
extern "C" fn sarif_parse(data: *const u8, length: usize, validate: bool, limit: u64) ->  *mut c_char {
    let zip = unsafe {
        assert!(!data.is_null());

        std::slice::from_raw_parts(data, length)
    };

    let result = match parse(zip, validate, limit) {
        Err(e) => {
            json!([1, [e.klass, e.description]])
        }
        Ok(data) => {
            json!([0, data])
        }
    };

    let c_str = CString::new(result.to_string()).unwrap();
    c_str.into_raw()
}
