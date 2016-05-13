defmodule DXCCTest do
  use ExUnit.Case

  test "dxcc to7ir" do
    result = DXCC.lookup("TO7IR")
    assert result[:dxcc] == 63
    assert result[:prefix] == "FY"
  end

  test "dxcc ex8q" do
    result = DXCC.lookup("EX8Q")
    assert result[:dxcc] == 135
    assert result[:ituz] == 31
  end

  test "dxcc 9m6/oh2yy" do
    result = DXCC.lookup("9M6/OH2YY")
    assert result[:dxcc] == 247
  end

  test "dxcc yg8abc" do
    result = DXCC.lookup("YG8ABC")
    assert result[:dxcc] == 327
    assert result[:ituz] == 54
  end

  test "dxcc 3o0abc" do
    result = DXCC.lookup("3O0ABC")
    assert result[:dxcc] == 318
    assert result[:cqz] == 23
    assert result[:ituz] == 42
  end

  test "dxcc p50abc" do
    result = DXCC.lookup("P50ABC")
    assert result[:dxcc] == 344
    assert result[:cqz] == 25
    assert result[:ituz] == 44
    assert result[:cont] == "AS"
  end

  test "dxcc q0a" do
    result = DXCC.lookup("Q0A")
    assert result == nil
  end
end
