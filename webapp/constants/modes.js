app.constant("Modes", [
    {name: "CW"},
    {name: "SSB", rst: "59", submodes: [
        {name: "LSB"},
        {name: "USB"}
    ]},
    {name: "AM", rst: "59"},
    {name: "FM", rst: "59"},
    {name: "PSK", submodes: [
    {name: "PSK31"},
    {name: "PSK63"},
    {name: "PSK63F"},
    {name: "PSK125"},
    {name: "PSK250"},
    {name: "PSK500"},
    {name: "PSK1000"},
    {name: "QPSK31"},
    {name: "QPSK63"},
    {name: "QPSK125"},
    {name: "QPSK250"},
    {name: "QPSK500"}
    ]},
    {name: "RTTY"},
    {name: "MFSK", submodes: [
        {name: "MFSK4"},
        {name: "MFSK8"},
        {name: "MFSK11"},
        {name: "MFSK16"},
        {name: "MFSK22"},
        {name: "MFSK31"},
        {name: "MFSK32"}
    ]},
    {name: "OLIVIA", submodes: [
        {name: "OLIVIA 4/125"},
        {name: "OLIVIA 4/250"},
        {name: "OLIVIA 8/250"},
        {name: "OLIVIA 8/500"},
        {name: "OLIVIA 16/500"},
        {name: "OLIVIA 16/1000"},
        {name: "OLIVIA 32/1000"}
    ]},
    {name: "JT65", rst: "-1", submodes: [
        {name: "JT65A"},
        {name: "JT65B"},
        {name: "JT65B2"},
        {name: "JT65C"},
        {name: "JT65C2"}
    ]},
    {name: "JT9", rst: "-1", submodes: [
        {name: "JT9-1"},
        {name: "JT9-1"},
        {name: "JT9-2"},
        {name: "JT9-5"},
        {name: "JT9-10"},
        {name: "JT9-30"}
    ]},
    {name: "HELL", submodes: [
        {name: "FMHELL"},
        {name: "FSKHELL"},
        {name: "HELL80"},
        {name: "HFSK"},
        {name: "PSKHELL"}
    ]},
    {name: "CONTESTIA"},
    {name: "DOMINO", submodes: [
        {name: "DOMINOEX"},
        {name: "DOMINOF"},
    ]},
    {name: "MT63"},
    {name: "FSK441"},
    {name: "DIGITALVOICE", rst: "59"},
    {name: "DSTAR", rst: "59"},
    {name: "PKT"},
    {name: "ATV"},
    {name: "SSTV"}
]);
