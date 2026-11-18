# Upstream attribution

This JavaScript adaptation uses the lexical sandhi search from
[`sandhi_analyzer.py`](https://github.com/kmadathil/sanskrit_parser/blob/a31ff41cc0869201007ca87a01aaee574ebe01b1/sanskrit_parser/parser/sandhi_analyzer.py)
and the path ordering from `SandhiGraph.find_all_paths` in
[`datastructures.py`](https://github.com/kmadathil/sanskrit_parser/blob/a31ff41cc0869201007ca87a01aaee574ebe01b1/sanskrit_parser/parser/datastructures.py).
Both files credit Karthik Madathil (@kmadathil).

Copyright (c) 2017 Karthikeyan Madathil

The upstream revision is [`a31ff41cc0869201007ca87a01aaee574ebe01b1`](https://github.com/kmadathil/sanskrit_parser/commit/a31ff41cc0869201007ca87a01aaee574ebe01b1).
The unmodified upstream MIT license is included in [LICENSE](LICENSE).

This adaptation receives sandhi proposals and lexical checks through callbacks.
It bounds the search by word count and result count, keeps equal-length paths
in proposal order, and omits repeated paths and remainder cycles. The
distribution contains the JavaScript search, this notice, and the MIT license.

## JavaScript port notice

Copyright (c) 2026 Zeev Belkin

This notice applies to original JavaScript port contributions under the MIT
terms included in [LICENSE](LICENSE).
