extern crate dxcc;

#[test]
fn test_to7ir() {
    let dxcc = dxcc::Dxcc::load().unwrap();
    let result = dxcc.lookup("TO7IR").unwrap();
    assert_eq!(result.dxcc, 63);
    assert_eq!(result.prefix, "FY");
}

#[test]
fn test_ex8q() {
    let dxcc = dxcc::Dxcc::load().unwrap();
    let result = dxcc.lookup("EX8Q").unwrap();
    assert_eq!(result.dxcc, 135);
    assert_eq!(result.ituz, 31);
}

#[test]
fn test_9m6_oh2yy() {
    let dxcc = dxcc::Dxcc::load().unwrap();
    let result = dxcc.lookup("9M6/OH2YY").unwrap();
    assert_eq!(result.dxcc, 247);
}

#[test]
fn test_yg8abc() {
    let dxcc = dxcc::Dxcc::load().unwrap();
    let result = dxcc.lookup("YG8ABC").unwrap();
    assert_eq!(result.dxcc, 327);
    assert_eq!(result.ituz, 54);
}

#[test]
fn test_3o0abc() {
    let dxcc = dxcc::Dxcc::load().unwrap();
    let result = dxcc.lookup("3O0ABC").unwrap();
    assert_eq!(result.dxcc, 318);
    assert_eq!(result.cqz, 23);
    assert_eq!(result.ituz, 42);
}

#[test]
fn test_p50abc() {
    let dxcc = dxcc::Dxcc::load().unwrap();
    let result = dxcc.lookup("P50ABC").unwrap();
    assert_eq!(result.dxcc, 344);
    assert_eq!(result.cqz, 25);
    assert_eq!(result.ituz, 44);
    assert_eq!(result.cont, "AS");
}

#[test]
fn test_q0a() {
    let dxcc = dxcc::Dxcc::load().unwrap();
    let result = dxcc.lookup("Q0A");
    assert!(result.is_none());
}
